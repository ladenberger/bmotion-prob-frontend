requirejs(['../../app/scripts/bmotion.vis.dev'], function () {

    requirejs(['snap.svg-min.js'], function (Snap) {

        var dd = false;

        $('body').observe("formula", {
            formulas: ["card(positions)"],
            trigger: function (origin, r) {

                if (r[0] && !dd) {

                    var nr = parseInt(r[0]);

                    // Generate places
                    var s = Snap(nr * 50, 45);
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

                    dd = true;

                }

            }
        });


    });

});
