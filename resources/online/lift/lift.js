requirejs(['bmotion.vis'], function () {

    $("text[data-floor]").observe("formula", {
        formulas: ["floor"],
        trigger: function (origin, data) {
            origin.attr("fill", origin.attr("data-floor") === data[0] ? "green" : "red");
        }
    });

    $("#txt_floor").observe("formula", {
        formulas: ["floor"],
        trigger: function (origin, r) {
            origin.text('Current Floor: ' + r[0]);
        }
    });

    $("#txt_direction").observe("formula", {
        formulas: ["move"],
        trigger: function (origin, r) {
            origin.text('Moving: ' + r[0]);
        }
    }).executeEvent({
        events: [{name: "switch_move_up"}, {name: "switch_move_dn"}]
    });

    $("#lift").observe("formula", {
        formulas: ["floor"],
        trigger: function (origin, val) {
            var door = origin.find("#door");
            switch (val[0]) {
                case "0":
                    door.attr("y", "275");
                    break;
                case "1":
                    door.attr("y", "175");
                    break;
                case "2":
                    door.attr("y", "60");
                    break;
            }
        }
    });

    $("#door").observe("formula", {
        formulas: ["door"],
        trigger: function (origin, val) {
            val[0] === "open" ? origin.attr("fill", "white") : origin.attr("fill", "lightgray");
        }
    });

    $("#door").executeEvent({
        events: [{name: "close_door"}, {name: "open_door"}, {name: "move_serve"}]
    });

    $("#bt_move_up").executeEvent({
        events: [{name: "move_up"}, {name: "move_up_stop"}]
    });

    $("#bt_move_down").executeEvent({
        events: [{name: "move_dn"}, {name: "move_dn_stop"}]
    });

    $("text[data-floor]").executeEvent({
        events: [
            {
                name: "send_request", predicate: function (origin) {
                return "f=" + origin.attr("data-floor")
            }
            }
        ]
    });

})
;
