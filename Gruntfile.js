'use strict';

module.exports = function (grunt) {

    // set up config
    grunt.initConfig({
    
        watch:{
            server:{
                files:['index.js'],
                tasks:['develop:server'],
                options: { nospawn: true }
            }
        },
        
        develop: {
            server: {
                file: 'index.js'
            }
        }
        
    });

    // load all grunt tasks
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-develop');

    // register a few tasks
    grunt.registerTask('start-dev', ['develop:server', 'watch:server']);
    //grunt.registerTask('start-real', ???);

};