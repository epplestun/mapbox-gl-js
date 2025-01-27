'use strict';

var Canvas = require('../util/canvas');
var util = require('../util/util');
var browser = require('../util/browser');
var Evented = require('../util/evented');
var DOM = require('../util/dom');

var Style = require('../style/style');
var AnimationLoop = require('../style/animation_loop');
var Painter = require('../render/painter');

var Transform = require('../geo/transform');
var Hash = require('./hash');

var Interaction = require('./interaction');

var Camera = require('./camera');
var LngLat = require('../geo/lng_lat');
var LngLatBounds = require('../geo/lng_lat_bounds');
var Point = require('point-geometry');
var Attribution = require('./control/attribution');

var defaultMinZoom = 0;
var defaultMaxZoom = 20;
/**
 * Options common to Map#addClass, Map#removeClass, and Map#setClasses, controlling
 * whether or not to smoothly transition property changes triggered by the class change.
 *
 * @typedef {Object} StyleOptions
 * @property {boolean} transition
 */

/**
 * Creates a map instance.
 * @class Map
 * @param {Object} options
 * @param {string|Element} options.container HTML element to initialize the map in (or element id as string)
 * @param {number} [options.minZoom=0] Minimum zoom of the map
 * @param {number} [options.maxZoom=20] Maximum zoom of the map
 * @param {Object|string} [options.style] Map style. This must be an an object conforming to the schema described in the [style reference](https://mapbox.com/mapbox-gl-style-spec/), or a URL to a JSON style. To load a style from the Mapbox API, you can use a URL of the form `mapbox://styles/:owner/:style`, where `:owner` is your Mapbox account name and `:style` is the style ID. Or you can use one of the predefined Mapbox styles:
 *   * `mapbox://styles/mapbox/basic-v8` - Simple and flexible starting template.
 *   * `mapbox://styles/mapbox/bright-v8` - Template for complex custom basemaps.
 *   * `mapbox://styles/mapbox/streets-v8` - A ready-to-use basemap, perfect for minor customization or incorporating your own data.
 *   * `mapbox://styles/mapbox/light-v8` - Subtle light backdrop for data vizualizations.
 *   * `mapbox://styles/mapbox/dark-v8` - Subtle dark backdrop for data vizualizations.
 * @param {boolean} [options.hash=false] If `true`, the map will track and update the page URL according to map position
 * @param {boolean} [options.interactive=true] If `false`, no mouse, touch, or keyboard listeners are attached to the map, so it will not respond to input
 * @param {number} [options.bearingSnap=7] Snap to north threshold in degrees.
 * @param {Array} [options.classes] Style class names with which to initialize the map
 * @param {boolean} [options.attributionControl=true] If `true`, an attribution control will be added to the map.
 * @param {boolean} [options.failIfMajorPerformanceCaveat=false] If `true`, map creation will fail if the implementation determines that the performance of the created WebGL context would be dramatically lower than expected.
 * @param {boolean} [options.preserveDrawingBuffer=false] If `true`, The maps canvas can be exported to a PNG using `map.getCanvas().toDataURL();`. This is false by default as a performance optimization.
 * @param {LngLatBounds|Array<Array<number>>} [options.maxBounds] If set, the map is constrained to the given bounds.
 * @param {boolean} [options.scrollZoom=true] If `true`, enable the "scroll to zoom" interaction (see `ScrollZoomHandler`)
 * @param {boolean} [options.boxZoom=true] If `true`, enable the "box zoom" interaction (see `BoxZoomHandler`)
 * @param {boolean} [options.dragRotate=true] If `true`, enable the "drag to rotate" interaction (see `DragRotateHandler`).
 * @param {boolean} [options.dragPan=true] If `true`, enable the "drag to pan" interaction (see `DragPanHandler`).
 * @param {boolean} [options.keyboard=true] If `true`, enable keyboard shortcuts (see `KeyboardHandler`).
 * @param {boolean} [options.doubleClickZoom=true] If `true`, enable the "double click to zoom" interaction (see `DoubleClickZoomHandler`).
 * @param {boolean} [options.touchZoomRotate=true] If `true`, enable the "pinch to rotate and zoom" interaction (see `TouchZoomRotateHandler`).
 * @example
 * var map = new mapboxgl.Map({
 *   container: 'map',
 *   center: [-122.420679, 37.772537],
 *   zoom: 13,
 *   style: style_object,
 *   hash: true
 * });
 */
