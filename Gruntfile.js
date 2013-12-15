'use strict';

module.exports = function (grunt) {

    // set up config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json')
    ,
        watch:{
            sources:{
                files:['*.js', 'sass/*.scss'],
                tasks:['develop:server', 'build'],
                options: { nospawn: true }
            }
        }
    ,
        sass: {
            all:{
                files: {'statics/css/all.css':'sass/all.scss'}
            }
        }
    ,   
        develop: {
            server: {
                file: 'index.js',
                args: '--env=dev'
            }
        }
        
    ,
        uglify: {
            
            clientSideJs:{
                options:{
                    wrap:'enclose'
                },
                
                files:{
                    'statics/js-concat/all.js': require('./sourceList.js').map(function(name){
                        return 'statics' + name;
                    })
                }
            }
        }
    ,
        cssmin:{
            minifyCss:{
                files:{
                    'statics/css/all-min.css':['statics/css/all.css']
                }
            }
        }
        
    });

    
    // load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // register a few tasks
    grunt.registerTask('build', ['sass:all', 'uglify:clientSideJs', 'cssmin:minifyCss']);
    grunt.registerTask('start-dev', ['develop:server', 'sass:all', 'watch:sources']);
    //grunt.registerTask('start-real', ???);

};