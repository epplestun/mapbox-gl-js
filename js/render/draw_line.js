'use strict';

var browser = require('../util/browser');
var mat2 = require('gl-matrix').mat2;
var util = require('../util/util');

/**
 * Draw a line. Under the hood this will read elements from
 * a tile, dash textures from a lineAtlas, and style properties from a layer.
 * @param {Object} painter
 * @param {Object} layer
 * @param {Object} posMatrix
 * @param {Tile} tile
 * @returns {undefined} draws with the painter
 * @private
 */
module.exports = function drawLine(painter, source, layer, coords) {
    if (painter.isOpaquePass) return;
    painter.setDepthSublayer(0);
    painter.depthMask(false);

    var hasData = coords.some(function(coord) {
        var bucket = source.getTile(coord).getBucket(layer);
        return bucket && bucket.elementGroups.line;
    });
    if (!hasData) return;

    var gl = painter.gl;
    gl.enable(gl.STENCIL_TEST);

    // don't draw zero-width lines
    if (layer.paint['line-width'] <= 0) return;

    // the distance over which the line edge fades out.
    // Retina devices need a smaller distance to avoid aliasing.
    var antialiasing = 1 / browser.devicePixelRatio;

    var blur = layer.paint['line-blur'] + antialiasing;
    var edgeWidth = layer.paint['line-width'] / 2;
    var inset = -1;
    var offset = 0;
    var shift = 0;

    if (layer.paint['line-gap-width'] > 0) {
        inset = layer.paint['line-gap-width'] / 2 + antialiasing * 0.5;
        edgeWidth = layer.paint['line-width'];

        // shift outer lines half a pixel towards the middle to eliminate the crack
        offset = inset - antialiasing / 2;
    }

    var outset = offset + edgeWidth + antialiasing / 2 + shift;
    var color = util.premultiply(layer.paint['line-color'], layer.paint['line-opacity']);

    var tr = painter.transform;

    var antialiasingMatrix = mat2.create();
    mat2.scale(antialiasingMatrix, antialiasingMatrix, [1, Math.cos(tr._pitch)]);
    mat2.rotate(antialiasingMatrix, antialiasingMatrix, painter.transform.angle);

    // calculate how much longer the real world distance is at the top of the screen
    // than at the middle of the screen.
    var topedgelength = Math.sqrt(tr.height * tr.height / 4  * (1 + tr.altitude * tr.altitude));
    var x = tr.height / 2 * Math.tan(tr._pitch);
    var extra = (topedgelength + x) / topedgelength - 1;

    var dasharray = layer.paint['line-dasharray'];
    var image = layer.paint['line-pattern'];
    var shader, posA, posB, imagePosA, imagePosB;

    if (dasharray) {
        shader = painter.linesdfpatternShader;
        gl.switchShader(shader);

        gl.uniform2fv(shader.u_linewidth, [ outset, inset ]);
        gl.uniform1f(shader.u_blur, blur);
        gl.uniform4fv(shader.u_color, color);

        posA = painter.lineAtlas.getDash(dasharray.from, layer.layout['line-cap'] === 'round');
        posB = painter.lineAtlas.getDash(dasharray.to, layer.layout['line-cap'] === 'round');
        painter.lineAtlas.bind(gl);

        gl.uniform1f(shader.u_tex_y_a, posA.y);
        gl.uniform1f(shader.u_tex_y_b, posB.y);
        gl.uniform1i(shader.u_image, 0);
        gl.uniform1f(shader.u_mix, dasharray.t);

        gl.uniform1f(shader.u_extra, extra);
        gl.uniform1f(shader.u_offset, -layer.paint['line-offset']);
        gl.uniformMatrix2fv(shader.u_antialiasingmatrix, false, antialiasingMatrix);

    } else if (image) {
        imagePosA = painter.spriteAtlas.getPosition(image.from, true);
        imagePosB = painter.spriteAtlas.getPosition(image.to, true);
        if (!imagePosA || !imagePosB) return;

        painter.spriteAtlas.bind(gl, true);

        shader = painter.linepatternShader;
        gl.switchShader(shader);

        gl.uniform2fv(shader.u_linewidth, [ outset, inset ]);
        gl.uniform1f(shader.u_blur, blur);
        gl.uniform2fv(shader.u_pattern_tl_a, imagePosA.tl);
        gl.uniform2fv(shader.u_pattern_br_a, imagePosA.br);
        gl.uniform2fv(shader.u_pattern_tl_b, imagePosB.tl);
        gl.uniform2fv(shader.u_pattern_br_b, imagePosB.br);
        gl.uniform1f(shader.u_fade, image.t);
        gl.uniform1f(shader.u_opacity, layer.paint['line-opacity']);

        gl.uniform1f(shader.u_extra, extra);
        gl.uniform1f(shader.u_offset, -layer.paint['line-offset']);
        gl.uniformMatrix2fv(shader.u_antialiasingmatrix, false, antialiasingMatrix);

    } else {
        shader = painter.lineShader;
        gl.switchShader(shader);

        gl.uniform2fv(shader.u_linewidth, [ outset, inset ]);
        gl.uniform1f(shader.u_blur, blur);
        gl.uniform1f(shader.u_extra, extra);
        gl.uniform1f(shader.u_offset, -layer.paint['line-offset']);
        gl.uniformMatrix2fv(shader.u_antialiasingmatrix, false, antialiasingMatrix);
        gl.uniform4fv(shader.u_color, color);
    }

    for (var k = 0; k < coords.length; k++) {
        var coord = coords[k];
        var tile = source.getTile(coord);
        var bucket = tile.getBucket(layer);
        if (!bucket) continue;
        var elementGroups = bucket.elementGroups.line;
        if (!elementGroups) continue;

        painter.enableTileClippingMask(coord);

        // set uniforms that are different for each tile
        var posMatrix = painter.translatePosMatrix(painter.calculatePosMatrix(coord, source.maxzoom), tile, layer.paint['line-translate'], layer.paint['line-translate-anchor']);

        gl.setPosMatrix(posMatrix);
        gl.setExMatrix(painter.transform.exMatrix);
        var ratio = 1 / tile.pixelsToTileUnits(1, painter.transform.zoom);

        if (dasharray) {
            var widthA = posA.width * dasharray.fromScale;
            var widthB = posB.width * dasharray.toScale;
            var scaleA = [1 / tile.pixelsToTileUnits(widthA, painter.transform.tileZoom), -posA.height / 2];
            var scaleB = [1 / tile.pixelsToTileUnits(widthB, painter.transform.tileZoom), -posB.height / 2];
            var gamma = painter.lineAtlas.width / (Math.min(widthA, widthB) * 256 * browser.devicePixelRatio) / 2;
            gl.uniform1f(shader.u_ratio, ratio);
            gl.uniform2fv(shader.u_patternscale_a, scaleA);
            gl.uniform2fv(shader.u_patternscale_b, scaleB);
            gl.uniform1f(shader.u_sdfgamma, gamma);

        } else if (image) {
            gl.uniform1f(shader.u_ratio, ratio);
            gl.uniform2fv(shader.u_pattern_size_a, [
                tile.pixelsToTileUnits(imagePosA.size[0] * image.fromScale, painter.transform.tileZoom),
                imagePosB.size[1]
            ]);
            gl.uniform2fv(shader.u_pattern_size_b, [
                tile.pixelsToTileUnits(imagePosB.size[0] * image.toScale, painter.transform.tileZoom),
                imagePosB.size[1]
            ]);

        } else {
            gl.uniform1f(shader.u_ratio, ratio);
        }

        bucket.bindBuffers('line', gl);

        for (var i = 0; i < elementGroups.length; i++) {
            var group = elementGroups[i];
            bucket.setAttribPointers('line', gl, shader, group.vertexOffset);

            var count = group.elementLength * 3;
            gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, group.elementOffset);
        }
    }

};
