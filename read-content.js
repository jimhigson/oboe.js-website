"use strict";

var supermarked = require('supermarked'), 
    fs = require('fs'),
    cheerio = require('cheerio'),
    Handlebars = require('handlebars'),
    barrier = require('./barrier.js'),
    figureTemplate = Handlebars.compile(
       '<figure id="demo-{{name}}" data-demo="{{name}}" {{#if autoplay}}data-autoplay{{/if}}></figure>'
    ),
    MARKDOWN_OPTS = {ignoreMath:true, smartypants:true, gfm:true, tables:true},
    MD_PREFIX = '{{#if pdfLink}}This page is also [available as a PDF]({{pdfLink}}).{{/if}}\n',
    MD_POSTFIX = fs.readFileSync('content/postfix.md');

Handlebars.registerHelper("demo", function(name, mode) {
   var autoplay = (mode == "autoplay");
   
   return new Handlebars.SafeString( figureTemplate({name:name, autoplay:autoplay}) );
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
       
       sectionHeadings = [];
   
            $('h2').each(function(i, element){
               var jEle = $(element),
                   text = jEle.text(); 
               
               // Hack here to avoid putting 'Typos' heading in side links
               if( text != 'Typos' ){
                  sectionHeadings.push({
                     text: text,
                     id:   jEle.attr('id')
                  });
               }
            });
   
   mainHeadingEle.remove();
   
   return {
      content: $.html(),
      heading: mainHeading,
      sections: sectionHeadings
   }
}

function readContent(requestedPage, opts, callback) {

   function pdfFile(pageName) {
      return 'pdf/' + pageName + '.pdf';
   }

   function pdfUrl(pageName) {
      return '/' + pageName + '.pdf';
   }   
   
   function markdownFile(pageName) {
      return 'content/' + pageName + '.md';
   }

   fs.exists(markdownFile(requestedPage), function(requestedMarkdownExists){
      
      var actualPage = requestedMarkdownExists? requestedPage : '404',
          markdownToRead = markdownFile(actualPage),
          markdownContent,
          bar = barrier(function(){

            var surroundedMarkdown = MD_PREFIX + markdownContent + MD_POSTFIX,
                filledInMarkdown = Handlebars.compile(surroundedMarkdown)(opts),
                html = supermarked(filledInMarkdown, MARKDOWN_OPTS),
                $ = postProcessMarkup(cheerio.load(html)),
                response = outline($);

            response.status = requestedMarkdownExists? 200 : 404; 
             
            callback( response );
         });
      
      opts.page = actualPage;
      opts.isDownloadPage = (actualPage == 'download');
      
      fs.exists(pdfFile(requestedPage), bar.add(function(exists){
         if( exists ) {
            opts.pdfLink = pdfUrl(requestedPage);
         }
      }));
      
      // fileToRead should point to legit page by now (possibly 404)
      fs.readFile(markdownToRead, bar.add(function(err, markdownBuffer){
       
         markdownContent = markdownBuffer.toString();
      }));
   });
}

module.exports = readContent;



