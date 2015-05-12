({
    //name: "bmotion.online",
    //out: "../../dist/bmotion.online.js",
    //optimize: "closure",
    mainConfigFile: "app/bmotion.config.js",
    baseUrl: "app",
    removeCombined: true,
    findNestedDependencies: true,
    dir: "dist",
    skipDirOptimize: true,
    optimizeCss: "standard",
    modules: [
        {
            name: "bmotion.online"
        },
        {
            name: "bmotion.integrated"
        },
        {
            name: "bmotion.standalone"
        },
        {
            name: "bmotion.vis"
        }
    ]
});
