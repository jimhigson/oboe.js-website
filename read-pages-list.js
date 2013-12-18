var fs = require('fs'),
    lineReader = require('line-reader'),
    CONTENT_DIR = 'content',
    MARKDOWN_FILENAME_PATTERN = /(.*)\.md/,
    barrier = require('./barrier');

function readFirstLine(file, callback){
    
    lineReader.eachLine(CONTENT_DIR + '/' + file, function(line, last) {
        callback(line);
        return false; // stop reading the file
    });

}

function markdownTitleContent(markdownLine) {
    return markdownLine.replace(/#+ +(.*)/, '$1');;
}

module.exports = function readPagesList(callback) {

    fs.readFile(CONTENT_DIR + '/listing', 'utf8', function(err, content){

        var files = content.split('\n');

        readFileList(files);
    });
    
    function readFileList(markdownFiles){

        var result = [];

        var bar = barrier(function(){
            callback(result);
        });

        markdownFiles.forEach(function(file, i){
            if( !file )
                return // skip blank lines
            
            var obj = {path:file.match(MARKDOWN_FILENAME_PATTERN)[1]};

            readFirstLine(file, bar.add(function(firstLine){
                // de-markdown the title from the file:
                obj.title = markdownTitleContent(firstLine);

                result[i] = obj;
            }));
        });
    }
}