var Map = module.exports = function(options) {

    options = this.options = util.inherit(this.options, options);

    this.animationLoop = new AnimationLoop();
    this.transform = new Transform(options.minZoom, options.maxZoom);

    if (options.maxBounds) {
        this.setMaxBounds(options.maxBounds);
    }

    util.bindAll([
        '_forwardStyleEvent',
        '_forwardSourceEvent',
        '_forwardLayerEvent',
        '_forwardTileEvent',
        '_onStyleLoad',
        '_onStyleChange',
        '_onSourceAdd',
        '_onSourceRemove',
        '_onSourceUpdate',
        '_onWindowResize',
        'onError',
        '_update',
        '_render'
    ], this);

    this._setupContainer();
    this._setupPainter();

    this.on('move', this._update.bind(this, false));
    this.on('zoom', this._update.bind(this, true));
    this.on('moveend', function() {
        this.animationLoop.set(300); // text fading
        this._rerender();
    }.bind(this));

    if (typeof window !== 'undefined') {
        window.addEventListener('resize', this._onWindowResize, false);
    }

    this.interaction = new Interaction(this);

    if (options.interactive) {
        this.interaction.enable();
    }

    this._hash = options.hash && (new Hash()).addTo(this);
    // don't set position from options if set through hash
    if (!this._hash || !this._hash._onHashChange()) {
        this.jumpTo(options);
    }

    this.sources = {};
    this.stacks = {};
    this._classes = {};

    this.resize();

    if (options.classes) this.setClasses(options.classes);
    if (options.style) this.setStyle(options.style);
    if (options.attributionControl) this.addControl(new Attribution(options.attributionControl));

    this.on('style.error', this.onError);
    this.on('source.error', this.onError);
    this.on('tile.error', this.onError);
    this.on('layer.error', this.onError);
};

