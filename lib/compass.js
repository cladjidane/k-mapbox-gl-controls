function iconPointer() {
  return (new DOMParser().parseFromString("<svg viewBox=\"0 0 24 24\" width=\"22\" height=\"22\" xmlns=\"http://www.w3.org/2000/svg\">\n    <g fill=\"none\" fill-rule=\"evenodd\">\n        <path d=\"M0 0h24v24H0z\"/>\n        <path fill=\"#f44336\" d=\"M12 3l4 8H8z\"/>\n        <path fill=\"#9E9E9E\" d=\"M12 21l-4-8h8z\"/>\n    </g>\n</svg>", 'image/svg+xml')).firstChild;
}

/**
 * Simple compass
 * @param {Object} options
 * @param {Boolean} [options.instant=true] - Show compass if bearing is 0
 */

var CompassControl = function CompassControl(options) {
  if ( options === void 0 ) options = {};

  this.instant = typeof options.instant === 'boolean' ? options.instant : true;
  this.onRotate = this.onRotate.bind(this);
};

CompassControl.prototype.insertControls = function insertControls () {
  this.container = document.createElement('div');
  this.button = document.createElement('button');
  this.button.setAttribute('type', 'button');
  this.container.classList.add('mapboxgl-ctrl');
  this.container.classList.add('mapboxgl-ctrl-group');
  this.container.classList.add('mapboxgl-ctrl-compass');
  this.pointer = iconPointer();
  if (this.instant) {
    this.container.classList.add('-active');
  }
  this.container.appendChild(this.button);
  this.button.appendChild(this.pointer);
};

CompassControl.prototype.onAdd = function onAdd (map) {
    var this$1 = this;

  this.map = map;
  this.insertControls();
  this.button.addEventListener('click', function () {
    this$1.map.easeTo({ bearing: 0, pitch: 0 });
  });
  this.map.on('rotate', this.onRotate);
  this.onRotate();
  return this.container;
};

CompassControl.prototype.onRemove = function onRemove () {
  this.container.parentNode.removeChild(this.container);
  this.map = undefined;
};

CompassControl.prototype.onRotate = function onRotate () {
  var angle = this.map.getBearing() * (-1);
  if (!this.instant) {
    if (angle === 0) {
      this.container.classList.remove('-active');
    } else {
      this.container.classList.add('-active');
    }
  }
  this.pointer.style.transform = "rotate(" + angle + "deg)";
};

export default CompassControl;
