/**
 * BMotion Studio Helper Module
 *
 */
define([], function () {

        function _normalize(obj, exclude, origin) {
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (origin !== undefined) {
                        $(origin).data(property, obj[property]);
                    }
                    if (typeof obj[property] == "object") {
                        _normalize(obj[property], exclude, origin);
                    } else {
                        if ($.inArray(property, exclude) === -1) {
                            if (func.isFunction(obj[property])) {
                                var r = origin !== undefined ? obj[property]($(origin)) : obj[property]();
                                obj[property] = r;
                            }
                        }
                    }
                }
            }
        }

        function _s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        var func = {

            /*callMethod: function (options, origin) {
             var settings = normalize($.extend({
             name: "",
             callback: function () {
             }
             }, options), ["callback"], origin);
             socket.emit("callMethod", {data: normalize(settings, ["callback"], origin)}, function (data) {
             origin !== undefined ? settings.callback.call(this, origin, data) : settings.callback.call(this, data)
             });
             return settings
             },*/

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

            normalize: function (obj, exclude, origin) {
                exclude = exclude === 'undefined' ? [] : exclude;
                var obj2 = $.extend(true, {}, obj);
                _normalize(obj2, exclude, origin);
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

            uuid: function () {
                return _s4() + _s4() + '-' + _s4() + '-' + _s4() + '-' +
                    _s4() + '-' + _s4() + _s4() + _s4();
            }

        };

        return func;

    }
);
