var supermarked = require('supermarked'), 
    fs = require('fs'),
    cheerio = require('cheerio');

function outline(html){

   var $ = cheerio.load(html),
       mainHeadingEle = $('h1').first()   
   
       mainHeading = {
         text: mainHeadingEle.text(),
         id:   mainHeadingEle.attr('id')
       };
       
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

function readMarkdown(requestedMarkdown, callback) {

   function markdownPath(markdownFileName) {
      return 'content/' + markdownFileName + '.md';
   }
  
   fs.exists(markdownPath(requestedMarkdown), function(requestedMarkdownExists){
   
      var fileToRead = requestedMarkdownExists? 
                              markdownPath(requestedMarkdown) 
                           :  'content/404.md';
   
      fs.readFile(fileToRead, function(err, markdownBuffer){
       
          var markdownStr = markdownBuffer.toString(),
              html = supermarked(markdownStr, {ignoreMath:true}),
              documentTree = outline(html);
          
          callback( documentTree );
       });   
   });
}

module.exports = readMarkdown;



