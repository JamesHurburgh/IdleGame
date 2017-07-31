requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        models: '../app/models'
    }
});

// Start the main app logic.
requirejs(['jquery', 'vue', 'alertify', 'store'],
    function($, Vue, alertify, store) {

        alertify.success("Game Loaded!");

        // TODO load if available
        var idleGameData = {
            ticks: 0,
            firstTick: new Date(),
            timeOfLastTick: new Date(),
            tick: function() {
                var now = new Date();
                var ticksElapsed = now - this.timeOfLastTick;
                this.doTicks(ticksElapsed);
                this.timeOfLastTick = now;
            },
            doTicks: function(ticks) {
                this.ticks += ticks;

                this.activities.forEach(function(activity) {
                    if (activity.active) {
                        activity.action(this.resources, ticks);
                    }
                }, this);

            },

            availableActivities: 1,

            activities: [{
                name: "collect rocks",
                amountPerTick: 0.0005,
                active: true,
                action: function(resources, ticks) {
                    resources.forEach(function(resource) {
                        if (resource.name == "rocks") {
                            resource.amount += this.amountPerTick * ticks;
                        }
                    }, this);

                }
            }, {
                name: "collect sticks",
                amountPerTick: 0.0005,
                active: false,
                action: function(resources, ticks) {
                    resources.forEach(function(resource) {
                        if (resource.name == "sticks") {
                            resource.amount += this.amountPerTick * ticks;
                        }
                    }, this);

                }
            }, ],

            resources: [
                { name: "rocks", amount: 0 },
                { name: "sticks", amount: 0 },
                { name: "berries", amount: 0 },
                { name: "leaves", amount: 0 },
                { name: "dirt", amount: 0 },
                { name: "vines", amount: 0 },
            ],
            upgrades: [
                { name: "nothing", cost: 0 },
            ]

        };

        var idleGame = new Vue({
            el: '#idle-game',
            data: idleGameData,
            computed: {
                ticksSinceLastTick: function() {
                    return new Date() - this.timeOfLastTick;
                }
            }
        });

        function tick() {
            idleGameData.tick();
            // your code here
            setTimeout(tick, 100);
        }

        // boot up the first call
        tick();


    });