util.extend(Map.prototype, Evented);
util.extend(Map.prototype, Camera.prototype);
util.extend(Map.prototype, /** @lends Map.prototype */{

    options: {
        center: [0, 0],
        zoom: 0,
        bearing: 0,
        pitch: 0,

        minZoom: defaultMinZoom,
        maxZoom: defaultMaxZoom,

        interactive: true,

        scrollZoom: true,
        boxZoom: true,
        dragRotate: true,
        dragPan: true,
        keyboard: true,
        doubleClickZoom: true,
        touchZoomRotate: true,

        bearingSnap: 7,

        hash: false,

        attributionControl: true,

        failIfMajorPerformanceCaveat: false,
        preserveDrawingBuffer: false
    },

    /**
     * Adds a control to the map, calling `control.addTo(this)`.
     *
     * @param {Control} control
     * @returns {Map} `this`
     */
    addControl: function(control) {
        control.addTo(this);
        return this;
    },

    /**
     * Adds a style class to a map
     *
     * @param {string} klass name of style class
     * @param {StyleOptions} [options]
     * @fires change
     * @returns {Map} `this`
     */
    addClass: function(klass, options) {
        if (this._classes[klass]) return;
        this._classes[klass] = true;
        if (this.style) this.style._cascade(this._classes, options);
    },

    /**
     * Removes a style class from a map
     *
     * @param {string} klass name of style class
     * @param {StyleOptions} [options]
     * @fires change
     * @returns {Map} `this`
     */
    removeClass: function(klass, options) {
        if (!this._classes[klass]) return;
        delete this._classes[klass];
        if (this.style) this.style._cascade(this._classes, options);
    },

    /**
     * Helper method to add more than one class
     *
     * @param {Array<string>} klasses An array of class names
     * @param {StyleOptions} [options]
     * @fires change
     * @returns {Map} `this`
     */
    setClasses: function(klasses, options) {
        this._classes = {};
        for (var i = 0; i < klasses.length; i++) {
            this._classes[klasses[i]] = true;
        }
        if (this.style) this.style._cascade(this._classes, options);
    },

    /**
     * Check whether a style class is active
     *
     * @param {string} klass Name of style class
     * @returns {boolean}
     */
    hasClass: function(klass) {
        return !!this._classes[klass];
    },

    /**
     * Return an array of the current active style classes
     *
     * @returns {boolean}
     */
    getClasses: function() {
        return Object.keys(this._classes);
    },

    /**
     * Detect the map's new width and height and resize it.
     *
     * @returns {Map} `this`
     */
    resize: function() {
        var width = 0, height = 0;

        if (this._container) {
            width = this._container.offsetWidth || 400;
            height = this._container.offsetHeight || 300;
        }

        this._canvas.resize(width, height);
        this.transform.resize(width, height);
        this.painter.resize(width, height);

        return this
            .fire('movestart')
            .fire('move')
            .fire('resize')
            .fire('moveend');
    },

    /**
     * Get the map's geographical bounds.
     *
     * @returns {LngLatBounds}
     */
    getBounds: function() {
        var bounds = new LngLatBounds(
            this.transform.pointLocation(new Point(0, 0)),
            this.transform.pointLocation(this.transform.size));

        if (this.transform.angle || this.transform.pitch) {
            bounds.extend(this.transform.pointLocation(new Point(this.transform.size.x, 0)));
            bounds.extend(this.transform.pointLocation(new Point(0, this.transform.size.y)));
        }

        return bounds;
    },

    /**
     * Set constraint on the map's geographical bounds. Pan or zoom operations that would result in
     * displaying regions that fall outside of the bounds instead result in displaying the map at the
     * closest point and/or zoom level of the requested operation that is within the max bounds.
     *
     * @param {LngLatBounds | Array<Array<number>> | null | undefined} lnglatbounds Desired max bounds of the map. If null or undefined, function removes any bounds constraints on the map.
     * @returns {Map} `this`
     */
    setMaxBounds: function (lnglatbounds) {
        if (lnglatbounds) {
            var b = LngLatBounds.convert(lnglatbounds);
            this.transform.lngRange = [b.getWest(), b.getEast()];
            this.transform.latRange = [b.getSouth(), b.getNorth()];
            this.transform._constrain();
            this._update();
        } else if (lnglatbounds === null || lnglatbounds === undefined) {
            this.transform.lngRange = [];
            this.transform.latRange = [];
            this._update();
        }
        return this;

    },
    /**
     * Set the map's minimum zoom level, and zooms map to that level if it is currently below it. If no parameter provided, unsets the current minimum zoom (sets it to 0)
     * @param {zoom} any number between 0 and 20
     * @returns {Map} `this`
     */
    setMinZoom: function(minZoom) {

        minZoom = minZoom === null || minZoom === undefined ? defaultMinZoom : minZoom;

        if (minZoom >= defaultMinZoom && minZoom <= this.options.maxZoom) {
            this.transform.minZoom = minZoom;
            this._update();

            if (this.getZoom() < minZoom) this.setZoom(minZoom);

            return this;
        }

        else throw new Error('minZoom must be between ' + defaultMinZoom + ' and the current maxZoom, inclusive');
    },

    /**
     * Set the map's maximum zoom level, and zooms map to that level if it is currently above it. If no parameter provided, unsets the current maximum zoom (sets it to 20)
     * @param {zoom} any number between 0 and 20
     * @returns {Map} `this`
     */
    setMaxZoom: function(maxZoom) {

        maxZoom = maxZoom === null || maxZoom === undefined ? defaultMaxZoom : maxZoom;

        if (maxZoom >= this.options.minZoom && maxZoom <= defaultMaxZoom) {
            this.transform.maxZoom = maxZoom;
            this._update();

            if (this.getZoom() > maxZoom) this.setZoom(maxZoom);

            return this;
        }

        else throw new Error('maxZoom must be between the current minZoom and ' + defaultMaxZoom + ', inclusive');
    },
    /**
     * Get pixel coordinates (relative to map container) given a geographical location
     *
     * @param {LngLat} lnglat
     * @returns {Object} `x` and `y` coordinates
     */
    project: function(lnglat) {
        return this.transform.locationPoint(LngLat.convert(lnglat));
    },

    /**
     * Get geographical coordinates given pixel coordinates
     *
     * @param {Array<number>} point [x, y] pixel coordinates
     * @returns {LngLat}
     */
    unproject: function(point) {
        return this.transform.pointLocation(Point.convert(point));
    },

    /**
     * Query features at a point, or within a certain radius thereof.
     *
     * To use this method, you must set the style property `"interactive": true` on layers you wish to query.
     *
     * @param {Array<number>} point [x, y] pixel coordinates
     * @param {Object} params
     * @param {number} [params.radius=0] Radius in pixels to search in
     * @param {string|Array<string>} [params.layer] Only return features from a given layer or layers
     * @param {string} [params.type] Either `raster` or `vector`
     * @param {boolean} [params.includeGeometry=false] If `true`, geometry of features will be included in the results at the expense of a much slower query time.
     * @param {featuresCallback} callback function that receives the results
     *
     * @returns {Map} `this`
     *
     * @example
     * map.featuresAt([10, 20], { radius: 10 }, function(err, features) {
     *   console.log(features);
     * });
     */
    featuresAt: function(point, params, callback) {
        var location = this.unproject(point).wrap();
        var coord = this.transform.locationCoordinate(location);
        this.style.featuresAt(coord, params, callback);
        return this;
    },

    /**
     * Query features within a rectangle.
     *
     * To use this method, you must set the style property `"interactive": true` on layers you wish to query.
     *
     * @param {Array<Point>|Array<Array<number>>} [bounds] Coordinates of opposite corners of bounding rectangle, in pixel coordinates. Optional: use entire viewport if omitted.
     * @param {Object} params
     * @param {string|Array<string>} [params.layer] Only return features from a given layer or layers
     * @param {string} [params.type] Either `raster` or `vector`
     * @param {boolean} [params.includeGeometry=false] If `true`, geometry of features will be included in the results at the expense of a much slower query time.
     * @param {featuresCallback} callback function that receives the results
     *
     * @returns {Map} `this`
     *
     * @example
     * map.featuresIn([[10, 20], [30, 50]], { layer: 'my-layer-name' }, function(err, features) {
     *   console.log(features);
     * });
     */
    featuresIn: function(bounds, params, callback) {
        if (typeof callback === 'undefined') {
            callback = params;
            params = bounds;
          // bounds was omitted: use full viewport
            bounds = [
                Point.convert([0, 0]),
                Point.convert([this.transform.width, this.transform.height])
            ];
        }
        bounds = bounds.map(Point.convert.bind(Point));
        bounds = [
            new Point(
            Math.min(bounds[0].x, bounds[1].x),
            Math.min(bounds[0].y, bounds[1].y)
          ),
            new Point(
            Math.max(bounds[0].x, bounds[1].x),
            Math.max(bounds[0].y, bounds[1].y)
          )
        ].map(this.transform.pointCoordinate.bind(this.transform));
        this.style.featuresIn(bounds, params, callback);
        return this;
    },

    /**
     * Apply multiple style mutations in a batch
     *
     * @param {function} work Function which accepts a `StyleBatch` object,
     *      a subset of `Map`, with `addLayer`, `removeLayer`,
     *      `setPaintProperty`, `setLayoutProperty`, `setFilter`,
     *      `setLayerZoomRange`, `addSource`, and `removeSource`
     *
     * @example
     * map.batch(function (batch) {
     *     batch.addLayer(layer1);
     *     batch.addLayer(layer2);
     *     ...
     *     batch.addLayer(layerN);
     * });
     *
     */
    batch: function(work) {
        this.style.batch(work);

        this.style._cascade(this._classes);
        this._update(true);
    },

    /**
     * Replaces the map's style object
     *
     * @param {Object} style A style object formatted as JSON
     * @returns {Map} `this`
     */
    setStyle: function(style) {
        if (this.style) {
            this.style
                .off('load', this._onStyleLoad)
                .off('error', this._forwardStyleEvent)
                .off('change', this._onStyleChange)
                .off('source.add', this._onSourceAdd)
                .off('source.remove', this._onSourceRemove)
                .off('source.load', this._onSourceUpdate)
                .off('source.error', this._forwardSourceEvent)
                .off('source.change', this._onSourceUpdate)
                .off('layer.add', this._forwardLayerEvent)
                .off('layer.remove', this._forwardLayerEvent)
                .off('layer.error', this._forwardLayerEvent)
                .off('tile.add', this._forwardTileEvent)
                .off('tile.remove', this._forwardTileEvent)
                .off('tile.load', this._update)
                .off('tile.error', this._forwardTileEvent)
                .off('tile.stats', this._forwardTileEvent)
                ._remove();

            this.off('rotate', this.style._redoPlacement);
            this.off('pitch', this.style._redoPlacement);
        }

        if (!style) {
            this.style = null;
            return this;
        } else if (style instanceof Style) {
            this.style = style;
        } else {
            this.style = new Style(style, this.animationLoop);
        }

        this.style
            .on('load', this._onStyleLoad)
            .on('error', this._forwardStyleEvent)
            .on('change', this._onStyleChange)
            .on('source.add', this._onSourceAdd)
            .on('source.remove', this._onSourceRemove)
            .on('source.load', this._onSourceUpdate)
            .on('source.error', this._forwardSourceEvent)
            .on('source.change', this._onSourceUpdate)
            .on('layer.add', this._forwardLayerEvent)
            .on('layer.remove', this._forwardLayerEvent)
            .on('layer.error', this._forwardLayerEvent)
            .on('tile.add', this._forwardTileEvent)
            .on('tile.remove', this._forwardTileEvent)
            .on('tile.load', this._update)
            .on('tile.error', this._forwardTileEvent)
            .on('tile.stats', this._forwardTileEvent);

        this.on('rotate', this.style._redoPlacement);
        this.on('pitch', this.style._redoPlacement);

        return this;
    },

    /**
     * Get a style object that can be used to recreate the map's style
     *
     * @returns {Object} style
     */
    getStyle: function() {
        return this.style.serialize();
    },

    /**
     * Add a source to the map style.
     *
     * @param {string} id ID of the source. Must not be used by any existing source.
     * @param {Object} source source specification, following the
     * [Mapbox GL Style Reference](https://www.mapbox.com/mapbox-gl-style-spec/#sources)
     * @fires source.add
     * @returns {Map} `this`
     */
    addSource: function(id, source) {
        this.style.addSource(id, source);
        return this;
    },

    /**
     * Remove an existing source from the map style.
     *
     * @param {string} id ID of the source to remove
     * @fires source.remove
     * @returns {Map} `this`
     */
    removeSource: function(id) {
        this.style.removeSource(id);
        return this;
    },

    /**
     * Return the style source object with the given `id`.
     *
     * @param {string} id source ID
     * @returns {Object}
     */
    getSource: function(id) {
        return this.style.getSource(id);
    },

    /**
     * Add a layer to the map style. The layer will be inserted before the layer with
     * ID `before`, or appended if `before` is omitted.
     * @param {StyleLayer|Object} layer
     * @param {string=} before  ID of an existing layer to insert before
     * @fires layer.add
     * @returns {Map} `this`
     */
    addLayer: function(layer, before) {
        this.style.addLayer(layer, before);
        this.style._cascade(this._classes);
        return this;
    },

    /**
     * Remove the layer with the given `id` from the map. Any layers which refer to the
     * specified layer via a `ref` property are also removed.
     *
     * @param {string} id layer id
     * @throws {Error} if no layer with the given `id` exists
     * @fires layer.remove
     * @returns {Map} `this`
     */
    removeLayer: function(id) {
        this.style.removeLayer(id);
        this.style._cascade(this._classes);
        return this;
    },

    /**
     * Return the style layer object with the given `id`.
     *
     * @param {string} id layer id
     * @returns {?Object} a layer, if one with the given `id` exists
     */
    getLayer: function(id) {
        return this.style.getLayer(id);
    },

    /**
     * Set the filter for a given style layer.
     *
     * @param {string} layer ID of a layer
     * @param {Array} filter filter specification, as defined in the [Style Specification](https://www.mapbox.com/mapbox-gl-style-spec/#types-filter)
     * @returns {Map} `this`
     */
    setFilter: function(layer, filter) {
        this.style.setFilter(layer, filter);
        return this;
    },

    /**
     * Set the zoom extent for a given style layer.
     *
     * @param {string} layerId ID of a layer
     * @param {number} minzoom minimum zoom extent
     * @param {number} maxzoom maximum zoom extent
     * @returns {Map} `this`
     */
    setLayerZoomRange: function(layerId, minzoom, maxzoom) {
        this.style.setLayerZoomRange(layerId, minzoom, maxzoom);
        return this;
    },

    /**
     * Get the filter for a given style layer.
     *
     * @param {string} layer ID of a layer
     * @returns {Array} filter specification, as defined in the [Style Specification](https://www.mapbox.com/mapbox-gl-style-spec/#filter)
     */
    getFilter: function(layer) {
        return this.style.getFilter(layer);
    },

    /**
     * Set the value of a paint property in a given style layer.
     *
     * @param {string} layer ID of a layer
     * @param {string} name name of a paint property
     * @param {*} value value for the paint propery; must have the type appropriate for the property as defined in the [Style Specification](https://www.mapbox.com/mapbox-gl-style-spec/)
     * @param {string=} klass optional class specifier for the property
     * @returns {Map} `this`
     */
    setPaintProperty: function(layer, name, value, klass) {
        this.batch(function(batch) {
            batch.setPaintProperty(layer, name, value, klass);
        });

        return this;
    },

    /**
     * Get the value of a paint property in a given style layer.
     *
     * @param {string} layer ID of a layer
     * @param {string} name name of a paint property
     * @param {string=} klass optional class specifier for the property
     * @returns {*} value for the paint propery
     */
    getPaintProperty: function(layer, name, klass) {
        return this.style.getPaintProperty(layer, name, klass);
    },

    /**
     * Set the value of a layout property in a given style layer.
     *
     * @param {string} layer ID of a layer
     * @param {string} name name of a layout property
     * @param {*} value value for the layout propery; must have the type appropriate for the property as defined in the [Style Specification](https://www.mapbox.com/mapbox-gl-style-spec/)
     * @returns {Map} `this`
     */
    setLayoutProperty: function(layer, name, value) {
        this.batch(function(batch) {
            batch.setLayoutProperty(layer, name, value);
        });

        return this;
    },

    /**
     * Get the value of a layout property in a given style layer.
     *
     * @param {string} layer ID of a layer
     * @param {string} name name of a layout property
     * @param {string=} klass optional class specifier for the property
     * @returns {*} value for the layout propery
     */
    getLayoutProperty: function(layer, name) {
        return this.style.getLayoutProperty(layer, name);
    },

    /**
     * Get the Map's container as an HTML element
     * @returns {HTMLElement} container
     */
    getContainer: function() {
        return this._container;
    },

    /**
     * Get the container for the map `canvas` element.
     *
     * If you want to add non-GL overlays to the map, you should append them to this element. This
     * is the element to which event bindings for map interactivity such as panning and zooming are
     * attached. It will receive bubbled events for child elements such as the `canvas`, but not for
     * map controls.
     *
     * @returns {HTMLElement} container
     */
    getCanvasContainer: function() {
        return this._canvasContainer;
    },

    /**
     * Get the Map's canvas as an HTML canvas
     * @returns {HTMLElement} canvas
     */
    getCanvas: function() {
        return this._canvas.getElement();
    },

    _setupContainer: function() {
        var id = this.options.container;

        var container = this._container = typeof id === 'string' ? document.getElementById(id) : id;
        container.classList.add('mapboxgl-map');

        var canvasContainer = this._canvasContainer = DOM.create('div', 'mapboxgl-canvas-container', container);
        if (this.options.interactive) {
            canvasContainer.classList.add('mapboxgl-interactive');
        }
        this._canvas = new Canvas(this, canvasContainer);

        var controlContainer = this._controlContainer = DOM.create('div', 'mapboxgl-control-container', container);
        var corners = this._controlCorners = {};
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach(function (pos) {
            corners[pos] = DOM.create('div', 'mapboxgl-ctrl-' + pos, controlContainer);
        });
    },

    _setupPainter: function() {
        var gl = this._canvas.getWebGLContext({
            failIfMajorPerformanceCaveat: this.options.failIfMajorPerformanceCaveat,
            preserveDrawingBuffer: this.options.preserveDrawingBuffer
        });

        if (!gl) {
            console.error('Failed to initialize WebGL');
            return;
        }

        this.painter = new Painter(gl, this.transform);
    },

    /**
     * WebGL Context Lost event.
     *
     * @event webglcontextlost
     * @memberof Map
     * @instance
     * @type {Object}
     * @property {Event} originalEvent the original DOM event
     */
    _contextLost: function(event) {
        event.preventDefault();
        if (this._frameId) {
            browser.cancelFrame(this._frameId);
        }
        this.fire("webglcontextlost", {originalEvent: event});
    },

    /**
     * WebGL Context Restored event.
     *
     * @event webglcontextrestored
     * @memberof Map
     * @instance
     * @type {Object}
     */
    _contextRestored: function(event) {
        this._setupPainter();
        this.resize();
        this._update();
        this.fire("webglcontextrestored", {originalEvent: event});
    },

    /**
     * Is this map fully loaded? If the style isn't loaded
     * or it has a change to the sources or style that isn't
     * propagated to its style, return false.
     *
     * @returns {boolean} whether the map is loaded
     */
    loaded: function() {
        if (this._styleDirty || this._sourcesDirty)
            return false;
        if (!this.style || !this.style.loaded())
            return false;
        return true;
    },

    /**
     * Update this map's style and sources, and re-render the map.
     *
     * @param {boolean} updateStyle mark the map's style for reprocessing as
     * well as its sources
     * @returns {Map} this
     * @private
     */
    _update: function(updateStyle) {
        if (!this.style) return this;

        this._styleDirty = this._styleDirty || updateStyle;
        this._sourcesDirty = true;

        this._rerender();

        return this;
    },

    /**
     * Call when a (re-)render of the map is required, e.g. when the
     * user panned or zoomed,f or new data is available.
     * @returns {Map} this
     * @private
     */
    _render: function() {
        if (this.style && this._styleDirty) {
            this._styleDirty = false;
            this.style._recalculate(this.transform.zoom);
        }

        if (this.style && this._sourcesDirty) {
            this._sourcesDirty = false;
            this.style._updateSources(this.transform);
        }

        this.painter.render(this.style, {
            debug: this.debug,
            vertices: this.vertices,
            rotating: this.rotating,
            zooming: this.zooming
        });

        this.fire('render');

        if (this.loaded() && !this._loaded) {
            this._loaded = true;
            this.fire('load');
        }

        this._frameId = null;

        if (!this.animationLoop.stopped()) {
            this._styleDirty = true;
        }

        if (this._sourcesDirty || this._repaint || !this.animationLoop.stopped()) {
            this._rerender();
        }

        return this;
    },

    /**
     * Destroys the map's underlying resources, including web workers and DOM elements. Afterwards,
     * you must not call any further methods on this Map instance.
     *
     * @returns {undefined}
     */
    remove: function() {
        if (this._hash) this._hash.remove();
        browser.cancelFrame(this._frameId);
        this.setStyle(null);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this._onWindowResize, false);
        }
        removeNode(this._canvasContainer);
        removeNode(this._controlContainer);
        this._container.classList.remove('mapboxgl-map');
    },

    /**
     * A default error handler for `style.error`, `source.error`, `layer.error`,
     * and `tile.error` events.
     * It logs the error via `console.error`.
     *
     * @example
     * // Disable the default error handler
     * map.off('style.error', map.onError);
     * map.off('source.error', map.onError);
     * map.off('tile.error', map.onError);
     * map.off('layer.error', map.onError);
     */
    onError: function(e) {
        console.error(e.error);
    },

    _rerender: function() {
        if (this.style && !this._frameId) {
            this._frameId = browser.frame(this._render);
        }
    },

    _forwardStyleEvent: function(e) {
        this.fire('style.' + e.type, util.extend({style: e.target}, e));
    },

    _forwardSourceEvent: function(e) {
        this.fire(e.type, util.extend({style: e.target}, e));
    },

    _forwardLayerEvent: function(e) {
        this.fire(e.type, util.extend({style: e.target}, e));
    },

    _forwardTileEvent: function(e) {
        this.fire(e.type, util.extend({style: e.target}, e));
    },

    _onStyleLoad: function(e) {
        if (this.transform.unmodified) {
            this.jumpTo(this.style.stylesheet);
        }
        this.style._cascade(this._classes, {transition: false});
        this._forwardStyleEvent(e);
    },

    _onStyleChange: function(e) {
        this._update(true);
        this._forwardStyleEvent(e);
    },

    _onSourceAdd: function(e) {
        var source = e.source;
        if (source.onAdd)
            source.onAdd(this);
        this._forwardSourceEvent(e);
    },

    _onSourceRemove: function(e) {
        var source = e.source;
        if (source.onRemove)
            source.onRemove(this);
        this._forwardSourceEvent(e);
    },

    _onSourceUpdate: function(e) {
        this._update();
        this._forwardSourceEvent(e);
    },

    _onWindowResize: function() {
        this.stop().resize()._update();
    }
});


