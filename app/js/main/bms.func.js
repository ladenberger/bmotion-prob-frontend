/**
 * BMotion Studio Helper Module
 *
 */
define(['jquery'], function($) {

  var api = {

    inArray: function(obj, array) {
      return !($.inArray(obj, array) === -1);
    },
    mapFilter: function(arr, func) {
      return arr.map(func).filter(function(x) {
        return typeof x !== 'undefined';
      });
    },
    toList: function(obj) {
      return Object.prototype.toString.call(obj) !== '[object Array]' ? [obj] : obj;
    },
    getUrlParameter: function(sParam) {
      var sPageURL = window.location.search.substring(1);
      var sURLVariables = sPageURL.split('&');
      for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
          return sParameterName[1];
        }
      }
    },
    _normalize: function(obj, exclude, origin, container) {
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          if (origin !== undefined) {
            origin.data(property, obj[property]);
          }
          if (typeof obj[property] == "object") {
            api._normalize(obj[property], exclude, origin, container);
          } else {
            if ($.inArray(property, exclude) === -1) {
              obj[property] = api.callOrReturn(obj[property], origin, container, obj[property + "Js"]);
            }
          }
        }
      }
    },
    normalize: function(obj, exclude, origin, container) {
      exclude = exclude === 'undefined' ? [] : exclude;
      var obj2 = $.extend(true, {}, obj);
      api._normalize(obj2, exclude, origin, container);
      return obj2
    },
    callOrReturn: function(subject, element, container, isJsString) {
      if (typeof subject === "boolean") {
        return subject;
      } else if (api.isFunction(subject)) {
        return subject.call(this, element, container);
      } else if (isJsString) {
        try {
          var func = new Function('origin', 'container', subject);
          return func(element, container);
        } catch (err) {
          return subject;
        }
      } else {
        return subject;
      }
    },
    convertFunction: function(parameters, func) {
      if (typeof func === 'function') {
        return func;
      } else {
        // Whenever the function comes from json, we need to convert
        // the string function to a real javascript function
        // TODO: We need to handle errors while converting the string function to a reals javascript function
        return new Function(parameters, func);
      }
    },
    isFunction: function(functionToCheck) {
      var getType = {};
      return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    },
    isEmpty: function(map) {
      for (var key in map) {
        if (map.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },
    _s4: function() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    },
    uuid: function() {
      return api._s4() + api._s4() + '-' + api._s4() + '-' + api._s4() + '-' +
        api._s4() + '-' + api._s4() + api._s4() + api._s4();
    }
  };

  return api;

});
