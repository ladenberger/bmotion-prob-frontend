module.exports = function (grunt) {

    var path = require('path');
    var cssBowerLibs = 'css/libs/bower/';
    var jsBowerLibs = 'js/libs/bower/';
    var appVersion = '0.2.2';
    var electronVersion = '0.32.1';
    var targets = ["linux-ia32", "linux-x64", "darwin-x64", "win32-ia32", "win32-x64"];

    grunt.initConfig({
        clean: ["build", "cache", "bower_components", "app/js/libs/bower", "app/css/libs/bower"],
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
        }
    });

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-electron');

    grunt.registerTask('default', ['build']);

    grunt.registerTask('prepare', ['bower:install']);
    grunt.registerTask('build', ['standalone_all']);

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

};
