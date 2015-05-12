/**
 * BMotion Studio Helper Module
 *
 */
define(['jquery'], function () {

    var api = {

        getUrlParameter: function (sParam) {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                if (sParameterName[0] == sParam) {
                    return sParameterName[1];
                }
            }
        },
        _normalize: function (obj, exclude, origin) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (origin !== undefined) {
                        $(origin).data(property, obj[property]);
                    }
                    if (typeof obj[property] == "object") {
                        api._normalize(obj[property], exclude, origin);
                    } else {
                        if ($.inArray(property, exclude) === -1) {
                            if (api.isFunction(obj[property])) {
                                var r = origin !== undefined ? obj[property]($(origin)) : obj[property]();
                                obj[property] = r;
                            }
                        }
                    }
                }
            }
        },
        normalize: function (obj, exclude, origin) {
            exclude = exclude === 'undefined' ? [] : exclude;
            var obj2 = $.extend(true, {}, obj);
            api._normalize(obj2, exclude, origin);
            return obj2
        },
        isFunction: function (functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        },
        isEmpty: function (map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        },
        _s4: function () {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        },
        uuid: function () {
            return api._s4() + api._s4() + '-' + api._s4() + '-' + api._s4() + '-' +
                api._s4() + '-' + api._s4() + api._s4() + api._s4();
        }

    };

    return api;

});
