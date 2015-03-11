define(['module', 'jquery'], function (module) {

    var defaultConfig = {
        socket: {
            protocol: document.location.protocol,
            host: document.location.hostname,
            port: 19090
        },
        model: "",
        script: "",
        tool: "BAnimation"
    };

    return $.extend(true, defaultConfig, module.config());

});