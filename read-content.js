"use strict";

var supermarked = require('supermarked'), 
    fs = require('fs'),
    cheerio = require('cheerio'),
    Handlebars = require('handlebars');

function outline(html){

   var $ = cheerio.load(html),
       mainHeadingEle = $('h1').first(),
   
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
  
   fs.exists(markdownPath(requestedMarkdown), function(requestedMarkdownExists){
      
      var fileToRead = requestedMarkdownExists? 
                              markdownPath(requestedMarkdown) 
                           :  'content/404.md';
                           
      var status = requestedMarkdownExists? 200 : 404;                           
   
      fs.readFile(fileToRead, function(err, markdownBuffer){
       
          var markdownStr = markdownBuffer.toString(),
              filledInMarkdown = Handlebars.compile(markdownStr)(opts),
              html = supermarked(filledInMarkdown, {ignoreMath:true}),
              response = outline(html);
              
          response.status = status;    
          
          callback( response );
       });   
   });
}

module.exports = readContent;



