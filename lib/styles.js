var defaultStyles = [
  {
    label: 'Streets',
    styleName: 'Mapbox Streets',
    styleUrl: 'mapbox://styles/mapbox/streets-v11',
  }, {
    label: 'Satellite',
    styleName: 'Mapbox Satellite Streets',
    styleUrl: 'mapbox://sprites/mapbox/satellite-streets-v11',
  } ];

/**
 * Adds style switcher similar to Google Maps.
 * @param {Object} options
 * @param {Array} [options.styles] - Array of style objects:
 * @param {String} options.styles.label - Style label to display on switcher
 * @param {String} options.styles.styleName - [Style name from spec](https://docs.mapbox.com/mapbox-gl-js/style-spec/#root-name)
 * @param {String} options.styles.styleUrl - Style url
 * @param {Function} [options.onChange] - Triggered on style change. Accepts `style` object
 */

var StylesControl = function StylesControl(options) {
  if ( options === void 0 ) options = {};

  this.styles = options.styles || defaultStyles;
  this.onChange = options.onChange;
};

StylesControl.prototype.insertControls = function insertControls () {
    var this$1 = this;

  this.container = document.createElement('div');
  this.container.classList.add('mapboxgl-ctrl');
  this.container.classList.add('mapboxgl-ctrl-group');
  this.container.classList.add('mapboxgl-ctrl-styles');
  this.nodes = [];
  this.styles.forEach(function (style) {
    var node = document.createElement('button');
    node.setAttribute('type', 'button');
    node.textContent = style.label;
    node.addEventListener('click', function () {
      if (node.classList.contains('-active')) { return; }
      this$1.map.setStyle(style.styleUrl);
      if (this$1.onChange) { this$1.onChange(style); }
    });
    this$1.nodes.push(node);
    this$1.container.appendChild(node);
  });
};

StylesControl.prototype.onAdd = function onAdd (map) {
    var this$1 = this;

  this.map = map;
  this.insertControls();
  this.map.on('styledata', function () {
    [].forEach.call(this$1.container.querySelectorAll('button'), function (div) {
      div.classList.remove('-active');
    });
    var styleNames = this$1.styles.map(function (style) { return style.styleName; });
    var currentStyleIndex = styleNames.indexOf(this$1.map.getStyle().name);
    if (currentStyleIndex !== -1) {
      var currentNode = this$1.nodes[currentStyleIndex];
      currentNode.classList.add('-active');
    }
  });
  return this.container;
};

StylesControl.prototype.onRemove = function onRemove () {
  this.container.parentNode.removeChild(this.container);
  this.map = undefined;
};

export default StylesControl;
