'use strict';

module.exports = function (grunt) {

    // set up config
    grunt.initConfig({
    
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
                file: 'index.js'
            }
        }
        
    });

    // load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');
    grunt.loadNpmTasks('grunt-sass');

    // register a few tasks
    grunt.registerTask('build', ['sass:all']);
    grunt.registerTask('start-dev', ['develop:server', 'sass:all', 'watch:sources']);
    //grunt.registerTask('start-real', ???);

};