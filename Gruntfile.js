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
            options:{
                wrap:'enclose'
            },
            clientSideJs:{
                files:{
                    'statics/js-concat/all.js': require('./sourceList.js').map(function(name){
                        return 'statics' + name;
                    })
                }
            }
        }
        
    });

    
    // load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // register a few tasks
    grunt.registerTask('build', ['sass:all', 'uglify:clientSideJs']);
    grunt.registerTask('start-dev', ['develop:server', 'sass:all', 'watch:sources']);
    //grunt.registerTask('start-real', ???);

};