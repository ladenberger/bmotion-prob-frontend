/**
 * BMotion Studio for ProB Observer Module
 *
 */
define(['prob.api', 'angular', 'xeditable', 'qtip'], function (prob) {

    return angular.module('prob.observers', ['bms.common', 'prob.modal'])
        .service('bmsObserverService', ['$q', '$injector', function ($q, $injector) {
            var observers = {};
            var events = {};
            var bmsidCache = {};
            var hasErrors = false;
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
                getBmsIds: function (selector, element) {
                    var bmsid = element.attr("data-bms-id");
                    if (!bmsid) {
                        bmsid = prob.uuid();
                        element.attr("data-bms-id", bmsid);
                    }
                    if (bmsidCache[bmsid] === undefined) {
                        bmsidCache[bmsid] = {};
                    }
                    if (bmsidCache[bmsid][selector] === undefined) {
                        var bmsids = $(element).find(selector).map(function () {
                            var cbmsid = $(this).attr("data-bms-id");
                            if (!cbmsid) {
                                cbmsid = prob.uuid();
                                $(this).attr("data-bms-id", cbmsid);
                            }
                            return cbmsid;
                        });
                        bmsidCache[bmsid][selector] = bmsids;
                    }
                    return bmsidCache[bmsid][selector];
                },
                checkObserver: function (observer, container, stateId, trigger, data) {
                    var defer = $q.defer();
                    var observerInstance = $injector.get(observer.type, '');
                    if (observerInstance) {
                        if (!trigger) trigger = trigger.TRIGGER_ANIMATION_CHANGED;
                        observerInstance.check(observer, container, stateId, trigger, data).then(function (res) {
                            defer.resolve(res);
                        });
                    }
                    return defer.promise;
                },
                checkObservers: function (observers, container, stateId, trigger, data) {

                    var defer = $q.defer();

                    var formulaObservers = [];
                    var predicateObservers = [];
                    var promises = [];

                    if (!trigger) trigger = trigger.TRIGGER_ANIMATION_CHANGED;
                    observerService.hideErrors(container);

                    angular.forEach(observers, function (o) {
                        if (o.type === 'formula') {
                            formulaObservers.push(o);
                        } else if (o.type === 'predicate') {
                            predicateObservers.push(o);
                        } else {
                            var observerInstance = $injector.get(o.type, "");
                            if (observerInstance) {
                                promises.push(observerInstance.check(o, container, stateId, trigger, data));
                            }
                        }
                    });

                    // Special case for formula observers
                    if (!$.isEmptyObject(formulaObservers)) {
                        // Execute formula observer at once (performance boost)
                        var observerInstance = $injector.get("formula", "");
                        promises.push(observerInstance.check(formulaObservers, container, stateId, trigger, data));
                    }

                    // Special case for predicate observers
                    if (!$.isEmptyObject(predicateObservers)) {
                        // Execute predicate observer at once (performance boost)
                        var observerInstance = $injector.get("predicate", "");
                        promises.push(observerInstance.check(predicateObservers, container, stateId, trigger, data));
                    }

                    $q.all(promises).then(function (res) {
                        defer.resolve(res);
                    });

                    return defer.promise;

                },
                hideErrors: function (container) {
                    if (hasErrors) {
                        container.find('[data-hasqtip]').qtip('destroy');
                    }
                    hasErrors = false;
                },
                showError: function (element, type, error) {

                    if (!element.get(0)) element = $('body');
                    // TODO: check if element exists, if not attached qtip to root element (e.g. body)
                    if (!element.data('qtip-error')) {
                        element.qtip({ // Grab some elements to apply the tooltip to
                            content: {
                                text: '',
                                title: 'Observer errors'
                            },
                            position: {
                                my: 'top left',
                                at: 'center left',
                                effect: false,
                                viewport: $(window)
                            },
                            show: {
                                when: false,
                                ready: true
                            },
                            hide: {
                                event: false,
                                inactive: 10000
                            },
                            style: {
                                classes: 'qtip-rounded qtip-red'
                            }
                        });
                        element.data('qtip-error', true)
                    }
                    var api = element.qtip('api');
                    if (api) {
                        api.set('content.text', '<p><span style="font-weight:bold">' + type + '</span>: ' + error + '</p>' + api.get('content.text'));
                    }
                    hasErrors = true;
                }
            };
            return observerService;
        }])
        .service('csp-event', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var expressionCache = {};

            var replaceParameter = function (str, para) {
                var fstr = str;
                angular.forEach(para, function (p, i) {
                    var find = '{{a' + (i + 1) + '}}';
                    var re = new RegExp(find, 'g');
                    fstr = fstr.replace(re, p);
                });
                return fstr;
            };

            var getExpression = function (observer, stateId, traceId) {

                var defer = $q.defer();

                var formulas = [];
                angular.forEach(observer.data.observers, function (o) {
                    if (o.exp) formulas.push({formula: o.exp});
                });

                var expressions = expressionCache[traceId];
                if (!expressions) {
                    ws.emit("evaluateFormulas", {
                        data: {
                            formulas: formulas,
                            stateId: stateId,
                            traceId: traceId
                        }
                    }, function (data) {

                        expressionCache[traceId] = data;
                        angular.forEach(data, function (e) {
                            if (e.error) {
                                var msg = "Message: " + e.error;
                                bmsObserverService.showError($(observer.element), 'CSP Event Observer', msg);
                            } else {
                                e.trans = e.result.replace("{", "").replace("}", "").split(",");
                            }
                        });
                        defer.resolve(data);
                    });
                } else {
                    defer.resolve(expressions);
                }

                return defer.promise;

            };

            return {
                check: function (observer, container, stateId, trigger, data) {

                    var defer = $q.defer();

                    getExpression(observer, stateId).then(function (expressions) {

                        ws.emit("getHistory", {
                            data: {
                                stateId: stateId
                            }
                        }, function (data) {

                            var fmap = {};

                            angular.forEach(data['ops'], function (t) {

                                angular.forEach(observer.data.observers, function (o) {

                                    var events = [];
                                    if (o.exp) {
                                        var eventsFromExp = expressions[o.exp].trans;
                                        if (eventsFromExp) {
                                            events = events.concat(eventsFromExp);
                                        }
                                    }
                                    if (o.events) {
                                        events = events.concat(o.events);
                                    }

                                    if ($.inArray(t.name, events) > -1) {
                                        if (o.trigger) {
                                            o.trigger.call(this, t);
                                        }
                                        angular.forEach(o.actions, function (a) {
                                            var selector;
                                            if (prob.isFunction(a.selector)) {
                                                selector = a.selector.call(this, t);
                                            } else {
                                                selector = replaceParameter(a.selector, t.parameter);
                                            }
                                            var attr = replaceParameter(a.attr, t.parameter);
                                            var value = replaceParameter(a.value, t.parameter);
                                            var bmsids = bmsObserverService.getBmsIds(selector, $(observer.element));
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
                apply: function (observer, container, result) {
                    var defer = $q.defer();
                    if (observer.data.trigger !== undefined) {
                        var element = container.find("[data-bms-id=" + observer.bmsid + "]");
                        observer.data.trigger.call(this, $(element), result);
                        defer.resolve();
                    } else if (observer.data.getChanges !== undefined) {
                        var obj = {};
                        var rr = observer.data.getChanges.call(this, result);
                        if (rr) {
                            var bmsids = bmsObserverService.getBmsIds(observer.data.selector, container);
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
                check: function (observer, container, stateId, trigger) {

                    var defer = $q.defer();

                    var observers = Object.prototype.toString.call(observer) !== '[object Array]' ? [observer] : observer;

                    // Collect formulas
                    var formulas = [];
                    angular.forEach(observers, function (o) {
                        if (o.data.cause === trigger) {
                            angular.forEach(o.data.formulas, function (f) {
                                formulas.push({
                                    formula: f,
                                    translate: o.data.translate ? o.data.translate : false
                                });
                            });
                        }
                    });

                    // Evaluate formulas
                    ws.emit("evaluateFormulas", {
                        data: {
                            formulas: formulas,
                            stateId: stateId
                        }
                    }, function (data) {
                        var promises = [];
                        angular.forEach(observers, function (o) {
                            if (o.data.cause === trigger) {
                                var ff = [];
                                angular.forEach(o.data.formulas, function (f) {
                                    var formula = data[f];
                                    if (formula.error) {
                                        var e = o.element ? o.element : container.find("[data-bms-id=" + o.bmsid + "]");
                                        var msg = "Formula: " + formula + ", Message: " + formula.error;
                                        bmsObserverService.showError($(e), 'Formula Observer', msg);
                                        ff.push(null);
                                    } else {
                                        if (data[f]) {
                                            ff.push(data[f].trans ? data[f].trans : data[f].result);
                                        }
                                    }
                                });
                                promises.push(formulaObserver.apply(o, container, ff));
                            }
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
        .service('refinement', ['ws', '$q', 'bmsVisualisationService', function (ws, $q, bmsVisualisationService) {

            return {
                check: function (observer, container, stateId, trigger, data) {

                    var defer = $q.defer();

                    //TODO: Check refinement observer only once!
                    var vis = bmsVisualisationService.getVisualisation(data.visId);
                    var refinements = vis.refinements;

                    if (refinements) {
                        var obj = {};
                        var rr;

                        $.each(observer.data.refinements, function (i, v) {
                            if ($.inArray(v, refinements) > -1) {
                                rr = observer.data.enable;
                            } else {
                                rr = observer.data.disable;
                            }
                        });

                        if (rr) {
                            obj[observer.bmsid] = rr
                        }

                        defer.resolve(obj);
                    }

                    return defer.promise;

                }
            }

        }])
        .service('predicate', ['ws', '$q', 'bmsObserverService', function (ws, $q, bmsObserverService) {

            var observePredicateHelper = function (tf, element, observer) {
                if (Object.prototype.toString.call(tf) === '[object Object]') {
                    return tf;
                } else if (prob.isFunction(tf)) {
                    var el = observer.element ? $(observer.element) : element.find(observer.data.selector);
                    el.each(function (i, v) {
                        tf.call(this, $(v))
                    });
                    return null;
                }
            };

            var predicateObserver = {

                getFormulas: function (observer) {
                    return [observer.data.predicate];
                },
                apply: function (observer, element, result) {
                    var defer = $q.defer();
                    var rr = {};
                    if (result[0] === "TRUE") {
                        rr = observePredicateHelper(observer.data.true, element, observer);
                    } else if (result[0] === "FALSE") {
                        rr = observePredicateHelper(observer.data.false, element, observer);
                    }
                    var obj = {};
                    if (rr) {
                        obj[observer.bmsid] = rr;
                    }
                    defer.resolve(obj);
                    return defer.promise;
                },
                check: function (observers, container, stateId, trigger) {
                    var defer = $q.defer();
                    var promises = [];
                    //var startWebsocket = new Date().getTime();

                    // Collect formulas
                    var formulas = [];
                    angular.forEach(observers, function (o) {
                        if (o.data.cause === trigger) {
                            formulas.push({
                                formula: o.data.predicate,
                                translate: o.data.translate ? o.data.translate : false
                            });
                        }
                    });

                    ws.emit("evaluateFormulas", {
                        data: {
                            formulas: formulas,
                            stateId: stateId
                        }
                    }, function (data) {
                        //var end = new Date().getTime();
                        //var time = end - startWebsocket;
                        //console.log('WEBSOCKET: ' + time);
                        //var startPredicate = new Date().getTime();
                        angular.forEach(observers, function (o) {
                            if (o.data.cause === trigger) {
                                var r = data[o.data.predicate];
                                if (r) {
                                    promises.push(predicateObserver.apply(o, container, [r.result]));
                                }
                            }
                        });
                        //var endPredicate = new Date().getTime();
                        //var time = endPredicate - startPredicate;
                        //console.log('PREDICATE OBSERVER: ' + time);
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

            var ev = {

                executeEvent: function (data, origin) {
                    var settings = prob.normalize($.extend({
                        events: [],
                        callback: function () {
                        }
                    }, data), ["callback"], origin);
                    ws.emit("executeEvent", {data: settings}, function (result) {
                        settings.callback.call(this, result)
                    });
                    return settings
                },
                getTooltipContent: function (data, origin, api) {
                    var defer = $q.defer();
                    var traceId = data.traceId;
                    ws.emit('initTooltip', {
                        data: prob.normalize(data, ["callback"], origin)
                    }, function (data) {
                        var container = $('<div class="qtiplinks"></div>');
                        var ul = $('<ul style="display:table-cell;"></ul>');
                        angular.forEach(data.events, function (v) {
                            var spanClass = v.canExecute ? 'glyphicon glyphicon-ok-circle' : 'glyphicon glyphicon-remove-circle';
                            var predicateStr = v.predicate ? '(' + v.predicate + ')' : '';
                            var link = $('<span aria-hidden="true"> ' + v.name + predicateStr + '</span>').addClass(spanClass);
                            if (v.canExecute) {
                                link = $('<a href="#"> ' + v.name + predicateStr + '</a>').addClass(spanClass).click(function () {
                                    ev.executeEvent({
                                        traceId: traceId,
                                        events: [v],
                                        callback: function () {
                                            api.hide();
                                        }
                                    })
                                });
                            }
                            ul.append($('<li></li>').addClass(v.canExecute ? 'enabled' : 'disabled').append(link));
                        });
                        container.append(ul);
                        defer.resolve(container);
                    });
                    return defer.promise;
                },
                setup: function (event, element, traceId) {

                    var defer = $q.defer();

                    var settings = $.extend({
                        events: [],
                        tooltip: true,
                        traceId: traceId,
                        callback: function () {
                        }
                    }, event.data);

                    var el = event.element ? $(event.element) : $(element).find(settings.selector);
                    el.each(function (i2, v) {
                        var e = $(v);
                        e.click(function (event) {
                            $(e).qtip('hide');
                            ev.executeEvent(settings, $(event.target));
                        }).css('cursor', 'pointer');
                        if (settings.tooltip) {
                            e.qtip({ // Grab some elements to apply the tooltip to
                                content: {
                                    text: function (event, api) {
                                        return ev.getTooltipContent(settings, event.target, api).then(function (container) {
                                            return container;
                                        });
                                    }
                                },
                                position: {
                                    my: 'bottom left',
                                    at: 'top right',
                                    effect: false,
                                    viewport: $(window)
                                },
                                show: {
                                    delay: 600
                                },
                                hide: {
                                    fixed: true,
                                    delay: 300
                                },
                                style: {
                                    classes: 'qtip-light qtip-bootstrap'
                                }
                            });
                        }
                        defer.resolve();
                    });
                    return defer.promise;
                }
            };

            return ev;

        }]);

});