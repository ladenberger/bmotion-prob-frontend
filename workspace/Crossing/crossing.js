requirejs(['../../app/scripts/bmotion.vis.dev'], function () {

    $("#crossing").observe("csp-event", {
        observers: [
            {
                exp: "{gate.down,gate.up}",
                actions: [
                    {selector: "g[id^=gate]", attr: "opacity", value: "0"}
                ]
            },
            {
                exp: "{gate.down}",
                actions: [
                    {selector: "#gate-go_down-2, #gate-go_down-1", attr: "opacity", value: "100"}
                ]
            },
            {
                exp: "{gate.up}",
                actions: [
                    {selector: "#gate-go_up-2, #gate-go_up-1", attr: "opacity", value: "100"}
                ]
            },
            {
                exp: "{enter.x.y | x <- {0..4}, y <- {Train1,Train2}}",
                actions: [
                    {selector: "#train_{{a2}}", attr: "x", value: "{{a1}}00"},
                    {selector: "#train_{{a2}}", attr: "transform", value: ""}
                ]
            },
            {
                exp: "{leave.x.y | x <- {0..3}, y <- {Train1,Train2}}",
                actions: [
                    {selector: "#train_{{a2}}", attr: "transform", value: "translate(50,0)"}
                ]
            }
        ]
    });

});