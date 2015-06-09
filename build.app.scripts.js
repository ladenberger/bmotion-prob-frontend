({
    //name: "bmotion.online",
    //out: "../../dist/bmotion.online.js",
    //optimize: "closure",
    mainConfigFile: "app/bmotion.config.js",
    baseUrl: "app/js",
    removeCombined: true,
    findNestedDependencies: true,
    dir: "dist/js",
    skipDirOptimize: true,
    keepBuildDir: false,
    noBuildTxt: true,
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
