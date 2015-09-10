module.exports = function (grunt) {

    var path = require('path');
    var cssBowerLibs = 'css/libs/bower/';
    var jsBowerLibs = 'js/libs/bower/';
    var appVersion = '0.2.2';
    var electronVersion = '0.32.1';
    var targets = ["linux-ia32", "linux-x64", "darwin-x64", "win32-ia32", "win32-x64"];

    grunt.initConfig({
        clean: ["build", "cache", "bower_components", "app/js/libs/bower", "app/css/libs/bower"],
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
        electron: {
            "linux-x64": {
                options: {
                    name: 'bmotion-prob',
                    dir: 'app',
                    out: 'build/client',
                    version: electronVersion,
                    platform: 'linux',
                    arch: 'x64',
                    asar: true,
                    "app-version": appVersion
                }
            },
            "linux-ia32": {
                options: {
                    name: 'bmotion-prob',
                    dir: 'app',
                    out: 'build/client',
                    version: electronVersion,
                    platform: 'linux',
                    arch: 'ia32',
                    asar: true,
                    "app-version": appVersion
                }
            },
            "win32-ia32": {
                options: {
                    name: 'bmotion-prob',
                    dir: 'app',
                    out: 'build/client',
                    version: electronVersion,
                    platform: 'win32',
                    icon: 'app/resources/icons/bmsicon.ico',
                    arch: 'ia32',
                    asar: true,
                    "app-version": appVersion
                }
            },
            "win32-x64": {
                options: {
                    name: 'bmotion-prob',
                    dir: 'app',
                    out: 'build/client',
                    version: electronVersion,
                    platform: 'win32',
                    icon: 'app/resources/icons/bmsicon.ico',
                    arch: 'x64',
                    asar: true,
                    "app-version": appVersion
                }
            },
            "darwin-x64": {
                options: {
                    name: 'bmotion-prob',
                    dir: 'app',
                    out: 'build/client',
                    version: electronVersion,
                    platform: 'darwin',
                    icon: 'app/resources/icons/bmsicon.icns',
                    arch: 'x64',
                    asar: true,
                    "app-version": appVersion
                }
            }
        },
        /*requirejs: {
         'js-main': {
         options: {
         mainConfigFile: "app/bmotion.config.js",
         baseUrl: "app",
         removeCombined: true,
         findNestedDependencies: true,
         name: "bmotion.<%= mode %>",
         out: "build/<%= mode %>/js/bmotion.<%= mode %>.js",
         skipDirOptimize: true,
         keepBuildDir: false,
         noBuildTxt: true
         }
         },
         'js-editor': {
         options: {
         mainConfigFile: "app/bmotion.config.js",
         baseUrl: "app",
         removeCombined: true,
         findNestedDependencies: true,
         name: "bmotion.editor",
         out: "build/<%= mode %>/js/bmotion.editor.js",
         skipDirOptimize: true,
         keepBuildDir: false,
         noBuildTxt: true
         }
         },
         'css-main': {
         options: {
         keepBuildDir: true,
         //optimizeCss: "standard.keepLines.keepWhitespace",
         optimizeCss: "standard",
         cssPrefix: "",
         cssIn: "app/css/bms.main.css",
         out: "build/<%= mode %>/css/bms.main.css"
         }
         },
         'css-editor': {
         options: {
         keepBuildDir: true,
         //optimizeCss: "standard.keepLines.keepWhitespace",
         optimizeCss: "standard",
         cssPrefix: "",
         cssIn: "app/css/bms.editor.css",
         out: "build/<%= mode %>/css/bms.editor.css"
         }
         }
         'js-template': {
         options: {
         mainConfigFile: "app/bmotion.config.js",
         baseUrl: "app",
         removeCombined: true,
         findNestedDependencies: true,
         name: "bmotion.template",
         out: "build/template/bmotion.template.js",
         skipDirOptimize: true,
         keepBuildDir: false,
         noBuildTxt: true
         }
         ,cssmin: {
         options: {
         keepBuildDir: true,
         optimizeCss: "standard",
         cssPrefix: "",
         cssIn: "app/css/bmotion.css",
         out: "build/<%= mode %>/css/bmotion.min.css"
         }
         }
         },*/
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
        /*copy: {
         editor: {
         files: [
         {
         expand: true,
         cwd: 'app/',
         src: ['extensions/**', 'images/**', 'css/font-files/**', 'editor.html'],
         dest: 'build/<%= mode %>/'
         }
         ]
         },
         resources: {
         files: [
         {
         expand: true,
         cwd: 'app/',
         src: ['bmotion.json', 'resources/templates/bms-<%= mode %>-view.html', 'resources/templates/bms-<%= mode %>-ui.html', 'resources/templates/bms-editor.html', 'js/require.js', 'css/bootstrap/fonts/**'],
         dest: 'build/<%= mode %>/'
         }
         ]
         },
         template: {
         files: [
         {
         expand: true,
         cwd: 'app/resources/template/',
         src: ['**'],
         dest: 'build/template'
         }
         ]
         },
         root: {
         files: [
         {
         expand: true,
         cwd: 'app/',
         src: ['<%= mode %>.html'],
         dest: 'build/<%= mode %>/',
         filter: 'isFile'
         rename: function (dest) {
         return dest + 'index.html';
         }/
         }
         ]
         }
         },*/
        compress: {
            main: {
                options: {
                    archive: 'build/<%= mode %>.zip'
                },
                files: [
                    {expand: true, cwd: 'build/<%= mode %>/', src: ['**']}
                ]
            }
        }
    });

    //grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-bump');
    //grunt.loadNpmTasks('grunt-contrib-copy');
    //grunt.loadNpmTasks('grunt-contrib-compress');
    //grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-electron');

    grunt.registerTask('default', ['build']);

    //grunt.registerTask('prepare', ['bower:install', 'requirejs:css-main', 'requirejs:js-main', 'copy:resources', 'copy:root']);
    grunt.registerTask('prepare', ['bower:install']);
    //grunt.registerTask('build', ['standalone', 'online', 'template']);
    grunt.registerTask('build', ['standalone']);
    //grunt.registerTask('editor', ['requirejs:js-editor', 'requirejs:css-editor', 'copy:editor']);

    targets.forEach(function (target) {
        grunt.registerTask('standalone_' + target, '', function () {
            grunt.config.set('mode', 'standalone');
            grunt.task.run(['prepare', 'electron:' + target]);
        });
    });

    grunt.registerTask('standalone_all', '', function () {
        grunt.config.set('mode', 'standalone');
        grunt.task.run(['prepare', 'electron']);
    });

    /*grunt.registerTask('online', '', function () {
     grunt.config.set('mode', 'online');
     grunt.task.run(['prepare', 'compress']);
     });*/
    //grunt.registerTask('template', ['bower:install', 'requirejs:js-template', 'copy:template', 'compress']);

    grunt.registerTask('dist', ['clean', 'build', 'bump']);

};
