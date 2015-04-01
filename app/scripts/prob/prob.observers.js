/**
 * BMotion Studio for ProB Observer Module
 *
 */
define(['prob.api', 'angular', 'jquery', 'xeditable', 'cytoscape'], function (prob) {

    function isFunction(functionToCheck) {
        var getType = {};
        return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
    }

    return angular.module('prob.observers', ['bms.main'])
        .service('bmsObserverService', function () {
            var observers = {};
            var events = {};
            var bmsidCache = {};
            var observerService = {
                addObserver: function (name, o) {
                    if (observers[name] === undefined) {
                        observers[name] = [];
                    }
                    var no = $.extend({cause: "AnimationChanged"}, o);
                    observers[name].push(no);
                },
                addEvent: function (name, e) {
                    if (events[name] === undefined) {
                        events[name] = [];
                    }
                    events[name].push(e);
                },
                addObservers: function (name, obs) {
                    if (observers[name] === undefined) {
                        observers[name] = [];
                    }
                    if (obs) {
                        $.each(obs, function (i, v) {
                            observerService.addObserver(name, v)
                        });
                    }
                },
                addEvents: function (name, evts) {
                    if (events[name] === undefined) {
                        events[name] = [];
                    }
                    if (evts) {
                        $.each(evts, function (i, v) {
                            observerService.addEvent(name, v)
                        });
                    }
                },
                getObservers: function (name) {
                    return observers[name];
                },
                getEvents: function (name) {
                    return events[name];
                },
                getAllObservers: function () {
                    return observers;
                },
                getAllEvents: function () {
                    return events;
                },
                getBmsIds: function (selector, element) {
                    var bmsid = element.attr("data-bms-id");
                    if (bmsidCache[bmsid] === undefined) {
                        bmsidCache[bmsid] = {};
                    }
                    if (bmsidCache[bmsid][selector] === undefined) {
                        var bmsids = $(element).find(selector).map(function () {
                            return $(this).attr("data-bms-id");
                        });
                        bmsidCache[bmsid][selector] = bmsids;
                    }
                    return bmsidCache[bmsid][selector];
                }
            };
            return observerService;
        })
        .service('csp-event', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var replaceParameter = function (str, para) {
                var fstr = str;
                angular.forEach(para, function (p, i) {
                    var find = '{{a' + (i + 1) + '}}';
                    var re = new RegExp(find, 'g');
                    fstr = fstr.replace(re, p);
                });
                return fstr;
            };

            return {
                check: function (observer, element, stateid) {
                    var defer = $q.defer();
                    ws.emit("observeCSPTrace", {
                        data: {
                            observers: observer.data.observers,
                            stateid: stateid
                        }
                    }, function (result) {

                        var fmap = {};

                        angular.forEach(result.ops, function (t) {

                            angular.forEach(observer.data.observers, function (o) {

                                var exprArray = result.exp[o.exp].replace("{", "").replace("}", "").split(",");

                                if ($.inArray(t.name, exprArray) > -1) {

                                    angular.forEach(o.actions, function (a) {

                                        var selector = replaceParameter(a.selector, t.parameter);
                                        var attr = replaceParameter(a.attr, t.parameter);
                                        var value = replaceParameter(a.value, t.parameter);
                                        var bmsids = bmsObserverService.getBmsIds(selector, element);
                                        angular.forEach(bmsids, function (id) {
                                            if (fmap[id] === undefined) {
                                                fmap[id] = {};
                                            }
                                            fmap[id][attr] = value;
                                        });

                                    });

                                }

                            });

                        });
                        defer.resolve(fmap);
                    });

                    return defer.promise;
                }
            }
        }])
        .service('formula', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var formulaObserver = {
                getFormulas: function (observer) {
                    return observer.data.formulas;
                },
                apply: function (observer, element, result) {
                    var defer = $q.defer();
                    if (observer.data.trigger !== undefined) {
                        var elements = element.find(observer.data.selector);
                        elements.each(function (i, el) {
                            observer.data.trigger.call(this, $(el), result);
                        });
                        defer.resolve();
                    } else if (observer.data.getChanges !== undefined) {
                        var obj = {};
                        var rr = observer.data.getChanges.call(this, result);
                        if (rr) {
                            var bmsids = bmsObserverService.getBmsIds(observer.data.selector, element);
                            angular.forEach(bmsids, function (id) {
                                obj[id] = rr;
                            });
                        }
                        defer.resolve(obj);
                    } else {
                        defer.resolve();
                    }
                    return defer.promise;
                },
                check: function (observers, element, stateid) {
                    var defer = $q.defer();
                    var oo = {};
                    angular.forEach(observers, function (o) {
                        angular.forEach(o.data.formulas, function (f) {
                            oo[f] = {};
                            // TODO: handle translate property ...
                        });
                    });
                    ws.emit("observe", {data: {observers: oo, stateId: stateid}}, function (data) {

                        var promises = [];

                        $.each(observers, function (i, o) {
                            var ff = [];
                            angular.forEach(o.data.formulas, function (f) {
                                ff.push(data[f] ? data[f].result : null);
                            });
                            promises.push(formulaObserver.apply(o, element, ff));
                        });

                        var fvalues = {};
                        $q.all(promises).then(function (data) {
                            angular.forEach(data, function (value) {
                                if (value !== undefined) {
                                    $.extend(true, fvalues, value);
                                }
                            });
                            defer.resolve(fvalues);
                        });

                    });
                    return defer.promise;
                }
            };

            return formulaObserver;

        }])
        .service('refinement', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            return {
                check: function (observer, element, stateid) {

                    var defer = $q.defer();

                    var settings = $.extend({
                        refinements: [],
                        cause: "ModelChanged",
                        enable: [],
                        disable: []
                    }, observer.data);

                    ws.emit("observeRefinement", {data: settings}, function (data) {
                        var obj = {};
                        var rr;
                        $.each(settings.refinements, function (i, v) {
                            if ($.inArray(v, data.refinements) > -1) {
                                rr = settings.enable;
                            } else {
                                rr = settings.disable;
                            }
                        });
                        if (rr) {
                            var bmsids = bmsObserverService.getBmsIds(settings.selector, element);
                            angular.forEach(bmsids, function (id) {
                                obj[id] = rr;
                            });
                        }
                        defer.resolve(obj);
                    });


                    return defer.promise;
                }
            }

        }])
        .service('predicate', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var observePredicateHelper = function (tf, element, selector) {
                if (Object.prototype.toString.call(tf) === '[object Object]') {
                    return tf;
                } else if (isFunction(tf)) {
                    var el = element.find(selector);
                    el.each(function (i, v) {
                        tf.call(this, $(v))
                    });
                    return null;
                }
            };

            var predicateObserver = {

                apply: function (observer, element, result) {
                    var defer = $q.defer();
                    var settings = $.extend({
                        predicate: "",
                        true: {},
                        false: {},
                        cause: "AnimationChanged",
                        callback: function () {
                        }
                    }, observer.data);
                    var rr = {};
                    if (result === "TRUE") {
                        rr = observePredicateHelper(settings.true, element, settings.selector)
                    } else if (result === "FALSE") {
                        rr = observePredicateHelper(settings.false, element, settings.selector)
                    }
                    var obj = {};
                    if (rr) {
                        var bmsids = bmsObserverService.getBmsIds(settings.selector, element);
                        angular.forEach(bmsids, function (id) {
                            obj[id] = rr;
                        });
                    }
                    defer.resolve(obj);
                    return defer.promise;
                },
                check: function (observers, element, stateid) {
                    var defer = $q.defer();
                    var oo = {};
                    $.each(observers, function (i, o) {
                        oo[o.data.predicate] = {};
                    });
                    var promises = [];
                    var startWebsocket = new Date().getTime();
                    ws.emit("observe", {data: {observers: oo, stateId: stateid}}, function (data) {
                        var end = new Date().getTime();
                        var time = end - startWebsocket;
                        console.log('WEBSOCKET: ' + time);
                        var startPredicate = new Date().getTime();
                        angular.forEach(observers, function (o) {
                            var r = data[o.data.predicate];
                            if (r) {
                                promises.push(predicateObserver.apply(o, element, r.result));
                            }
                        });
                        var endPredicate = new Date().getTime();
                        var time = endPredicate - startPredicate;
                        console.log('PREDICATE OBSERVER: ' + time);
                        var fvalues = {};
                        $q.all(promises).then(function (data) {
                            angular.forEach(data, function (value) {
                                if (value !== undefined) {
                                    $.extend(true, fvalues, value);
                                }
                            });
                            defer.resolve(fvalues);
                        });
                    });
                    return defer.promise;
                }
            };

            return predicateObserver;

        }])
        .service('executeEvent', ['ws', '$q', function (ws, $q) {

            var executeEvent = function (data, origin) {
                var settings = prob.normalize($.extend({
                    events: [],
                    callback: function () {
                    }
                }, data), ["callback"], origin);
                ws.emit("executeEvent", {data: settings}, function (result) {
                    settings.callback.call(this, result)
                });
                return settings
            };

            return {

                setup: function (event, element) {

                    var defer = $q.defer();

                    var settings = $.extend({
                        events: [],
                        tooltip: true,
                        callback: function () {
                        }
                    }, event.data);

                    var el = $(element).find(settings.selector);
                    el.each(function (i2, v) {
                        var e = $(v);
                        e.click(function (e) {
                            executeEvent(settings, $(e.target))
                        }).css('cursor', 'pointer');
                        if (settings.tooltip) {
                            e.tooltipster({
                                position: "top-left",
                                animation: "fade",
                                hideOnClick: true,
                                updateAnimation: false,
                                offsetY: 15,
                                delay: 500,
                                content: 'Loading...',
                                theme: 'tooltipster-shadow',
                                interactive: true,
                                functionBefore: function (origin, continueTooltip) {
                                    continueTooltip();
                                    ws.emit('initTooltip', {
                                        data: prob.normalize(settings, ["callback"], origin)
                                    }, function (data) {
                                        var container = $('<ul></ul>');
                                        $.each(data.events, function (i, v) {
                                            var spanClass = v.canExecute ? 'glyphicon glyphicon-ok-circle' : 'glyphicon glyphicon-remove-circle'
                                            var span = $('<span aria-hidden="true"></span>').addClass(spanClass);
                                            var link = $('<span> ' + v.name + '(' + v.predicate + ')</span>');
                                            if (v.canExecute) {
                                                link = $('<a href="#"> ' + v.name + '(' + v.predicate + ')</a>').click(function () {
                                                    executeEvent({
                                                        events: [{name: v.name, predicate: v.predicate}],
                                                        callback: function () {
                                                            // Update tooltip
                                                            origin.tooltipster('hide');
                                                            origin.tooltipster('show')
                                                        }
                                                    })
                                                });
                                            }
                                            container.append($('<li></li>').addClass(v.canExecute ? 'enabled' : 'disabled').append(span, link))
                                        });
                                        origin.tooltipster('content', container)
                                    });
                                }
                            });
                        }
                        defer.resolve();
                    });
                    return defer.promise;
                }
            }
        }]);

});