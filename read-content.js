"use strict";

var supermarked = require('supermarked'), 
    fs = require('fs'),
    cheerio = require('cheerio'),
    Handlebars = require('handlebars'),
    barrier = require('./barrier.js'),
    figureTemplate = Handlebars.compile(
       '<figure id="demo-{{name}}" data-demo="{{name}}"></figure>'
    ),
    MARKDOWN_OPTS = {ignoreMath:true, smartypants:true, gfm:true, tables:true},
    MD_PREFIX = '{{#if pdfLink}}This page is [available as a PDF]({{pdfLink}}).{{/if}}\n',
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
            .append('<summary>Deprecated API</summary>')
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

   function pdfFile(pageName) {
      return 'pdf/' + pageName + '.pdf';
   }

   function pdfUrl(pageName) {
      return '/' + pageName + '.pdf';
   }   
   
   function markdownFile(pageName) {
      return 'content/' + pageName + '.md';
   }

   fs.exists(markdownFile(requestedMarkdown), function(requestedMarkdownExists){
      
      var pageNameToRead = requestedMarkdownExists? requestedMarkdown : '404',
          markdownToRead = markdownFile(pageNameToRead),
          markdownStr,
          bar = barrier(function(){
             
            var surroundedMarkdown = MD_PREFIX + markdownStr + MD_POSTFIX,
                filledInMarkdown = Handlebars.compile(surroundedMarkdown)(opts),
                html = supermarked(filledInMarkdown, MARKDOWN_OPTS),
                $ = postProcessMarkup(cheerio.load(html)),
                response = outline($);

            response.status = requestedMarkdownExists? 200 : 404; 
             
            callback( response );
         });

      fs.exists(pdfFile(requestedMarkdown), bar.add(function(exists){
         if( exists ) {
            opts.pdfLink = pdfUrl(requestedMarkdown);
         }
      }));
      
      // fileToRead should point to legit page by now (possibly 404)
      fs.readFile(markdownToRead, bar.add(function(err, markdownBuffer){
       
         markdownStr = markdownBuffer.toString();
      }));
   });
}

module.exports = readContent;



