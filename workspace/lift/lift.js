require(['../../app/scripts/bmotion-vis-dev'], function () {

    $("text[data-floor]").observe("formula", {
        formulas: ["cur_floor"],
        trigger: function (origin, data) {
            origin.attr("fill", origin.attr("data-floor") === data[0] ? "green" : "red");
        }
    });

    $("#txt_cur_floor").observe("formula", {
        formulas: ["cur_floor"],
        trigger: function (origin, data) {
            origin.text('Current Floor: ' + data[0]);
        }
    });

    $("#lift").observe("formula", {
        //formulas: ["cur_floor", "door_open"],
        formulas: ["cur_floor"],
        trigger: function (origin, val) {
            var door = origin.find("#door");
            //val[1] === "TRUE" ? door.attr("fill", "white") : door.attr("fill", "lightgray");
            switch (val[0]) {
                case "0":
                    door.attr("y", "175");
                    break;
                case "1":
                    door.attr("y", "60");
                    break;
                case "-1":
                    door.attr("y", "275");
                    break;
            }
        }
    });

    $("#door").observe("predicate", {
        predicate: "door_open",
        true: {
            fill: "white"
        },
        false: {
            fill: "lightgray"
        }
    });

    $("#door").executeEvent({
        events: [{name: "close_door"}, {name: "open_door"}]
    });


    $("text[data-floor]").executeEvent({
        events: [
            {
                name: "push_call_button", predicate: function (origin) {
                return "b=" + origin.attr("data-floor")
            }
            },
            {
                name: "push_inside_button", predicate: function (origin) {
                return "b=" + origin.attr("data-floor")
            }
            }
        ]
    });


});
