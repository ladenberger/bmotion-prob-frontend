requirejs(['../../app/bmotion.config.js'], function () {

    requirejs(['../../app/bmotion.vis'], function () {

        requirejs(['libs/snap.svg-min.js'], function (Snap) {

            var initialised = false;

            $('body').observe("formula", {
                formulas: ["card(positions)"],
                translate: true,
                cause: "ModelInitialised",
                trigger: function (origin, r) {

                    if (r[0] && !initialised) {

                        var nr = r[0];

                        // Generate places
                        var s = Snap(nr * 50, 45);
                        s.attr("id", "frog");
                        var xoffset = 0;
                        for (var i = 1; i <= nr; i++) {
                            var place = s.image("free.png", xoffset, 0, 50, 45);
                            place.attr("id", i);
                            xoffset = xoffset + 50;
                            $(place.node)
                                .observe("formula", {
                                    formulas: ["positions(" + i + ")"],
                                    trigger: function (origin, res) {
                                        if (res[0]) {
                                            origin.attr("href", res[0].substring(0, 5) + ".png");
                                            origin.attr("data-frog", res[0]);
                                        }
                                    }
                                })
                                .executeEvent({
                                    tooltip: false,
                                    events: [
                                        {
                                            name: "Move_right",
                                            predicate: function (origin) {
                                                return "x=" + origin.attr("data-frog");
                                            }
                                        },
                                        {
                                            name: "Move_left",
                                            predicate: function (origin) {
                                                return "x=" + origin.attr("data-frog");
                                            }
                                        },
                                        {
                                            name: "Hop_right",
                                            predicate: function (origin) {
                                                return "x=" + origin.attr("data-frog");
                                            }
                                        },
                                        {
                                            name: "Hop_left",
                                            predicate: function (origin) {
                                                return "x=" + origin.attr("data-frog");
                                            }
                                        }
                                    ]
                                });
                        }

                        initialised = true;

                    }

                }

            });

        });

    });

});