const Handlebars = require('handlebars');

const figureTemplate = Handlebars.compile(
  '<figure id="demo-{{name}}" data-demo="{{name}}" {{#if autoplay}}data-autoplay{{/if}}></figure>'
);

module.exports = function(name, mode) {
  var autoplay = (mode == "autoplay");

  return new Handlebars.SafeString( figureTemplate({name:name, autoplay:autoplay}) );
};
