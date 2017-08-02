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
requirejs(['jquery', 'vue', 'alertify', 'store', 'chance'],
    function($, Vue, alertify, store, chance) {

        var idleGameData; // = store.get("idleGameData");

        var difficulty = 100; // 100 is normal

        // TODO load if available
        if (idleGameData === undefined || idleGameData === null) {
            alertify.success("New Game Started!");
            idleGameData = {
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

                    this.taskAssignments.forEach(function(taskAssignment) {
                        var task = idleGameData.getActivity(taskAssignment.taskName);
                        var worker = idleGameData.getWorker(taskAssignment.workerName);
                        var effortModifier = 1;
                        task.skills.forEach(function(skill) {
                            var skillFound = false;
                            worker.skills.forEach(function(workerSkill) {
                                if (skill == workerSkill.name) {
                                    var modifier = Math.floor(Math.sqrt(workerSkill.level)) / 100 + 1;
                                    effortModifier *= modifier;
                                    workerSkill.level += 0.01;
                                    skillFound = true;
                                }
                            }, this);
                            if (!skillFound) {
                                worker.skills.push({ name: skill, level: 1 });
                            }
                        }, this);
                        task.action(this.resources, ticks, effortModifier);
                    });
                },

                getActivityAssignmentsByActivity: function(name) {
                    var assignments = [];
                    idleGameData.taskAssignments.forEach(function(taskAssignment) {
                        if (taskAssignment.name == name) {
                            assignments.push(taskAssignment);
                        }
                    });
                    return assignments;
                },

                getActivity: function(name) {
                    var taskFound;
                    idleGameData.activities.forEach(function(activity) {
                        if (activity.name == name) {
                            taskFound = activity;
                        }
                    });
                    return taskFound;
                },
                getWorker: function(name) {
                    var workerFound;
                    idleGameData.workers.forEach(function(worker) {
                        if (worker.name == name) {
                            workerFound = worker;
                        }
                    });
                    return workerFound;
                },
                getResource: function(name) {
                    var resourceFound;
                    idleGameData.resources.forEach(function(resource) {
                        if (resource.name == name) {
                            resourceFound = resource;
                        }
                    });
                    return resourceFound;
                },
                getStat: function(name) {
                    var statFound;
                    idleGameData.stats.forEach(function(stat) {
                        if (stat.name == name) {
                            statFound = stat;
                        }
                    });
                    return statFound;
                },

                activities: [{
                        name: "rock collecting",
                        skills: ["collecting", "rocks"],
                        amountPerTick: 0.005 / difficulty,
                        active: true,
                        action: function(resources, ticks, modifier) {
                            idleGameData.resources.forEach(function(resource) {
                                if (resource.name == "rocks") {
                                    resource.amount += this.amountPerTick * ticks * modifier;
                                }
                            }, this);

                        }
                    },
                    {
                        name: "stick collecting",
                        skills: ["collecting", "sticks"],
                        amountPerTick: 0.005 / difficulty,
                        active: false,
                        action: function(resources, ticks, modifier) {
                            idleGameData.resources.forEach(function(resource) {
                                if (resource.name == "sticks") {
                                    resource.amount += this.amountPerTick * ticks * modifier;
                                }
                            }, this);

                        }
                    },
                    {
                        name: "recruiting",
                        skills: ["recruiting", "talking"],
                        amountPerTick: 0.0005 / difficulty,
                        active: false,
                        action: function(resources, ticks, modifier) {
                            idleGameData.resources.forEach(function(resource) {
                                if (resource.name == "workers") {
                                    var startAmount = Math.floor(resource.amount);
                                    var crowding = idleGameData.getStat("crowding").value();
                                    var adjustment = (this.amountPerTick * ticks * modifier) / (crowding * crowding);

                                    resource.secondsPer = ticks / (1000 * adjustment);
                                    resource.amount += adjustment;
                                    if (startAmount != Math.floor(resource.amount)) { // Then a new worker has been recruited
                                        var newWorker = createNewWorker();
                                        idleGameData.workers.push(newWorker);
                                        alertify.success("New worker recruited: " + newWorker.name);
                                    }
                                }
                            }, this);

                        }
                    },
                ],

                resources: [
                    { name: "workers", amount: 1, img: "robe.png" },
                    { name: "rocks", amount: 0, img: "rock.png" },
                    { name: "sticks", amount: 0, img: "stick-splitting.png" },
                    { name: "berries", amount: 0, img: "blackcurrant.png" },
                    { name: "leaves", amount: 0, img: "vine-leaf.png" },
                    { name: "dirt", amount: 0, img: "path-tile.png" },
                    { name: "vines", amount: 0, img: "curling-vines.png" },
                    { name: "tents", amount: 1, img: "camping-tent.png" },
                    { name: "houses", amount: 0, img: "house.png" },
                ],
                stats: [{
                    name: "crowding",
                    value: function() {
                        var tents = idleGameData.getResource("tents").amount;
                        var houses = idleGameData.getResource("houses").amount;
                        var housing = tents + 5 * houses;
                        return idleGameData.workers.length / housing;
                    },
                    modifier: function() {
                        return this.value * this.value;
                    }
                }],
                upgrades: [{
                    name: "nothing",
                    cost: 0,
                }],
                workers: [{
                    name: new Chance().first() + " " + new Chance().last(),
                    currentTask: "idling",
                    // currentTask: function() {
                    //     idleGameData.taskAssignments.forEach(function(taskAssignment) {
                    //         if (taskAssignment.workerName == this.name) {
                    //             return taskAssignment.taskName;
                    //         }
                    //     });
                    //     return "idling";
                    // },
                    skills: [
                        { name: "recruiting", level: 8000 + Math.floor(Math.random() * 4000) },
                        { name: "fighting", level: 8000 + Math.floor(Math.random() * 4000) },
                        { name: "collecting", level: 8000 + Math.floor(Math.random() * 4000) },
                    ],
                    titles: ["Leader"]
                }],
                taskAssignments: []
            };
        }

        createNewWorker =
            function() {
                return {
                    name: new Chance().first() + " " + new Chance().last(),
                    age: Math.floor(Math.random(60)) + 18,
                    currentTask: "idling",
                    skills: [
                        { name: "recruiting", level: 80 + Math.floor(Math.random() * 40) },
                        { name: "fighting", level: 80 + Math.floor(Math.random() * 40) },
                        { name: "collecting", level: 80 + Math.floor(Math.random() * 40) },
                    ],
                    titles: ["Follower"]
                }
            };

        var idleGame = new Vue({
            el: '#idle-game',
            data: idleGameData,
            computed: {
                ticksSinceLastTick: function() {
                    return new Date() - this.timeOfLastTick;
                }
            },
            methods: {
                reset: function(event) {
                    store.set("idleGameData", null);
                },
                assignWorkers: function(event) {
                    idleGameData.taskAssignments = [];
                    var taskName = event.currentTarget.dataset.task;
                    idleGameData.workers.forEach(function(worker) {
                        idleGameData.taskAssignments.push({ taskName: taskName, workerName: worker.name });
                        worker.currentTask = taskName;
                    }, this);
                },
                assignWorker: function(event) {
                    var taskName = event.currentTarget.dataset.task;
                    var workerName = event.currentTarget.dataset.worker;
                    var assigned = false;
                    idleGameData.taskAssignments.forEach(function(taskAssignment) {
                        if (taskAssignment.workerName == workerName) {
                            taskAssignment.taskName = taskName;
                            assigned = true;
                        }
                    }, this);
                    if (!assigned) {
                        idleGameData.taskAssignments.push({ taskName: taskName, workerName: workerName });
                    }
                    idleGameData.workers.forEach(function(worker) {
                        if (worker.name == workerName) {
                            worker.currentTask = taskName;
                        }
                    }, this);
                }
            }
        });

        function tick() {
            idleGameData.tick();
            //store.set("idleGameData", idleGameData);
            // your code here
            setTimeout(tick, 100);
        }

        // boot up the first call
        tick();


    });