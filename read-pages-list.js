var fs = require('fs'),
    lineReader = require('line-reader'),
    CONTENT_DIR = 'content',
    EXCLUSIONS = ['index.md', '404.md'],
    MARKDOWN_FILENAME_PATTERN = /(.*)\.md/;

function readFirstLine(file, callback){
    
    lineReader.eachLine(CONTENT_DIR + '/' + file, function(line, last) {
        callback(line);
        return false; // stop reading the file
    });

}

function readPagesList(callback) {

    fs.readdir(CONTENT_DIR, function(err, files){
        var result = [],
            markdownFiles = files.filter(function( f ){
                return f.match(MARKDOWN_FILENAME_PATTERN) && (EXCLUSIONS.indexOf(f) == -1);
            });
        
        markdownFiles.forEach(function(file){
            var obj = {path:file.match(MARKDOWN_FILENAME_PATTERN)[1]};
                        
            readFirstLine(file, function(firstLine){
                // de-markdown the title from the file:
                obj.title = firstLine.replace(/#+ +(.*)/, '$1');
                
                result.push(obj);
                
                if( result.length == markdownFiles.length ){
                    callback(result);
                }
            });
        });
    });
    
}

module.exports = readPagesList;
