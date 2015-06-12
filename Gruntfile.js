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
            js: {
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
            },
            css: {
                options: {
                    keepBuildDir: true,
                    optimizeCss: "standard.keepLines.keepWhitespace",
                    cssPrefix: "",
                    cssIn: "app/css/bmotion.css",
                    out: "dist/css/bmotion.css"
                }
            },
            cssmin: {
                options: {
                    keepBuildDir: true,
                    optimizeCss: "standard",
                    cssPrefix: "",
                    cssIn: "app/css/bmotion.css",
                    out: "dist/css/bmotion.min.css"
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
                                renamedType = component === 'bootstrap' ? 'css/css' : path.join(cssBowerLibs, component);
                                break;
                            case 'fonts':
                                renamedType = component === 'bootstrap' ? 'css/fonts' : path.join(cssBowerLibs, component);
                                break;
                        }
                        return renamedType;
                    },
                    targetDir: 'app'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['bower:install', 'requirejs:css', 'requirejs:cssmin', 'requirejs:js']);
    grunt.registerTask('dist', ['clean', 'build', 'bump']);

};
