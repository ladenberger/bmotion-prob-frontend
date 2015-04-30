requirejs(['bmotion.vis'], function () {

    // Observers
    // -----------------------------------
    // Observe output orders to electro valves
    $.each([
        {formula: "open_EV", element: "#e-order-open"},
        {formula: "close_EV", element: "#e-order-close"},
        {formula: "retract_EV", element: "#e-order-retract"},
        {formula: "extend_EV", element: "#e-order-extend"}
    ], function (i, v) {
        $(v.element).observe("formula", {
            formulas: [v.formula],
            refinement: "R5GearsDoorsHandleValvesController",
            trigger: function (origin, res) {
                origin.attr("class", "o_" + res[0]);
            }
        });
    });

    // -----------------------------------
    // Observe output orders to general electro valves
    // -----------------------------------
    $("#oev_general").observe("formula", {
        formulas: ["general_EV",
            "general_EV = TRUE & analogical_switch = switch_closed"],
        refinement: "R6GearsDoorsHandleValvesControllerSwitch",
        trigger: function (origin, r) {
            origin.find("#ge-order-1").attr("class", "o_" + r[0]);
            origin.find("#ge-order-2").attr("class", "o_" + r[1]);
        }
    });

    // -----------------------------------
    // Observe electro valves
    // -----------------------------------
    $.each([
        {formula: "valve_open_door", element: "#ev_open_doors"},
        {formula: "valve_close_door", element: "#ev_close_doors"},
        {formula: "valve_extend_gear", element: "#ev_extended_gears"},
        {formula: "valve_retract_gear", element: "#ev_retraction_gears"}
    ], function (i, v) {
        $(v.element).observe("formula", {
            formulas: [v.formula],
            refinement: "R4GearsDoorsHandleValves",
            trigger: function (origin, res) {
                origin.attr("class", "ev_" + res[0]);
            }
        });
    });

    $("#ev_general").observe("formula", {
        formulas: ["general_valve = valve_open"],
        refinement: "R6GearsDoorsHandleValvesControllerSwitch",
        trigger: function (origin, r) {
            origin.attr("class", "ev_" + r[0]);
        }
    });

    // -----------------------------------
    // Observe analogical switch
    // -----------------------------------
    $("#analogical_switch").observe("formula", {
        formulas: ["general_EV = TRUE & analogical_switch = switch_closed",
            "analogical_switch"],
        refinement: "R6GearsDoorsHandleValvesControllerSwitch",
        trigger: function (origin, r) {
            var ss = r[1];
            origin.attr("class", "switch_" + r[0]);
            origin.find("#switch").attr("y", ss === "switch_open" ? 200 : 216);
            origin.find("#switch_to_handle").attr("y2", ss === "switch_open" ? 212 : 220);
            var y = ss === "switch_open" ? 207 : 218;
            origin.find("#switchi1").attr("y2", y);
            origin.find("#switchi2").attr("y1", y).attr("y2", y);
        }
    });

    // -----------------------------------
    // Observe input signals
    // -----------------------------------
    $("#sensors").observe("formula", {
        formulas: [
            "ran(sensors_gear_extended(front)) = {TRUE}",
            "ran(sensors_gear_extended(right)) = {TRUE}",
            "ran(sensors_gear_extended(left)) = {TRUE}",
            "ran(sensors_gear_retracted(front)) = {TRUE}",
            "ran(sensors_gear_retracted(right)) = {TRUE}",
            "ran(sensors_gear_retracted(left)) = {TRUE}",
            "ran(sensors_door_open(front)) = {TRUE}",
            "ran(sensors_door_open(right)) = {TRUE}",
            "ran(sensors_door_open(left)) = {TRUE}",
            "ran(sensors_door_closed(front)) = {TRUE}",
            "ran(sensors_door_closed(right)) = {TRUE}",
            "ran(sensors_door_closed(left)) = {TRUE}",
            "ran(sensors_handle) = {up}",
            "ran(sensors_shock_absorber) = {ground}"
        ],
        refinement: "R8GearsDoorsHandleValvesControllerSwitchLightsSensors",
        trigger: function (origin, r) {
            var elems = [
                "#gear_extended_front",
                "#gear_extended_right",
                "#gear_extended_left",
                "#gear_retracted_front",
                "#gear_retracted_right",
                "#gear_retracted_left",
                "#door_open_front",
                "#door_open_right",
                "#door_open_left",
                "#door_closed_front",
                "#door_closed_right",
                "#door_closed_left",
                "#sensor_handle",
                "#sensor_shock_absorber"
            ];
            $.each(elems, function (i, v) {
                origin.find(v).css("stroke", r[i] === "TRUE" ? "green" : "red");
            });
        }
    });

    // -----------------------------------
    // Observe cockpit lights
    // -----------------------------------

    $("#green_light").observe("formula", {
        formulas: ["green_light"],
        refinement: "R7GearsDoorsHandleValvesControllerSwitchLights",
        trigger: function (origin, r) {
            origin.css("fill", r[0] === "on" ? "green" : "#cfffa0");
        }
    }).executeEvent({
        refinement: "R7GearsDoorsHandleValvesControllerSwitchLights",
        events: [{name: "env_turn_on_green_light"}, {name: "env_turn_off_green_light"}]
    });

    $("#orange_light").observe("formula", {
        formulas: ["orange_light"],
        refinement: "R7GearsDoorsHandleValvesControllerSwitchLights",
        trigger: function (origin, r) {
            origin.css("fill", r[0] === "on" ? "orange" : "#ffe7ad");
        }
    }).executeEvent({
        refinement: "R7GearsDoorsHandleValvesControllerSwitchLights",
        events: [{name: "env_turn_on_orange_light"}, {name: "env_turn_off_orange_light"}]
    });

    $("#red_light").observe("formula", {
        formulas: ["red_light"],
        refinement: "R7GearsDoorsHandleValvesControllerSwitchLights",
        trigger: function (origin, r) {
            origin.css("fill", r[0] === "on" ? "red" : "#ffc9c9");
        }
    }).executeEvent({
        refinement: "R7GearsDoorsHandleValvesControllerSwitchLights",
        events: [{name: "env_turn_on_red_light"}, {name: "env_turn_off_red_light"}]
    });

    // -----------------------------------
    // Observe handle
    // -----------------------------------
    $("#ev_handle").observe("formula", {
        formulas: ["handle"],
        trigger: function (origin, r) {
            if (r[0] !== undefined) {
                origin.attr("xlink:href", "img/handle_" + r[0] + ".png")
            }
        }
    }).executeEvent({
        events: [{name: "toggle_handle_down"}, {name: "toggle_handle_up"}]
    });

    // -----------------------------------
    // Observe circuits
    // -----------------------------------
    $.each([
        {formula: "general_valve", element: "#hydraulic_circuit"},
        {formula: "valve_open_door", element: "#extension_circuit_doors"},
        {formula: "valve_close_door", element: "#retraction_circuit_doors"},
        {formula: "valve_extend_gear", element: "#extension_circuit_gears"},
        {formula: "valve_retract_gear", element: "#retraction_circuit_gears"}
    ], function (i, v) {
        $(v.element).observe("formula", {
            formulas: [v.formula],
            refinement: "R6GearsDoorsHandleValvesControllerSwitch",
            trigger: function (origin, res) {
                origin.attr("class", "circuit_" + res[0]);
            }
        });
    });
    // -----------------------------------
    // Observe cylinders
    // -----------------------------------

    $.each(["front", "left", "right"], function (i, v) {

        /*$("#" + v + "_gear_cylinder_l").observe("formula", {
            formulas: ["(gears(" + v + ") = gear_moving & valve_extend_gear = valve_open) or (gears(" + v + ") = extended & valve_extend_gear = valve_open) or (gears(" + v + ") = retracted & valve_retract_gear = valve_open)"],
            trigger: function (origin, r) {
                origin.attr("fill", r[0] === "TRUE" ? "#88d2f7" : "#cccccc");
            }
        });

        $("#" + v + "_gear_cylinder_r").observe("formula", {
            formulas: ["(gears(" + v + ") = gear_moving & valve_retract_gear = valve_open) or (gears(" + v + ") = extended & valve_extend_gear = valve_open) or (gears(" + v + ") = retracted & valve_retract_gear = valve_open)"],
            trigger: function (origin, r) {
                origin.attr("fill", r[0] === "TRUE" ? "#88d2f7" : "#cccccc");
            }
        });

        $("#" + v + "_door_cylinder_l").observe("formula", {
            formulas: ["(doors(" + v + ") = door_moving & valve_open_door = valve_open) or (doors(" + v + ") = open & valve_open_door = valve_open) or (doors(" + v + ") = closed & valve_close_door = valve_open)"],
            trigger: function (origin, r) {
                origin.attr("fill", r[0] === "TRUE" ? "#88d2f7" : "#cccccc");
            }
        });

        $("#" + v + "_door_cylinder_r").observe("formula", {
            formulas: ["(doors(" + v + ") = door_moving & valve_close_door = valve_open) or (doors(" + v + ") = open & valve_open_door = valve_open) or (doors(" + v + ") = closed & valve_close_door = valve_open)"],
            trigger: function (origin, r) {
                origin.attr("fill", r[0] === "TRUE" ? "#88d2f7" : "#cccccc");
            }
        });*/

        $("#" + v + "_door_cylinder").observe("formula", {
            formulas: ["doors(" + v + ")"],
            trigger: function (origin, r) {
                var val = "translate(0,0)";
                switch (r[0]) {
                    case "closed":
                        val = "translate(0,0)";
                        break;
                    case "open":
                        val = "translate(90,0)";
                        break;
                    case "door_moving":
                        val = "translate(45,0)";
                        break;
                }
                origin.find("#" + v + "_door_cylinder_forcer").attr("transform", val);
            }
        });

        $("#" + v + "_gear_cylinder").observe("formula", {
            formulas: ["gears(" + v + ")"],
            trigger: function (origin, r) {
                var val = "translate(0,0)";
                switch (r[0]) {
                    case "extended":
                        val = "translate(90,0)";
                        break;
                    case "retracted":
                        val = "translate(0,0)";
                        break;
                    case "gear_moving":
                        val = "translate(45,0)";
                        break;
                }
                origin.find("#" + v + "_gear_cylinder_forcer").attr("transform", val);
            }
        });

        $("#" + v + "_door_cylinder").executeEvent({
            events: [
                {name: "env_start_open_door", predicate: "gr=" + v},
                {name: "env_open_door_skip", predicate: "gr=" + v},
                {name: "env_open_door_last", predicate: "gr=" + v},
                {name: "env_start_close_door", predicate: "gr=" + v},
                {name: "env_close_door", predicate: "gr=" + v},
                {name: "env_close_door_skip", predicate: "gr=" + v}
            ]
        });

        $("#" + v + "_gear_cylinder").executeEvent({
            events: [
                {name: "env_start_retracting_first", predicate: "gr=" + v},
                {name: "env_retract_gear_skip", predicate: "gr=" + v},
                {name: "env_retract_gear_last", predicate: "gr=" + v},
                {name: "env_start_extending", predicate: "gr=" + v},
                {name: "env_extend_gear_skip", predicate: "gr=" + v},
                {name: "env_extend_gear_last", predicate: "gr=" + v}
            ]
        });

        $("#" + v + "_door_img").observe("formula", {
            formulas: ["doors(" + v + ")"],
            trigger: function (origin, r) {
                origin.attr("xlink:href", "img/door_" + r[0] + ".png")
            }
        });

        $("#" + v + "_gear_img").observe("formula", {
            formulas: ["gears(" + v + ")"],
            trigger: function (origin, r) {
                origin.attr("xlink:href", "img/gear_" + r[0] + ".png")
            }
        });

    });

    // Execute Event Handlers
    $("#ev_general").executeEvent({
        refinement: "R6GearsDoorsHandleValvesControllerSwitch",
        events: [{name: "evn_open_general_valve"}, {name: "evn_close_general_valve"}]
    });

    $("#ev_open_doors").executeEvent({
        events: [{name: "open_valve_door_open"}, {name: "close_valve_door_open"}]
    });

    $("#ev_close_doors").executeEvent({
        events: [{name: "open_valve_door_close"}, {name: "close_valve_door_close"}]
    });

    $("#ev_retraction_gears").executeEvent({
        events: [{name: "open_valve_retract_gear"}, {name: "close_valve_retract_gear"}]
    });

    $("#ev_extended_gears").executeEvent({
        events: [{name: "open_valve_extend_gear"}, {name: "close_valve_extend_gear"}]
    });

    $("#signal_close_door").executeEvent({
        refinement: "R5GearsDoorsHandleValvesController",
        events: [{name: "con_stimulate_close_door_valve"}, {name: "con_stop_stimulate_close_door_valve"}]
    });

    $("#signal_open_door").executeEvent({
        refinement: "R5GearsDoorsHandleValvesController",
        events: [{name: "con_stimulate_open_door_valve"}, {name: "con_stop_stimulate_open_door_valve"}]
    });

    $("#signal_retract_gears").executeEvent({
        refinement: "R5GearsDoorsHandleValvesController",
        events: [{name: "con_stimulate_retract_gear_valve"}, {name: "con_stop_stimulate_retract_gear_valve"}]
    });

    $("#signal_extend_gears").executeEvent({
        refinement: "R5GearsDoorsHandleValvesController",
        events: [{name: "con_stimulate_extend_gear_valve"}, {name: "con_stop_stimulate_extend_gear_valve"}]
    });

    $("#con_stimulate_general_valve").executeEvent({
        refinement: "R5GearsDoorsHandleValvesController",
        events: [{name: "con_stimulate_general_valve"}]
    });

    $("#switch").executeEvent({
        refinement: "R6GearsDoorsHandleValvesControllerSwitch",
        events: [
            {name: "env_close_analogical_switch"},
            {name: "env_open_analogical_switch"}
        ]
    });

    $("g[data-refinement]").each(function () {
        $(this).observe("refinement", {
            refinements: [$(this).attr("data-refinement")],
            enable: {
                opacity: "1"
            },
            disable: {
                opacity: "0.1"
            }
        })
    });

});
