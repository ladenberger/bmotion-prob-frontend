module.exports = function (grunt) {

    var path = require('path');

    grunt.initConfig({

        clean: ["dist", "bower_components", "app/js/libs/bower", "app/css/libs/bower"],
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
                        {
                            name: "bmotion.online"
                        },
                        {
                            name: "bmotion.integrated"
                        },
                        {
                            name: "bmotion.standalone"
                        },
                        {
                            name: "bmotion.vis"
                        }
                    ]
                }
            },
            css: {
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
                                renamedType = "js/libs/bower";
                                break;
                            case 'css':
                                renamedType = "css/libs/bower";
                                break;
                            case 'fonts':
                                renamedType = "css/libs/bower";
                                break;
                        }
                        return path.join(renamedType, component);
                    },
                    targetDir: 'app'
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('default', ['bower:install', 'requirejs:css', 'requirejs:js']);
    grunt.registerTask('dist', ['clean', 'default']);

};
