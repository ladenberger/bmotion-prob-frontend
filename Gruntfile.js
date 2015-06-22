module.exports = function (grunt) {

    var path = require('path');
    var cssBowerLibs = 'css/libs/bower/';
    var jsBowerLibs = 'js/libs/bower/';

    grunt.initConfig({
        clean: ["dist", "bower_components", "app/js/libs/bower", "app/css/libs/bower", "app/css/css", "app/css/fonts"],
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commit: true,
                commitMessage: 'Release v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'origin'
            }
        },
        requirejs: {
            /*js: {
             options: {
             mainConfigFile: "app/bmotion.config.js",
             baseUrl: "app/js",
             removeCombined: true,
             findNestedDependencies: true,
             dir: "dist/js",
             skipDirOptimize: true,
             keepBuildDir: false,
             noBuildTxt: true,
             modules: [
             {name: "bmotion.online"},
             {name: "bmotion.integrated"},
             {name: "bmotion.standalone"},
             {name: "bmotion.vis"}
             ]
             }
             },*/
            'js': {
                options: {
                    mainConfigFile: "app/bmotion.config.js",
                    baseUrl: "app/js",
                    removeCombined: true,
                    findNestedDependencies: true,
                    name: "bmotion.<%= mode %>",
                    out: "dist/<%= mode %>/js/bmotion.<%= mode %>.js",
                    skipDirOptimize: true,
                    keepBuildDir: false,
                    noBuildTxt: true
                }
            },
            css: {
                options: {
                    keepBuildDir: true,
                    optimizeCss: "standard.keepLines.keepWhitespace",
                    cssPrefix: "",
                    cssIn: "app/css/bmotion.css",
                    out: "dist/<%= mode %>/css/bmotion.css"
                }
            }, cssmin: {
                options: {
                    keepBuildDir: true,
                    optimizeCss: "standard",
                    cssPrefix: "",
                    cssIn: "app/css/bmotion.css",
                    out: "dist/<%= mode %>/css/bmotion.min.css"
                }
            }
        },
        bower: {
            install: {
                options: {
                    layout: function (type, component, source) {
                        /* workaround for https://github.com/yatskevich/grunt-bower-task/issues/121 */
                        if (type === '__untyped__') {
                            type = source.substring(source.lastIndexOf('.') + 1);
                        }
                        var renamedType = type;
                        switch (type) {
                            case 'js':
                                renamedType = path.join(jsBowerLibs, component);
                                break;
                            case 'css':
                                renamedType = component === 'bootstrap' ? 'css/bootstrap/css' : path.join(cssBowerLibs, component);
                                break;
                            case 'fonts':
                                renamedType = component === 'bootstrap' ? 'css/bootstrap/fonts' : path.join(cssBowerLibs, component);
                                break;
                        }
                        return renamedType;
                    },
                    targetDir: 'app'
                }
            }
        },
        copy: {
            resources: {
                files: [
                    {
                        expand: true,
                        cwd: 'app/',
                        src: ['resources/editor/**', 'resources/templates/bms-<%= mode %>-ui.html', 'js/require.js', 'css/bootstrap/fonts/**'],
                        dest: 'dist/<%= mode %>/'
                    }
                ]
            },
            template: {
                files: [
                    {
                        expand: true,
                        cwd: 'app/resources/template',
                        src: ['**'],
                        dest: 'dist/template'
                    }
                ]
            }
        },
        "file-creator": {
            "standalone": {
                "dist/standalone/index.html": function (fs, fd, done) {
                    fs.writeSync(fd, '<!DOCTYPE html>\n'
                        + '<html>\n'
                        + '<head>\n'
                        + '<title>BMotion Studio for ProB</title>\n'
                        + '  <link rel="stylesheet" type="text/css" href="css/bmotion.min.css"/>\n'
                        + '  <script src="js/require.js"></script>\n'
                        + '  <script>\n'
                        + '    requirejs(["js/bmotion.standalone"]);\n'
                        + '  </script>\n'
                        + '</head>\n'
                        + '<body>\n'
                        + '  <div ng-view class="fullWidthHeight"></div>\n'
                        + '</body>\n'
                        + '</html>');
                    done();
                }
            },
            "online": {
                "dist/online/index.html": function (fs, fd, done) {
                    fs.writeSync(fd, '<!DOCTYPE html>\n'
                        + '<html>\n'
                        + '<head>\n'
                        + '<title>BMotion Studio for ProB</title>\n'
                        + '  <link rel="stylesheet" type="text/css" href="css/bmotion.min.css"/>\n'
                        + '  <script src="js/require.js"></script>\n'
                        + '  <script>\n'
                        + '    requirejs(["js/bmotion.online"]);\n'
                        + '  </script>\n'
                        + '</head>\n'
                        + '<body>\n'
                        + '  <div ng-view class="fullWidthHeight"></div>\n'
                        + '</body>\n'
                        + '</html>');
                    done();
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-file-creator');

    grunt.registerTask('default', ['build']);

    grunt.registerTask('prepare', ['bower:install', 'requirejs:cssmin', 'requirejs:js', 'copy:resources']);
    grunt.registerTask('build', ['standalone', 'online', 'template']);

    grunt.registerTask('standalone', '', function () {
        grunt.config.set('mode', 'standalone');
        grunt.task.run(['prepare', 'file-creator:standalone']);
    });
    grunt.registerTask('online', '', function () {
        grunt.config.set('mode', 'online');
        grunt.task.run(['prepare', 'file-creator:online']);
    });
    grunt.registerTask('template', '', function () {
        grunt.config.set('mode', 'template');
        grunt.task.run(['bower:install', 'requirejs:js', 'copy:template']);
    });

    grunt.registerTask('dist', ['clean', 'build', 'bump']);

};
