var path = require('path');
var fs = require('fs');


module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/** \n * Generated by patsy GruntJS template for <%= pkg.name %> ' +
          '\n *\n' +
          ' * @version v<%= pkg.version %> \n' +
          ' * @date <%= grunt.template.today("yyyy-mm-dd h:MM:ss TT") %>\n' +
          '<%= pkg.author ? pkg.author.name ? " * @author " + pkg.author.name + " " + pkg.author.url +"" : " * @author " + pkg.author : "" %> \n' +
          '<%= pkg.homepage ? " * @link " + pkg.homepage + "\\n" : "" %> */\n',
    clean : {
      remove_internal_modules_readme : [
        'source.md',
        'docs/inc/internal_modules_api.md'
      ]
    },
    markdox : {
      options : {
        template : 'docs/lib/markdox/template.ejs',
        save_local_copy : true
      },
      internal_modules_api : {
        src : [
          'source.js'
        ],
        dest : 'docs/inc/internal_modules_api.md'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');


  grunt.registerTask('readme', ['clean','markdox']);

  grunt.registerMultiTask('markdox', 'Create markdown documentation from JavaScript files with markdox', function(){

    var _results = '';
    var markdox   = require('markdox');
    var path      = require('path');
    var done      = this.async();
    var options   = this.options();



    // Iterate over all src-dest file pairs.
    this.files.forEach(function(file) {

      var dest = file.dest || 'docs/_output.md';

      var src = file.src.filter(function(filepath) {

        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {

          grunt.log.warn('Source file "' + filepath + '" not found.');

          return false;

        } else {

          return true;

        }

      });

      if (src.length === 0) {

        grunt.log.warn('Destination (' + file.dest + ') not written because src files were empty.');

        return;

      }

      var _total = src.length;

      src.forEach(function(filepath){

        /*var _dir_name =  path.dirname(filepath),
        _new_name = options.dest + path.basename(_dir_name) + '-api.md';

        if (!grunt.file.exists(_new_name)) {
          grunt.file.write(_new_name, '');
        }*/

        markdox.process(filepath, options, function(err, result){

          if(err){

            grunt.log.fatal(err);

          }

          grunt.verbose.writeln('Generating documentation for: ' + filepath);

          if(typeof result !== 'undefined'){

            _results += result;

            if(options.save_local_copy){

              var _local_copy_dest  = path.dirname(filepath) + path.sep;
              var _new_name         = _local_copy_dest + 'README.md';
              var _existing_content;

              if(grunt.file.exists(_new_name)) {

                _existing_content = grunt.file.read(_new_name);

                try{

                  grunt.file.write( _new_name, result + _existing_content );

                  grunt.verbose.ok( 'Local copy saved to : ' + _new_name );

                } catch( e ){

                  grunt.log.fatal( e );

                }

              } else {

                try{

                  grunt.file.write( _new_name, result );

                  grunt.verbose.ok( 'Local copy saved to : ' + _new_name );

                } catch( e ){

                  grunt.log.fatal( e );

                }

              }

            }

          }

          if(!--_total){

            grunt.log.ok('Documentation generated to: ' + dest);
            grunt.file.write(dest, _results);

            done();

          }

        });

      });

    });

  });





};