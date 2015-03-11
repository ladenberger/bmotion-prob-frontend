define(["bmotion.config", "socketio"], function (config, io) {
        // ---------------------
        // Establish client socket
        // ---------------------
        return io.connect(config.socket.protocol + '//' + config.socket.host + ':' + config.socket.port);
    }
);
