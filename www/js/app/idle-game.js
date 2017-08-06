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
requirejs(['jquery', 'vue', 'alertify', 'store', 'chance', 'app/facer'],
    function($, Vue, alertify, store, chance, facer) {


        var svgLineSet = { name: "svgLineSet", parts: [] };
        for (var i = 0; i < 20; i++) {
            svgLineSet.parts.push({
                id: i,
                output: true,
                resolve: function(sha1) {
                    return '<line id="svg_1" y2="540" x2="320" y1="100" x1="320" stroke-width="5" stroke="#000000" fill="none" transform="rotate(' + (360 * (256 / sha1[this.id])) + ' 320,320) "/>';

                }
            });
        }

        var colouredSvgLineSet = { name: "colouredSvgLineSet", parts: [] };
        for (var i = 0; i < 20; i++) {
            colouredSvgLineSet.parts.push({
                id: i,
                output: false,
                resolve: function(sha1) {
                    return sha1[this.id];
                }
            });
        }
        for (var i = 0; i < 20; i += 4) {
            colouredSvgLineSet.parts.push({
                id: i,
                output: true,
                resolve: function(sha1) {
                    var colour = "rgb(" + sha1[this.id + 1] + ", " + sha1[this.id + 2] + ", " + sha1[this.id + 3] + ")";
                    return '<line id="svg_1" y2="540" x2="320" y1="100" x1="320" stroke-width="5" stroke="' + colour + '" fill="none" transform="rotate(' + (360 * (256 / sha1[this.id])) + ' 320,320) "/>';

                }
            });
        }
        var eyeColourList = [
            '#7FFFD4',
            '#0000FF',
            '#00FFFF',
            '#FFD700',

            '#F8F8FF',
            '#8FBC8F',
            '#808080',
            '#8A2BE2',

            '#90EE90',
            '#87CEEB',
            '#6495ED',
            '#006400',

            '#B8860B',
            '#CD853F',
            '#DA70D6',
            '#F08080'
        ];

        var skinColourList = [
            '#FFDFC4',
            '#F0D5BE',
            '#E1B899',
            '#E5C298',
            '#FFDCB2',
            '#E5A073',
            '#DB9065',
            '#CE967C',
            '#C67856',
            '#BA6C49',
            '#A57257',
            '#B97C6D',
            '#A8756C',
            '#AD6452',
            '#5C3836',
            '#A3866A',
        ];
        var hairColourList = [
            '#090806',
            '#71635A',
            '#FFF5E1',
            '#E6CEA8',
            '#E5C8A8',
            '#DEBC99',
            '#B89778',
            '#A56B46',
            '#B55239',
            '#8D4A43',
            '#91553D',
            '#533D32',
            '#3B3024',
            '#554838',
            '#4E433F',
            '#6A4E42',
        ];

        var faceSet = {
            name: "faceSet",
            parts: [{
                id: 0,
                output: false,
                resolve: function(sha1) { return null; }
            }, {
                id: 1,
                output: false,
                resolve: function(sha1) { return null; }
            }, {
                id: 3,
                output: true,
                resolve: function(sha1) {
                    var skinColour = skinColourList[Math.floor(sha1[0] / 16)];
                    var leftEar = '<ellipse transform="rotate(-10 150,310)" ry="41" rx="26" id="svg_2" cy="310" cx="150" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + skinColour + '"/>';
                    var rightEar = '<ellipse transform="rotate(10 490,310)" ry="41" rx="26" id="svg_2" cy="310" cx="490" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + skinColour + '"/>';
                    return leftEar + rightEar;

                }
            }, {
                id: 4,
                output: true,
                resolve: function(sha1) {
                    var skinColour = skinColourList[Math.floor(sha1[0] / 16)];
                    var head = '<ellipse fill="' + skinColour + '" stroke-width="5" cx="320" cy="320" id="svg_1" rx="160" ry="160" stroke="#000000"/>';
                    return head;

                }
            }, {
                id: 5,
                output: true,
                resolve: function(sha1) {
                    var hairColour = hairColourList[Math.floor(sha1[0] % 16)];
                    var frontHair = '<path d="m164.00002,254.75002c0,0 314.25001,1.5 314.25001,1.5c0,0 -12,-42 -39.75,-70.5c-27,-28.734 -68,-39 -97,-41.75002c-28.34377,-1 -48,-4 -82.5,4.5c-34.03908,8.67576 -49.56248,26.19924 -66.24998,47.00002c-16.6875,20.80078 -28.5,59.25 -28.5,59.25z" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + hairColour + '"/>';
                    return frontHair;

                }
            }, {
                id: 8,
                output: true,
                resolve: function(sha1) {
                    var mouthPathsList = ["m244,400c1,0 4,9 13,15c9,6 35,15 59,15c24,0 40,-6 48,-14c8,-8 10,-17 10,-17"];
                    var path = mouthPathsList[Math.floor(sha1[this.id] % mouthPathsList.length)];
                    var mouth = '<path d="m244,400c1,0 4,9 13,15c9,6 35,15 59,15c24,0 40,-6 48,-14c8,-8 10,-17 10,-17" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="none"/>';
                    return mouth;

                }
            }, {
                id: 9,
                output: true,
                resolve: function(sha1) {
                    var nose = '<path d="m298.67191,336.21878c0,0 -0.84375,19.82813 -0.84375,19.82813c0,0 23.20313,0 23.20313,0c0,0 -1.6875,-20.25 -1.6875,-20.25" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="none"/>';
                    return nose;

                }
            }, {
                id: 10,
                output: true,
                resolve: function(sha1) {
                    var eyeColour = eyeColourList[Math.floor(sha1[1] % 16)];
                    var leftEye = '<ellipse ry="14.34375" rx="14.76563" id="svg_10" cy="307.53128" cx="247.20315" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + eyeColour + '"/>';
                    var rightEye = '<ellipse ry="14.34375" rx="14.76563" cy="308.79688" cx="368.28125" stroke-linecap="null" stroke-linejoin="null" stroke-dasharray="null" stroke-width="5" stroke="#000000" fill="' + eyeColour + '"/>';
                    return leftEye + rightEye;

                }
            }, ]


        };
        for (var i = 1; i < 20; i++) {
            svgLineSet.parts.push({
                id: 2,
                output: true,
                resolve: function(sha1) {
                    return '<line id="svg_1" y2="540" x2="320" y1="100" x1="320" stroke-width="5" stroke="#000000" fill="none" transform="rotate(' + (360 * (256 / sha1[this.id])) + ' 320,320) "/>';

                }
            });
        }



        var htmlImgSet = {
            name: "htmlImgSet",
            parts: [],
            attributes: ""
        };
        for (var i = 0; i < 20; i++) {
            htmlImgSet.parts.push({
                id: i,
                output: true,
                resolve: function(sha1) {
                    var imgPath = "./img/faceParts/" + this.id + "/" + sha1[this.id] + ".png";
                    return '<img src="' + imgPath + '" width="32px" style="position: absolute; left: 0px; top: 0px;"/>';

                }
            });
        }

        facer.loadCustomSet(faceSet);
        facer.loadCustomSet(colouredSvgLineSet);
        facer.loadCustomSet(svgLineSet);
        facer.loadCustomSet(htmlImgSet);
        facer.useSet("htmlImgSet");

        function uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        var idleGameData; // = store.get("idleGameData");

        var gameDifficulty = 10; // 100 is normal

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
                        if (!taskAssignment.progress || taskAssignment.progress >= 1) {
                            taskAssignment.progress = 0;
                        }

                        taskAssignment.progress += ticks * effortModifier / task.difficulty();
                        worker.secondsLeft = Math.max(0, (1 - taskAssignment.progress)) / ((effortModifier / task.difficulty()) * 1000);
                        if (taskAssignment.progress > 1) {
                            task.action(Math.floor(taskAssignment.progress));
                        }
                        worker.progress = taskAssignment.progress;
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
                        difficulty: function() { return 200 * gameDifficulty; },
                        active: true,
                        action: function(amount) {
                            idleGameData.getResource("rocks").amount += amount;
                        },
                    },
                    {
                        name: "stick collecting",
                        skills: ["collecting", "sticks"],
                        difficulty: function() { return 200 * gameDifficulty; },
                        active: false,
                        action: function(amount) {
                            idleGameData.getResource("sticks").amount += amount;
                        }
                    },
                    {
                        name: "dirt collecting",
                        skills: ["collecting", "dirt"],
                        difficulty: function() { return 200 * gameDifficulty; },
                        active: false,
                        action: function(amount) {
                            idleGameData.getResource("dirt").amount += amount;
                        }
                    },
                    {
                        name: "berry collecting",
                        skills: ["collecting", "berries"],
                        difficulty: function() { return 400 * gameDifficulty; },
                        active: false,
                        action: function(amount) {
                            idleGameData.getResource("berries").amount += amount;
                        }
                    },
                    {
                        name: "vine collecting",
                        skills: ["collecting", "vines"],
                        difficulty: function() { return 400 * gameDifficulty; },
                        active: false,
                        action: function(amount) {
                            idleGameData.getResource("vines").amount += amount;
                        }
                    },
                    {
                        name: "leaf collecting",
                        skills: ["collecting", "leaves"],
                        difficulty: function() { return 400 * gameDifficulty; },
                        active: false,
                        action: function(amount) {
                            idleGameData.getResource("leaves").amount += amount;
                        }
                    },
                    {
                        name: "water collecting",
                        skills: ["collecting", "water"],
                        difficulty: function() { return 600 * gameDifficulty; },
                        active: false,
                        action: function(amount) {
                            idleGameData.getResource("water").amount += amount;
                        }
                    },
                    {
                        name: "recruiting",
                        skills: ["recruiting", "talking"],
                        difficulty: function() { return 2000 * gameDifficulty * Math.pow(idleGameData.getStat("crowding").value(), 2); },
                        active: false,
                        action: function(amount) {
                            for (var i = 0; i < amount; i++) {
                                var newWorker = createNewWorker(1);
                                idleGameData.workers.push(newWorker);
                                alertify.success("New worker recruited: " + newWorker.name);
                            }
                            return;
                        }
                    },
                ],

                resources: [
                    { name: "workers", amount: 1, img: "robe.png" },
                    { name: "rocks", amount: 0, img: "rock.png" },
                    { name: "sticks", amount: 0, img: "stick-splitting.png" },
                    { name: "berries", amount: 30, img: "blackcurrant.png" },
                    { name: "leaves", amount: 0, img: "vine-leaf.png" },
                    { name: "dirt", amount: 0, img: "path-tile.png" },
                    { name: "vines", amount: 0, img: "curling-vines.png" },
                    { name: "tents", amount: 1, img: "camping-tent.png" },
                    { name: "houses", amount: 0, img: "house.png" },
                    { name: "water", amount: 50, img: "water-drop.png" },
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
                workers: [createNewWorker(100)],
                taskAssignments: []
            };
        }

        function createNewWorker(level) {
            var newWorker = {
                id: uuidv4(),
                name: new Chance().first() + " " + new Chance().last(),
                age: Math.floor(Math.random(60)) + 18,
                currentTask: "idling",
                skills: [
                    { name: "recruiting", level: 80 * level + Math.floor(Math.random() * 40 * level) },
                    { name: "fighting", level: 80 * level + Math.floor(Math.random() * 40 * level) },
                    { name: "collecting", level: 80 * level + Math.floor(Math.random() * 40 * level) },
                ],
                titles: []
            };
            facer.useSet("faceSet");
            newWorker.faceSvg =
                '<svg width="64" height="64" viewBox="0 0 640 640"  xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">' +
                facer.resolveInput(newWorker.name) +
                '</svg>';
            return newWorker;
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