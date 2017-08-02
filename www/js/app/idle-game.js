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

        
        var idleGameData;// = store.get("idleGameData");

        // TODO load if available
        if(idleGameData === undefined || idleGameData === null){
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

                    this.taskAssignments.forEach(function(taskAssignment){
                        var task = idleGameData.getActivity(taskAssignment.taskName);
                        var worker = idleGameData.getWorker(taskAssignment.workerName);
                        var effortModifier = 1;
                        task.skills.forEach(function(skill) {
                            worker.skills.forEach(function(workerSkill) {
                                if(skill.name == workerSkill.name){
                                    var modifier = Math.floor(Math.sqrt(workerSkill.level))/100 + 1;
                                    effortModifier *= modifier;
                                }
                            }, this);
                        }, this);
                        task.action(this.resources, ticks, effortModifier);
                    });
                },

                availableActivities: 1,

                getActivityAssignmentsByActivity: function(name){
                    var assignments = [];
                    idleGameData.taskAssignments.forEach(function(taskAssignment){
                        if(taskAssignment.name == name){
                            assignments.push(taskAssignment);
                        }
                    });
                    return assignments;
                },

                getActivity: function(name){
                    var taskFound;
                    idleGameData.activities.forEach(function(activity){
                        if(activity.name == name){
                            taskFound = activity;
                        }
                    });
                    return taskFound;
                },
                getWorker: function(name){
                    var workerFound;
                    idleGameData.workers.forEach(function(worker){
                        if(worker.name == name){
                            workerFound = worker;
                        }
                    });
                    return workerFound;
                },

                activities: [
                    {
                        name: "collect rocks",
                        skills: ["collecting", "rocks"],
                        amountPerTick: 0.0005,
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
                        name: "collect sticks",
                        skills: ["collecting", "sticks"],
                        amountPerTick: 0.0005,
                        active: false,
                        action: function(resources, ticks, modifier) {
                            idleGameData.resources.forEach(function(resource) {
                                if (resource.name == "sticks") {
                                    resource.amount += this.amountPerTick * ticks * modifier;
                                }
                            }, this);

                        }
                    }, 
                ],

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
                ],
                workers: [
                    { 
                        name: "Ralph",
                        currentTask: function(){
                            idleGameData.taskAssignments.forEach(function(taskAssignment){
                                if(taskAssignment.workerName == this.name){
                                    return taskAssignment.taskName;
                                }
                            });
                            return "idling";
                        },
                        skills: [
                            {name:"recruiting", level:8000 + Math.floor(Math.random()*4000)}, 
                            {name:"fighting", level:8000 + Math.floor(Math.random()*4000)},  
                            {name:"collecting", level:8000 + Math.floor(Math.random()*4000)}, 
                            ],
                        titles: ["Leader"]
                    }
                ],
                taskAssignments: [
                ]

            };
        }

        var idleGame = new Vue({
            el: '#idle-game',
            data: idleGameData,
            computed: {
                ticksSinceLastTick: function() {
                    return new Date() - this.timeOfLastTick;
                }
            },
            methods: {
                reset: function(event){
                    store.set("idleGameData", null);
                },
                assignWorkers: function(event){
                    idleGameData.taskAssignments = [];
                    var task = event.currentTarget.dataset.task;
                    idleGameData.workers.forEach(function(worker) {
                        idleGameData.taskAssignments.push({taskName:task, workerName:worker.name});
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