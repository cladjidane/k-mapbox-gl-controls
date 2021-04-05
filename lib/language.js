var SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'ru', 'zh', 'pt', 'ar', 'ja', 'ko', 'mul'];

function getLanguageField(lang) {
  if (lang === 'mul') {
    return 'name';
  }
  return ("name_" + lang);
}

function localizeTextField(field, lang) {
  if (typeof field === 'string') {
    return field.replace(/{name.*?}/, ("{" + lang + "}"));
  }

  var str = JSON.stringify(field);

  if (Array.isArray(field)) {
    return JSON.parse(str.replace(
      /"coalesce",\["get","name.*?"]/g,
      ("\"coalesce\",[\"get\",\"" + lang + "\"]")
    ));
  }

  return JSON.parse(str.replace(
    /{name.*?}/g,
    ("{" + lang + "}")
  ));
}

/**
 * Localize map. Language can be set dynamically with `.setLanguage(lang)` method.
 * @param {Object} options
 * @param {Array} [options.supportedLanguages] - (Supported languages)[https://docs.mapbox.com/help/troubleshooting/change-language/]
 * @param {String} [options.language] - One of the supported languages to apply
 * @param {Array} [options.excludedLayerIds=[]] - Array of layer id to exclude from localization
 * @param {Function} [options.getLanguageField] - Accepts language and returns language field
 * By default fields are `name_LANGUAGE` and `name` for multi language (mul)
 */

var LanguageControl = function LanguageControl(options) {
  if ( options === void 0 ) options = {};

  this.container = document.createElement('div');
  this.supportedLanguages = options.supportedLanguages || SUPPORTED_LANGUAGES;
  this.language = options.language;
  this.getLanguageField = options.getLanguageField || getLanguageField;
  this.excludedLayerIds = options.excludedLayerIds || [];
  this.styleChangeListener = this.styleChangeListener.bind(this);
};

LanguageControl.prototype.onAdd = function onAdd (map) {
  this.map = map;
  this.map.on('styledata', this.styleChangeListener);
  return this.container;
};

LanguageControl.prototype.onRemove = function onRemove () {
  this.map.off('styledata', this.styleChangeListener);
  this.map = undefined;
};

LanguageControl.prototype.styleChangeListener = function styleChangeListener () {
  this.map.off('styledata', this.styleChangeListener);
  this.setLanguage(this.language);
};

LanguageControl.prototype.setLanguage = function setLanguage (lang) {
    var this$1 = this;
    if ( lang === void 0 ) lang = this.browserLanguage();

  var language = this.supportedLanguages.indexOf(lang) < 0 ? 'mul' : lang;
  var style = this.map.getStyle();
  var languageField = this.getLanguageField(language);
  var layers = style.layers.map(function (layer) {
    if (layer.type !== 'symbol') { return layer; }
    if (!layer.layout || !layer.layout['text-field']) { return layer; }
    if (this$1.excludedLayerIds.indexOf(layer.id) !== -1) { return layer; }

    var textField = layer.layout['text-field'];
    var textFieldLocalized = localizeTextField(textField, languageField);

    return Object.assign({}, layer,
      {layout: Object.assign({}, layer.layout,
        {'text-field': textFieldLocalized})});
  });

  this.map.setStyle(Object.assign({}, style,
    {layers: layers}));
};

LanguageControl.prototype.browserLanguage = function browserLanguage () {
  var language = navigator.languages ? navigator.languages[0] : navigator.language;
  var parts = language.split('-');
  var languageCode = parts.length > 1 ? parts[0] : language;
  if (this.supportedLanguages.indexOf(languageCode) > -1) {
    return languageCode;
  }
  return 'mul';
};

export default LanguageControl;
