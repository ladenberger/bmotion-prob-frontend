requirejs.config({
    paths: {
        geometry: '/workspace/BullyAlgoColorDyn/app/scripts/vendor/joint/src/geometry',
        vectorizer: '/workspace/BullyAlgoColorDyn/app/scripts/vendor/joint/src/vectorizer',
        lodash: '/workspace/BullyAlgoColorDyn/app/scripts/vendor/joint/lib/lodash',
        backbone: '/workspace/BullyAlgoColorDyn/app/scripts/vendor/joint/lib/backbone',
        joint: '/workspace/BullyAlgoColorDyn/app/scripts/vendor/joint/dist/joint.clean',
        underscore: '/workspace/BullyAlgoColorDyn/app/scripts/vendor/underscore/underscore-min'
    },
    shim: {
        backbone: {
            //These script dependencies should be loaded before loading backbone.js.
            deps: ['lodash', 'jquery'],
            //Once loaded, use the global 'Backbone' as the module value.
            exports: 'Backbone'
        },
        joint: {
            deps: ['geometry', 'vectorizer', 'jquery', 'lodash', 'backbone'],
            exports: 'joint',
            init: function(geometry, vectorizer) {
                // JointJS must export geometry and vectorizer otheriwse
                // they won't be exported due to the AMD nature of those libs and
                // so JointJS would be missing them.
                this.g = geometry;
                this.V = vectorizer;
            }
        },
        backbone: ['underscore'],
        lodash: {
            exports: '_'
        }
    }
});
define(['joint'], function () {
});