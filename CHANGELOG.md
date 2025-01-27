## 0.15.0 (March 1 2016)

#### New Features & Improvements

Add `ImageSource#setCoordinates` and `VideoSource#setCoordinates` (#2184)

#### Bugfixes

Fix flickering on raster layers (#2211)
Fix browser hang when zooming quickly on raster layers (#2211)

## 0.14.3 (Feb 25 2016)

#### New Features & Improvements

Improve responsiveness of zooming out by using cached parent tiles (#2168)
Improve contextual clues on style API validation (#2170)
Improve performance of methods including `setData` (#2174)

#### Bugfixes

Fix incorrectly sized line dashes (#2099)
Fix bug in which `in` feature filter drops features (#2166)
Fix bug preventing `Map#load` from firing when tile "Not Found" errors occured (#2176)
Fix rendering artifacts on mobile GPUs (#2117)

## 0.14.2 (Feb 19 2016)

#### Bugfixes

Look for loaded parent tiles in cache
Set tile cache size based on viewport size (#2137)
Fix tile render order for layer-by-layer
Remove source update throttling (#2139)
Make panning while zooming more linear (#2070)
Round points created during bucket creation (#2067)
Correct bounds for a rotated or tilted map (#1842)
Fix overscaled featuresAt (#2103)
Allow using `tileSize: 512` as a switch to trade retina support for 512px raster tiles
Fix the serialization of paint classes (#2107)
Fixed bug where unsetting style properties could mutate the value of other style properties (#2105)
Less slanted dashed lines near sharp corners (#967)
Fire map#load if no initial style is set (#2042)

## 0.14.1 (Feb 10 2016)

#### Bugfixes

Fix incorrectly rotated symbols along lines near tile boundries (#2062)
Fix broken rendering when a fill layer follows certain symbol layers (#2092)

## 0.14.0 (Feb 8 2016)

#### Breaking Changes

Switch `GeoJSONSource` clustering options from being measured in extent-units to pixels (#2026)

#### New Features & Improvements

Improved error message for invalid colors (#2006)
Added support for tiles with variable extents (#2010)
Improved `filter` performance and maximum size (#2024)
Changed circle rendering such that all geometry nodes are drawn, not just the geometry's outer ring (#2027)
Added `Map#getStyle` method (#1982)

#### Bugfixes

Fixed bug causing WebGL contexts to be "used up" by calling `mapboxgl.supported()` (#2018)
Fixed non-deterministic symbol z-order sorting (#2023)
Fixed garbled labels while zooming (#2012)
Fixed icon jumping when touching trackpad with two fingers (#1990)
Fixed overzoomed collision debug labels (#2033)
Fixed dashes sliding along their line during zooming (#2039)
Fixed overscaled `minzoom` setting for GeoJSON sources (#1651)
Fixed overly-strict function validation for duplicate stops (#2075)
Fixed crash due to `performance.now` not being present on some browsers (#2056)
Fixed the unsetting of paint properties (#2037)
Fixed bug causing multiple interaction handler event listeners to be attached (#2069)
Fixed bug causing only a single debug box to be drawn (#2034)

## 0.13.1 (Jan 27 2016)

#### Bugfixes

Fixed broken npm package due to outdated bundled modules

## 0.13.0 (Jan 27 2016)

#### Bugfixes

Fixed easeTo pan, zoom, and rotate when initial rotation != 0 (#1950)
Fixed rendering of tiles with an extent != 4096 (#1952)
Fixed missing icon collision boxes (#1978)
Fixed null `Tile#buffers` errors (#1987)

#### New Features & Improvements

Added `symbol-avoid-edges` style property (#1951)
Improved `symbol-max-angle` check algorithm (#1959)
Added marker clustering! (#1931)
Added zoomstart, zoom, and zoomend events (#1958)
Disabled drag on mousedown when using boxzoom (#1907)

## 0.12.4 (Jan 19 2016)

#### Bugfixes

Fix elementGroups null value errors (#1933)
Fix some glyph atlas overflow cases (#1923)

## 0.12.3 (Jan 14 2016)

#### API Improvements
Support inline attribution options in map options (#1865)
Improve flyTo options (#1854, #1429)

#### Bugfixes
Fix flickering with overscaled tiles (#1921)
Remove Node.remove calls for IE browser compatibility (#1900)
Match patterns at tile boundaries (#1908)
Fix Tile#positionAt, fix query tests (#1899)
Fix flickering on streets (#1875)
Fix text-max-angle property (#1870)
Fix overscaled line patterns (#1856)
Fix patterns and icons for mismatched pixelRatios (#1851)
Fix missing labels when text size 0 at max zoom (#1809)
Use linear interp when pixel ratios don't match (#1601)
Fix blank areas, flickering in raster layers (#1876, #675)
Fix labels slipping/cropping at tile bounds (#757)

#### UX Improvements
Improve touch handler perceived performance (#1844)

## 0.12.2 (Dec 22 2015)

#### API Improvements

* Support LngLat.convert([w, s, e, n]) (#1812)
* Invalid GeoJSON is now handled better

#### Bugfixes

* Fixed `Popup#addTo` when the popup is already open (#1811)
* Fixed warping when rotating / zooming really fast
* `Map#flyTo` now flies across the antimeridan if shorter (#1853)

## 0.12.1 (Dec 8 2015)

#### Breaking changes

* Reversed the direction of `line-offset` (#1808)
* Renamed `Pinch` interaction handler to `TouchZoomRotate` (#1777)
* Made `Map#update` and `Map#render` private methods (#1798)
* Made `Map#remove` remove created DOM elements (#1789)

#### API Improvements

* Added an method to disable touch rotation (#1777)
* Added a `position` option for `Attribution` (#1689)

#### Bugfixes

* Ensure tile loading errors are properly reported (#1799)
* Ensure re-adding a previously removed pop-up works (#1477)

#### UX Improvements

* Don't round zoom level during double-click interaction (#1640)

## 0.12.0 (Dec 2 2015)

#### API Improvements

* Added `line-offset` style property (#1778)

## 0.11.5 (Dec 1 2015)

#### Bugfixes

* Fixed unstable symbol layer render order when adding / removing layers (#1558)
* Fire map loaded event even if raster tiles have errors
* Fix panning animation during easeTo with zoom change
* Fix pitching animation during flyTo
* Fix pitching animation during easeTo
* Prevent rotation from firing `mouseend` events (#1104)

#### API Improvements

* Fire `mousedown` and `mouseup` events (#1411)
* Fire `movestart` and `moveend` when panning (#1658)
* Added drag events (#1442)
* Request webp images for mapbox:// raster tiles in chrome (#1725)

#### UX Improvements

* Added inertia to map rotation (#620)

## 0.11.4 (Nov 16 2015)

#### Bugfixes

* Fix alpha blending of alpha layers (#1684)

## 0.11.3 (Nov 10 2015)

#### Bugfixes

* Fix GeoJSON rendering and performance (#1685)

#### UX Improvements

* Use SVG assets for UI controls (#1657)
* Zoom out with shift + dblclick (#1666)

## 0.11.2 (Oct 29 2015)

* Misc performance improvements

#### Bugfixes

* Fix sprites on systems with non-integer `devicePixelRatio`s (#1029 #1475 #1476)
* Fix layer minZoom being ignored if not less than source maxZoom
* Fix symbol placement at the start of a line (#1461)
* Fix `raster-opacity` on non-tile sources (#1270)
* Ignore boxzoom on shift-click (#1655)

#### UX Improvements

* Enable line breaks on common punctuation (#1115)

#### API Improvements

* Add toString and toArray methods to LngLat, LngLatBounds (#1571)
* Add `Transform#resize` method
* Add `Map#getLayer` method (#1183)
* Add `Transform#unmodified` property (#1452)
* Propagate WebGL context events (#1612)

## 0.11.1 (Sep 30 2015)

#### Bugfixes

* Add statistics and checkboxes to debug page
* Fix `Map#featuresAt` for non-4096 vector sources (#1529)
* Don't fire `mousemove` on drag-pan
* Fix maxBounds constrains (#1539)
* Fix maxBounds infinite loop (#1538)
* Fix memory leak in worker
* Assert valid `TileCoord`, fix wrap calculation in `TileCoord#cover` (#1483)
* Abort raster tile load if not in viewport (#1490)

#### API Improvements

* Add `Map` event listeners for `mouseup`, `contextmenu` (right click) (#1532)


## 0.11.0 (Sep 11 2015)

#### API Improvements

* Add `Map#featuresIn`: a bounding-box feature query
* Emit stylesheet validation errors (#1436)

#### UX Improvements

* Handle v8 style `center`, `zoom`, `bearing`, `pitch` (#1452)
* Improve circle type styling (#1446)
* Improve dashed and patterned line antialiasing

#### Bugfixes

* Load images in a way that respects Cache-Control headers
* Filter for rtree matches to those crossing bbox
* Log errors by default (#1463)
* Fixed modification of `text-size` via `setLayoutProperty` (#1451)
* Throw on lat > 90 || < -90. (#1443)
* Fix circle clipping bug (#1457)


## 0.10.0 (Aug 21 2015)

#### Breaking changes

* Switched to [longitude, latitude] coordinate order, matching GeoJSON. We anticipate that mapbox-gl-js will be widely used
  with GeoJSON, and in the long term having a coordinate order that is consistent with GeoJSON will lead to less confusion
  and impedance mismatch than will a [latitude, longitude] order.

  The following APIs were renamed:

    * `LatLng` was renamed to `LngLat`
    * `LatLngBounds` was renamed to `LngLatBounds`
    * `Popup#setLatLng` was renamed to `Popup#setLngLat`
    * `Popup#getLatLng` was renamed to `Popup#getLngLat`
    * The `latLng` property of Map events was renamed `lngLat`

  The following APIs now expect array coordinates in [longitude, latitude] order:

    * `LngLat.convert`
    * `LngLatBounds.convert`
    * `Popup#setLngLat`
    * The `center` and `maxBounds` options of the `Map` constructor
    * The arguments to `Map#setCenter`, `Map#fitBounds`, `Map#panTo`, and `Map#project`
    * The `center` option of `Map#jumpTo`, `Map#easeTo`, and `Map#flyTo`
    * The `around` option of `Map#zoomTo`, `Map#rotateTo`, and `Map#easeTo`
    * The `coordinates` properties of video and image sources

* Updated to mapbox-gl-style-spec v8.0.0 ([Changelog](https://github.com/mapbox/mapbox-gl-style-spec/blob/v8.0.0/CHANGELOG.md)). Styles are
  now expected to be version 8. You can use the [gl-style-migrate](https://github.com/mapbox/mapbox-gl-style-lint#migrations)
  utility to update existing styles.

* The format for `mapbox://` style and glyphs URLs has changed. For style URLs, you should now use the format
  `mapbox://styles/:username/:style`. The `:style` portion of the URL no longer contains a username. For font URLs, you
  should now use the format `mapbox://fonts/:username/{fontstack}/{range}.pbf`.
* Mapbox default styles are now hosted via the Styles API rather than www.mapbox.com. You can make use of the Styles API
  with a `mapbox://` style URL pointing to a v8 style, e.g. `mapbox://styles/mapbox/streets-v8`.
* The v8 satellite style (`mapbox://styles/mapbox/satellite-v8`) is now a plain satellite style, and not longer supports labels
  or contour lines via classes. For a labeled satellite style, use `mapbox://styles/mapbox/satellite-hybrid`.

* Removed `mbgl.config.HTTP_URL` and `mbgl.config.FORCE_HTTPS`; https is always used when connecting to the Mapbox API.
* Renamed `mbgl.config.HTTPS_URL` to `mbgl.config.API_URL`.

#### Bugfixes

* Don't draw halo when halo-width is 0 (#1381)
* Reverted shader changes that degraded performance on IE

#### API Improvements

* You can now unset layout and paint properties via the `setLayoutProperty` and `setPaintProperty` APIs
  by passing `undefined` as a property value.
* The `layer` option of `featuresAt` now supports an array of layers.

## 0.9.0 (Jul 29 2015)

* `glyphs` URL now normalizes without the `/v4/` prefix for `mapbox://` urls. Legacy behavior for `mapbox://fontstacks` is still maintained (#1385)
* Expose `geojson-vt` options for GeoJSON sources (#1271)
* bearing snaps to "North" within a tolerance of 7 degrees (#1059)
* Now you can directly mutate the minzoom and maxzoom layer properties with `map.setLayerZoomRange(layerId, minzoom, maxzoom)`
* Exposed `mapboxgl.Control`, a base class used by all UI controls
* Refactored handlers to be individually included in Map options, or enable/disable them individually at runtime, e.g. `map.scrollZoom.disable()`.
* New feature: Batch operations can now be done at once, improving performance for calling multiple style functions: (#1352)

  ```js
  style.batch(function(s) {
      s.addLayer({ id: 'first', type: 'symbol', source: 'streets' });
      s.addLayer({ id: 'second', type: 'symbol', source: 'streets' });
      s.addLayer({ id: 'third', type: 'symbol', source: 'terrain' });
      s.setPaintProperty('first', 'text-color', 'black');
      s.setPaintProperty('first', 'text-halo-color', 'white');
  });
  ```
* Improved documentation
* `featuresAt` performance improvements by exposing `includeGeometry` option
* Better label placement along lines (#1283)
* Improvements to round linejoins on semi-transparent lines (mapbox/mapbox-gl-native#1771)
* Round zoom levels for raster tile loading (2a2aec)
* Source#reload cannot be called if source is not loaded (#1198)
* Events bubble to the canvas container for custom overlays (#1301)
* Move handlers are now bound on mousedown and touchstart events
* map.featuresAt() now works across the dateline

## 0.8.1 (Jun 16 2015)

* No code changes; released only to correct a build issue in 0.8.0.

## 0.8.0 (Jun 15 2015)

#### Breaking changes

* `map.setView(latlng, zoom, bearing)` has been removed. Use
  [`map.jumpTo(options)`](https://www.mapbox.com/mapbox-gl-js/api/#map/jumpto) instead:

  ```js
  map.setView([40, -74.50], 9) // 0.7.0 or earlier
  map.jumpTo({center: [40, -74.50], zoom: 9}); // now
  ```
* [`map.easeTo`](https://www.mapbox.com/mapbox-gl-js/api/#map/easeto) and
  [`map.flyTo`](https://www.mapbox.com/mapbox-gl-js/api/#map/flyto) now accept a single
  options object rather than positional parameters:

  ```js
  map.easeTo([40, -74.50], 9, null, {duration: 400}); // 0.7.0 or earlier
  map.easeTo({center: [40, -74.50], zoom: 9, duration: 400}); // now
  ```
* `mapboxgl.Source` is no longer exported. Use `map.addSource()` instead. See the
  [GeoJSON line](https://www.mapbox.com/mapbox-gl-js/example/geojson-line/) or
  [GeoJSON markers](https://www.mapbox.com/mapbox-gl-js/example/geojson-markers/)
  examples.
* `mapboxgl.util.supported()` moved to [`mapboxgl.supported()`](https://www.mapbox.com/mapbox-gl-js/api/#mapboxgl/supported).

#### UX improvements

* Add perspective rendering (#1049)
* Better and faster labelling (#1079)
* Add touch interactions support on mobile devices (#949)
* Viewport-relative popup arrows (#1065)
* Normalize mousewheel zooming speed (#1060)
* Add proper handling of GeoJSON features that cross the date line (#1275)
* Sort overlapping symbols in the y direction (#470)
* Control buttons are now on a 30 pixel grid (#1143)
* Improve GeoJSON processing performance

#### API Improvements

* Switch to JSDoc for documentation
* Bundling with browserify is now supported
* Validate incoming map styles (#1054)
* Add `Map` `setPitch` `getPitch`
* Add `Map` `dblclick` event. (#1168)
* Add `Map` `getSource` (660a8c1)
* Add `Map` `setFilter` and `getFilter` (#985)
* Add `Map` `failIfMajorPerformanceCaveat` option (#1082)
* Add `Map` `preserveDrawingBuffer` option (#1232)
* Add `VideoSource` `getVideo()` (#1162)
* Support vector tiles with extents other than 4096 (#1227)
* Use a DOM hierarchy that supports evented overlays (#1217)
* Pass `latLng` to the event object (#1068)

#### UX Bugfixes

* Fix rendering glitch on iOS 8 (#750)
* Fix line triangulation errors (#1120, #992)
* Support unicode range 65280-65535 (#1108)
* Fix cracks between fill patterns (#972)
* Fix angle of icons aligned with lines (37a498a)
* Fix dashed line bug for overscaled tiles (#1132)
* Fix icon artifacts caused by sprite neighbors (#1195)

#### API Bugfixes

* Don't fire spurious `moveend` events on mouseup (#1107)
* Fix a race condition in `featuresAt` (#1220)
* Fix for brittle fontstack name convention (#1070)
* Fix broken `Popup` `setHTML` (#1272)
* Fix an issue with cross-origin image requests (#1269)


## 0.7.0 (Mar 3 2015)

#### Breaking

* Rename `Map` `hover` event to `mousemove`.
* Change `featuresAt` to return GeoJSON objects, including geometry (#1010)
* Remove `Map` `canvas` and `container` properties, add `getCanvas` and `getContainer` methods instead

#### UX Improvements

* Improve line label density
* Add boxzoom interaction (#1038)
* Add keyboard interaction (#1034)
* Faster `GeoJSONSource` `setData` without flickering (#973)

#### API Improvements

* Add Popup component (#325)
* Add layer API (#1022)
* Add filter API (#985)
* More efficient filter API (#1018)
* Accept plain old JS object for `addSource` (#1021)
* Reparse overscaled tiles

#### Bugfixes

* Fix `featuresAt` for LineStrings (#1006)
* Fix `tileSize` argument to `GeoJSON` worker (#987)
* Remove extraneous files from the npm package (#1024)
* Hide "improve map" link in print (#988)


## 0.6.0 (Feb 9 2015)

#### Bugfixes

* Add wrapped padding to sprite for repeating images (#972)
* Clear color buffers before rendering (#966)
* Make line-opacity work with line-image (#970)
* event.toElement fallback for Firefox (#932)
* skip duplicate vertices at ends of lines (#776)
* allow characters outside \w to be used in token
* Clear old tiles when new GeoJSON is loaded (#905)

#### Improvements

* Added `map.setPaintProperty()`, `map.getPaintProperty()`, `map.setLayoutProperty()`, and `map.getLayoutProperty()`.
* Switch to ESLint and more strict code rules (#957)
* Grab 2x raster tiles if retina (#754)
* Support for mapbox:// style URLs (#875)

#### Breaking

* Updated to mapbox-gl-style-spec v7.0.0 ([Changelog](https://github.com/mapbox/mapbox-gl-style-spec/blob/a2b0b561ce16015a1ef400dc870326b1b5255091/CHANGELOG.md)). Styles are
  now expected to be version 7. You can use the [gl-style-migrate](https://github.com/mapbox/mapbox-gl-style-lint#migrations)
  utility to update existing styles.
* HTTP_URL and HTTPS_URL config options must no longer include a `/v4` path prefix.
* `addClass`, `removeClass`, `setClasses`, `hasClass`, and `getClasses` are now methods
  on Map.
* `Style#cascade` is now private, pending a public style mutation API (#755).
* The format for `featuresAt` results changed. Instead of result-per-geometry-cross-layer,
  each result has a `layers` array with all layers that contain the feature. This avoids
  duplication of geometry and properties in the result set.


## 0.5.2 (Jan 07 2015)

#### Bugfixes

* Remove tiles for unused sources (#863)
* Fix fill pattern alignment

#### Improvements

* Add GeoJSONSource maxzoom option (#760)
* Return ref layers in featuresAt (#847)
* Return any extra layer keys provided in the stylesheet in featuresAt
* Faster protobuf parsing

## 0.5.1 (Dec 19 2014)

#### Bugfixes

* Fix race conditions with style loading/rendering
* Fix race conditions with setStyle
* Fix map.remove()
* Fix featuresAt properties

## 0.5.0 (Dec 17 2014)

#### Bugfixes

* Fix multiple calls to setStyle

#### Improvements

* `featuresAt` now returns additional information
* Complete style/source/tile event suite:
  style.load, style.error, style.change,
  source.add, source.remove, source.load, source.error, source.change,
  tile.add, tile.remove, tile.load, tile.error
* Vastly improved performance and correctness for GeoJSON sources
* Map#setStyle accepts a style URL
* Support {prefix} in tile URL templates
* Provide a source map with minified source

#### Breaking

* Results format for `featuresAt` changed

## 0.4.2 (Nov 14 2014)

#### Bugfixes

- Ensure only one easing is active at a time (#807)
- Don't require style to perform easings (#817)
- Fix raster tiles sometimes not showing up (#761)

#### Improvements

- Internet Explorer 11 support (experimental)

## 0.4.1 (Nov 10 2014)

#### Bugfixes

- Interpolate to the closest bearing when doing rotation animations (#818)

## 0.4.0 (Nov 4 2014)

#### Breaking

- Updated to mapbox-gl-style-spec v6.0.0 ([Changelog](https://github.com/mapbox/mapbox-gl-style-spec/blob/v6.0.0/CHANGELOG.md)). Styles are
  now expected to be version 6. You can use the [gl-style-migrate](https://github.com/mapbox/mapbox-gl-style-lint#migrations)
  utility to update existing styles.

## 0.3.2 (Oct 23 2014)

#### Bugfixes

- Fix worker initialization with deferred or async scripts

#### Improvements

- Added map.remove()
- CDN assets are now served with gzip compression

## 0.3.1 (Oct 06 2014)

#### Bugfixes

- Fixed iteration over arrays with for/in
- Made browserify deps non-dev (#752)

## 0.3.0 (Sep 23 2014)

#### Breaking

- Updated to mapbox-gl-style-spec v0.0.5 ([Changelog](https://github.com/mapbox/mapbox-gl-style-spec/blob/v0.0.5/CHANGELOG.md)). Styles are
  now expected to be version 5. You can use the [gl-style-migrate](https://github.com/mapbox/mapbox-gl-style-lint#migrations)
  utility to update existing styles.
- Removed support for composite layers for performance reasons. [#523](https://github.com/mapbox/mapbox-gl-js/issues/523#issuecomment-51731405)
- `raster-hue-rotate` units are now degrees.

### Improvements

- Added LatLng#wrap
- Added support for Mapbox fontstack API.
- Added support for remote, non-Mapbox TileJSON sources and inline TileJSON sources (#535, #698).
- Added support for `symbol-avoid-edges` property to allow labels to be placed across tile edges.
- Fixed mkdir issue on Windows (#674).
- Fixed drawing beveled line joins without overlap.

#### Bugfixes

- Fixed performance when underzooming a layer's minzoom.
- Fixed `raster-opacity` for regular raster layers.
- Fixed various corner cases of easing functions.
- Do not modify original stylesheet (#728).
- Inherit video source from source (#699).
- Fixed interactivity for geojson layers.
- Stop dblclick on navigation so the map does not pan (#715).

## 0.2.2 (Aug 12 2014)

#### Breaking

- `map.setBearing()` no longer supports a second argument. Use `map.rotateTo` with an `offset` option and duration 0
if you need to rotate around a point other than the map center.

#### Improvements

- Improved `GeoJSONSource` to also accept URL as `data` option, eliminating a huge performance bottleneck in case of large GeoJSON files.
[#669](https://github.com/mapbox/mapbox-gl-js/issues/669) [#671](https://github.com/mapbox/mapbox-gl-js/issues/671)
- Switched to a different fill outlines rendering approach. [#668](https://github.com/mapbox/mapbox-gl-js/issues/668)
- Made the minified build 12% smaller gzipped (66 KB now).
- Added `around` option to `Map` `zoomTo`/`rotateTo`.
- Made the permalink hash more compact.
- Bevel linejoins no longer overlap and look much better when drawn with transparency.

#### Bugfixes

- Fixed the **broken minified build**. [#679](https://github.com/mapbox/mapbox-gl-js/issues/679)
- Fixed **blurry icons** rendering. [#666](https://github.com/mapbox/mapbox-gl-js/issues/666)
- Fixed `util.supports` WebGL detection producing false positives in some cases. [#677](https://github.com/mapbox/mapbox-gl-js/issues/677)
- Fixed invalid font configuration completely blocking tile rendering.  [#662](https://github.com/mapbox/mapbox-gl-js/issues/662)
- Fixed `Map` `project`/`unproject` to properly accept array-form values.
- Fixed sprite loading race condition. [#593](https://github.com/mapbox/mapbox-gl-js/issues/593)
- Fixed `GeoJSONSource` `setData` not updating the map until zoomed or panned. [#676](https://github.com/mapbox/mapbox-gl-js/issues/676)

## 0.2.1 (Aug 8 2014)

#### Breaking

- Changed `Navigation` control signature: now it doesn't need `map` in constructor
and gets added with `map.addControl(nav)` or `nav.addTo(map)`.
- Updated CSS classes to have consistent naming prefixed with `mapboxgl-`.

#### Improvements

- Added attribution control (present by default, disable by passing `attributionControl: false` in options).
- Added rotation by dragging the compass control.
- Added grabbing cursors for the map by default.
- Added `util.inherit` and `util.debounce` functions.
- Changed the default debug page style to OSM Bright.
- Token replacements now support dashes.
- Improved navigation control design.

#### Bugfixes

- Fixed compass control to rotate its icon with the map.
- Fixed navigation control cursors.
- Fixed inertia going to the wrong direction in a rotated map.
- Fixed inertia race condition where error was sometimes thrown after erratic panning/zooming.


## 0.2.0 (Aug 6 2014)

- First public release.
