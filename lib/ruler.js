import mapboxgl from 'mapbox-gl';
import distance from '@turf/distance';

function iconRuler() {
  return (new DOMParser().parseFromString("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"22\" height=\"12\" viewBox=\"0 0 22 12\" fill=\"#505050\">\n    <path fill-rule=\"evenodd\" fill=\"none\" d=\"M-1-6h24v24H-1z\"/>\n    <path d=\"M20 0H2C.9 0 0 .9 0 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2zm0 10H2V2h2v4h2V2h2v4h2V2h2v4h2V2h2v4h2V2h2v8z\"/>\n</svg>", 'image/svg+xml')).firstChild;
}

var LAYER_LINE = 'controls-layer-line';
var LAYER_SYMBOL = 'controls-layer-symbol';
var SOURCE_LINE = 'controls-source-line';
var SOURCE_SYMBOL = 'controls-source-symbol';
var MAIN_COLOR = '#263238';
var HALO_COLOR = '#fff';

function geoLineString(coordinates) {
  if ( coordinates === void 0 ) coordinates = [];

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates,
    },
  };
}

function geoPoint(coordinates, labels) {
  if ( coordinates === void 0 ) coordinates = [];
  if ( labels === void 0 ) labels = [];

  return {
    type: 'FeatureCollection',
    features: coordinates.map(function (c, i) { return ({
      type: 'Feature',
      properties: {
        text: labels[i],
      },
      geometry: {
        type: 'Point',
        coordinates: c,
      },
    }); }),
  };
}

function defaultLabelFormat(number) {
  if (number < 1) {
    return (((number * 1000).toFixed()) + " m");
  }
  return ((number.toFixed(2)) + " km");
}

function safeDefault(value, defaultValue) {
  if (typeof value === 'undefined') {
    return defaultValue;
  }
  return value;
}

/**
 * Fires map `ruler.on` and `ruler.off`events at the beginning and at the end of measuring.
 * @param {Object} options
 * @param {String} [options.units='kilometers'] - Any units [@turf/distance](https://github.com/Turfjs/turf/tree/master/packages/turf-distance) supports
 * @param {Function} [options.labelFormat] - Accepts number and returns label
 * Can be used to convert value to any measuring units
 * @param {Array} [options.font=['Roboto Medium']] - Array of fonts
 * @param {String} [options.mainColor='#263238'] - Color of ruler lines
 * @param {String} [options.secondaryColor='#fff'] - Color of halo and inner marker background
 * @param {Number} [options.fontSize=12] - Label font size in `px`
 * @param {Number} [options.fontHalo=1] - Label font halo
 * @param {Array} [options.textVariableAnchor=['top']] - Array of anchor positions
 * @param {Boolean} [options.textAllowOverlap=false] - Is allowed to overlap labels
 * @param {Number} [options.markerNodeSize=12] - Width and Height of the marker in `px`
 * @param {Number} [options.markerNodeBorderWidth=2] - Width of the marker's border in `px`
 */

var RulerControl = function RulerControl(options) {
  if ( options === void 0 ) options = {};

  this.isMeasuring = false;
  this.markers = [];
  this.coordinates = [];
  this.labels = [];
  this.units = options.units || 'kilometers';
  this.font = options.font || ['Roboto Medium'];
  this.fontSize = safeDefault(options.fontSize, 12);
  this.fontHalo = safeDefault(options.fontHalo, 1);
  this.textVariableAnchor = options.textVariableAnchor || ['top'];
  this.textAllowOverlap = options.textAllowOverlap || false;
  this.markerNodeSize = (safeDefault(options.markerNodeSize, 12)) + "px";
  this.markerNodeBorderWidth = (safeDefault(options.markerNodeBorderWidth, 2)) + "px";
  this.labelFormat = options.labelFormat || defaultLabelFormat;
  this.mainColor = options.mainColor || MAIN_COLOR;
  this.secondaryColor = options.secondaryColor || HALO_COLOR;
  this.mapClickListener = this.mapClickListener.bind(this);
  this.styleLoadListener = this.styleLoadListener.bind(this);
};

RulerControl.prototype.insertControls = function insertControls () {
  this.container = document.createElement('div');
  this.container.classList.add('mapboxgl-ctrl');
  this.container.classList.add('mapboxgl-ctrl-group');
  this.container.classList.add('mapboxgl-ctrl-ruler');
  this.button = document.createElement('button');
  this.button.setAttribute('type', 'button');
  this.button.appendChild(iconRuler());
  this.container.appendChild(this.button);
};