/**
 * Callback to receive results from `Map#featuresAt` and `Map#featuresIn`.
 *
 * Note: because features come from vector tiles or GeoJSON data that is converted to vector tiles internally, the returned features will be:
 *
 * 1. Truncated at tile boundaries.
 * 2. Duplicated across tile boundaries.
 *
 * For example, suppose there is a highway running through your rectangle in a `featuresIn` query. `featuresIn` will only give you the parts of the highway feature that lie within the map tiles covering your rectangle, even if the road actually extends into other tiles. Also, the portion of the highway within each map tile will come back as a separate feature.
 *
 * @callback featuresCallback
 * @param {?Error} err - An error that occurred during query processing, if any. If this parameter is non-null, the `features` parameter will be null.
 * @param {?Array<Object>} features - An array of [GeoJSON](http://geojson.org/) features matching the query parameters. The GeoJSON properties of each feature are taken from the original source. Each feature object also contains a top-level `layer` property whose value is an object representing the style layer to which the feature belongs. Layout and paint properties in this object contain values which are fully evaluated for the given zoom level and feature.
 */


util.extendAll(Map.prototype, /** @lends Map.prototype */{

    /**
     * Enable debugging mode
     *
     * @name debug
     * @type {boolean}
     */
    _debug: false,
    get debug() { return this._debug; },
    set debug(value) {
        if (this._debug === value) return;
        this._debug = value;
        this._update();
    },

    /**
     * Show collision boxes: useful for debugging label placement
     * in styles.
     *
     * @name collisionDebug
     * @type {boolean}
     */
    _collisionDebug: false,
    get collisionDebug() { return this._collisionDebug; },
    set collisionDebug(value) {
        if (this._collisionDebug === value) return;
        this._collisionDebug = value;
        this.style._redoPlacement();
    },

    /**
     * Enable continuous repaint to analyze performance
     *
     * @name repaint
     * @type {boolean}
     */
    _repaint: false,
    get repaint() { return this._repaint; },
    set repaint(value) { this._repaint = value; this._update(); },

    // show vertices
    _vertices: false,
    get vertices() { return this._vertices; },
    set vertices(value) { this._vertices = value; this._update(); }
});

function removeNode(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
