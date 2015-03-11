define(['bmotion.socket'], function (socket) {

        var callMethod = function (options, origin) {
            var settings = normalize($.extend({
                name: "",
                callback: function () {
                }
            }, options), ["callback"], origin);
            socket.emit("callMethod", {data: normalize(settings, ["callback"], origin)}, function (data) {
                origin !== undefined ? settings.callback.call(this, origin, data) : settings.callback.call(this, data)
            });
            return settings
        };

        function normalize(obj, exclude, origin) {
            exclude = exclude === 'undefined' ? [] : exclude;
            var obj2 = $.extend(true, {}, obj);
            _normalize(obj2, exclude, origin);
            return obj2
        }

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
                            if (isFunction(obj[property])) {
                                var r = origin !== undefined ? obj[property]($(origin)) : obj[property]();
                                obj[property] = r;
                            }
                        }
                    }
                }
            }
        }

        function isFunction(functionToCheck) {
            var getType = {};
            return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
        }

        return {
            callMethod: callMethod,
            normalize: normalize,
            isFunction: isFunction
        }

    }
);