RulerControl.prototype.draw = function draw () {
  this.map.addSource(SOURCE_LINE, {
    type: 'geojson',
    data: geoLineString(this.coordinates),
  });

  this.map.addSource(SOURCE_SYMBOL, {
    type: 'geojson',
    data: geoPoint(this.coordinates, this.labels),
  });

  this.map.addLayer({
    id: LAYER_LINE,
    type: 'line',
    source: SOURCE_LINE,
    paint: {
      'line-color': this.mainColor,
      'line-width': 2,
    },
  });

  this.map.addLayer({
    id: LAYER_SYMBOL,
    type: 'symbol',
    source: SOURCE_SYMBOL,
    layout: {
      'text-field': '{text}',
      'text-font': this.font,
      'text-allow-overlap': this.textAllowOverlap,
      'text-variable-anchor': this.textVariableAnchor,
      'text-size': this.fontSize,
      'text-offset': [0, 0.8],
    },
    paint: {
      'text-color': this.mainColor,
      'text-halo-color': this.secondaryColor,
      'text-halo-width': this.fontHalo,
    },
  });
};

RulerControl.prototype.measuringOn = function measuringOn () {
  this.isMeasuring = true;
  this.markers = [];
  this.coordinates = [];
  this.labels = [];
  this.map.getCanvas().style.cursor = 'crosshair';
  this.button.classList.add('-active');
  this.draw();
  this.map.on('click', this.mapClickListener);
  this.map.on('style.load', this.styleLoadListener);
  this.map.fire('ruler.on');
};

RulerControl.prototype.measuringOff = function measuringOff () {
  this.isMeasuring = false;
  this.map.getCanvas().style.cursor = '';
  this.button.classList.remove('-active');
  // remove layers, sources and event listeners
  this.map.removeLayer(LAYER_LINE);
  this.map.removeLayer(LAYER_SYMBOL);
  this.map.removeSource(SOURCE_LINE);
  this.map.removeSource(SOURCE_SYMBOL);
  this.markers.forEach(function (m) { return m.remove(); });
  this.map.off('click', this.mapClickListener);
  this.map.off('style.load', this.styleLoadListener);
  this.map.fire('ruler.off');
};

RulerControl.prototype.mapClickListener = function mapClickListener (event) {
    var this$1 = this;

  var markerNode = document.createElement('div');
  markerNode.style.width = this.markerNodeSize;
  markerNode.style.height = this.markerNodeSize;
  markerNode.style.borderRadius = '50%';
  markerNode.style.background = this.secondaryColor;
  markerNode.style.boxSizing = 'border-box';
  markerNode.style.border = (this.markerNodeBorderWidth) + " solid " + (this.mainColor);
  var marker = new mapboxgl.Marker({
    element: markerNode,
    draggable: true,
  })
    .setLngLat(event.lngLat)
    .addTo(this.map);
  this.coordinates.push([event.lngLat.lng, event.lngLat.lat]);
  this.labels = this.coordinatesToLabels();
  this.map.getSource(SOURCE_LINE)
    .setData(geoLineString(this.coordinates));
  this.map.getSource(SOURCE_SYMBOL)
    .setData(geoPoint(this.coordinates, this.labels));
  this.markers.push(marker);
  marker.on('drag', function () {
    var index = this$1.markers.indexOf(marker);
    var lngLat = marker.getLngLat();
    this$1.coordinates[index] = [lngLat.lng, lngLat.lat];
    this$1.labels = this$1.coordinatesToLabels();
    this$1.map.getSource(SOURCE_LINE)
      .setData(geoLineString(this$1.coordinates));
    this$1.map.getSource(SOURCE_SYMBOL)
      .setData(geoPoint(this$1.coordinates, this$1.labels));
  });
};

RulerControl.prototype.coordinatesToLabels = function coordinatesToLabels () {
  var ref = this;
    var coordinates = ref.coordinates;
    var units = ref.units;
    var labelFormat = ref.labelFormat;
  var sum = 0;
  return coordinates.map(function (coordinate, index) {
    if (index === 0) { return labelFormat(0); }
    sum += distance(coordinates[index - 1], coordinates[index], { units: units });
    return labelFormat(sum);
  });
};

RulerControl.prototype.styleLoadListener = function styleLoadListener () {
  this.draw();
};

RulerControl.prototype.onAdd = function onAdd (map) {
    var this$1 = this;

  this.map = map;
  this.insertControls();
  this.button.addEventListener('click', function () {
    if (this$1.isMeasuring) {
      this$1.measuringOff();
    } else {
      this$1.measuringOn();
    }
  });
  return this.container;
};

RulerControl.prototype.onRemove = function onRemove () {
  if (this.isMeasuring) {
    this.measuringOff();
  }
  this.map.off('click', this.mapClickListener);
  this.container.parentNode.removeChild(this.container);
  this.map = undefined;
};

export default RulerControl;
