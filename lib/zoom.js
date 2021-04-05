function iconPlus() {
  return (new DOMParser().parseFromString("<svg fill=\"#505050\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path d=\"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z\"/>\n    <path d=\"M0 0h24v24H0z\" fill=\"none\"/>\n</svg>", 'image/svg+xml')).firstChild;
}

function iconMinus() {
  return (new DOMParser().parseFromString("<svg fill=\"#505050\" width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\">\n    <path d=\"M19 13H5v-2h14v2z\"/>\n    <path d=\"M0 0h24v24H0z\" fill=\"none\"/>\n</svg>", 'image/svg+xml')).firstChild;
}

/**
 * Simple zoom control
 */
var ZoomControl = function ZoomControl () {};

ZoomControl.prototype.insertControls = function insertControls () {
  this.container = document.createElement('div');
  this.container.classList.add('mapboxgl-ctrl');
  this.container.classList.add('mapboxgl-ctrl-group');
  this.container.classList.add('mapboxgl-ctrl-zoom');
  this.zoomIn = document.createElement('button');
  this.zoomIn.setAttribute('type', 'button');
  this.zoomIn.appendChild(iconPlus());
  this.zoomOut = document.createElement('button');
  this.zoomOut.setAttribute('type', 'button');
  this.zoomOut.appendChild(iconMinus());
  this.container.appendChild(this.zoomIn);
  this.container.appendChild(this.zoomOut);
};

ZoomControl.prototype.onAdd = function onAdd (map) {
    var this$1 = this;

  this.map = map;
  this.insertControls();
  this.zoomIn.addEventListener('click', function () {
    this$1.map.zoomIn();
  });
  this.zoomOut.addEventListener('click', function () {
    this$1.map.zoomOut();
  });
  return this.container;
};

ZoomControl.prototype.onRemove = function onRemove () {
  this.container.parentNode.removeChild(this.container);
  this.map = undefined;
};

export default ZoomControl;
