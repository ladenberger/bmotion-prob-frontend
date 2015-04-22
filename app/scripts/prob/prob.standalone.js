/**
 * BMotion Studio for ProB Standalone Module
 *
 */
define(['angularAMD', 'angular', 'prob.graph', 'prob.iframe', 'prob.ui'], function (angularAMD) {

    var module = angular.module('prob.standalone', ['prob.graph', 'prob.iframe', 'prob.ui'])
        .run(['ws', function (ws) {

            // Load native UI library
            var gui = require('nw.gui');
            // Get the current window
            var win = gui.Window.get();
            // Listen to close event
            win.on('close', function () {
                this.hide(); // Pretend to be closed already
                ws.emit('clientClosed', {data: {}});
                //this.close(true);
            });

        }]);
    return angularAMD.bootstrap(module);

});