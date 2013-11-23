var supermarked = require('supermarked'), 
    fs = require('fs');


function readMarkdown(requestedMarkdown, callback, errCallback) {

   function markdownPath(markdownFileName) {
      return 'content/' + markdownFileName + '.md';
   }
  
   fs.exists(markdownPath(requestedMarkdown), function(requestedMarkdownExists){
   
      var fileToRead = requestedMarkdownExists? 
                              markdownPath(requestedMarkdown) 
                           :  'content/404.md';
   
      fs.readFile(fileToRead, function(err, markdownBuffer){
       
          var markdownStr = markdownBuffer.toString();
          var html = supermarked(markdownStr, {ignoreMath:true});
          
          callback( html);
       });   
   });
}

module.exports = readMarkdown;



