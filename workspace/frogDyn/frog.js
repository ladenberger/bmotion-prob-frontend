requirejs(['../../app/scripts/bmotion.vis.dev'], function () {

    for (var i = 1; i <= 7; i++) {

        $("#pos" + i)
            .observe("formula", {
                formulas: ["positions(" + i + ")"],
                trigger: function (origin, res) {
                    if (res[0]) {
                        origin.attr("xlink:href", res[0].substring(0, 5) + ".png");
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

});
