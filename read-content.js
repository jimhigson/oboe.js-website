"use strict";

var supermarked = require('supermarked'), 
    fs = require('fs'),
    cheerio = require('cheerio'),
    Handlebars = require('handlebars'),
    figureTemplate = Handlebars.compile(
       '<figure id="demo-{{name}}" data-demo="{{name}}"></figure>'
    ),
    MD_POSTFIX = fs.readFileSync('content/postfix.md');

Handlebars.registerHelper("demo", function(name) {

   return new Handlebars.SafeString( figureTemplate({name:name}) );
});

function postProcessMarkup($) {
   $('pre').each(function(i, ele){
      var code = $(ele);
      
      if( /deprecated/i.exec( code.text()) ) {
         
         var details = $('<details>');
         code.replaceWith(details);
         details
            .append('<summary>Deprecated</summary>')
            .append(code);
      }
   });
   
   return $;
}

function outline($){

   var mainHeadingEle = $('h1').first(),
   
       mainHeading = {
         text: mainHeadingEle.text(),
         id:   mainHeadingEle.attr('id')
       },
       
       sectionHeadings = 
            $('h2').map(function(i, element){
               return {
                  text: $(element).text(),
                  id:   $(element).attr('id')
               }
            });   
   
   mainHeadingEle.remove();
   
   return {
      content: $.html(),
      heading: mainHeading,
      sections: sectionHeadings
   }
}

function readContent(requestedMarkdown, opts, callback) {

   function markdownPath(markdownFileName) {
      return 'content/' + markdownFileName + '.md';
   }

   opts.page = requestedMarkdown;

   fs.exists(markdownPath(requestedMarkdown), function(requestedMarkdownExists){
      
      var fileToRead = requestedMarkdownExists? 
                              markdownPath(requestedMarkdown) 
                           :  'content/404.md';
                           
      var status = requestedMarkdownExists? 200 : 404;                           

      // fileToRead should point to legit page by now (possibly 404)
      fs.readFile(fileToRead, function(err, markdownBuffer){
       
          var markdownStr = markdownBuffer.toString(),
              markDownWithGithubLink = markdownStr + MD_POSTFIX,
              filledInMarkdown = Handlebars.compile(markDownWithGithubLink)(opts),
              html = supermarked(filledInMarkdown, {ignoreMath:true, smartypants:true}),
              $ = postProcessMarkup(cheerio.load(html)),
              response = outline($);
              
          response.status = status;    
          
          callback( response );
       });   
   });
}

module.exports = readContent;



