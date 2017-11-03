/*jshint esversion: 6 */

define(["chance",
        "app/CommonFunctions",
        "app/GameState",
        "json!data/contracts.json"
    ],
    function QuestManager(
        chance,
        CommonFunctions,
        GameState,
        contracts) {

        commonFunctions = new CommonFunctions();
        chance = new Chance();
        var gameState = require("app/GameState");

        var AdventurerManager = require("app/AdventurerManager");
        var adventurerManager = new AdventurerManager();
        var EffectsManager = require("app/EffectsManager");
        var effectsManager = new EffectsManager();
        var ItemManager = require("app/ItemManager");
        var itemManager = new ItemManager();
        var LocationManager = require("app/LocationManager");
        var locationManager = new LocationManager();
        var PlayerManager = require("app/PlayerManager");
        var playerManager = new PlayerManager();
        var StatisticsManager = require("app/StatisticsManager");
        var statisticsManager = new StatisticsManager();
        var TimeManager = require("app/TimeManager");
        var timeManager = new TimeManager();

        return function QuestManager() {

            this.gameState = gameState.getGameState();

            this.getCompletedQuests = function() {
                if (!this.gameState.completedQuests) this.gameState.completedQuests = [];
                return this.gameState.completedQuests;
            };

            this.getRunningQuests = function() {
                if (!this.gameState.runningQuests) this.gameState.runningQuests = [];
                return this.gameState.runningQuests;
            };

            this.showQuestsTab = function() {
                return this.getCompletedQuests().length + this.getRunningQuests().length !== 0;
            };

            this.getSelectedContract = function() {
                return this.gameState.selectedContract;
            };

            this.selectNextContract = function() {
                var availableContracts = locationManager.getCurrentLocation().availableContracts;
                var selectedContract = this.getSelectedContract();
                var index = 0;
                if (selectedContract) {
                    index = (availableContracts.indexOf(selectedContract) + 1) % availableContracts.length;
                }
                this.gameState.selectedContract = availableContracts[index];
            };

            this.canSendSelectedQuest = function() {
                return this.canSendQuest(this.getSelectedContract());
            };

            this.isSkillRelevantToContract = function(skill, contract) {
                if (!skill || !contract || !contract.requirements || !contract.requirements.attributes) return false;
                var skillRequiredForContract = contract.requirements.attributes.filter(sk => sk.type == skill.name)[0];
                return skillRequiredForContract !== undefined && skillRequiredForContract.amount > 0;
            };

            this.rejectSelectedContract = function() {
                this.rejectContract(this.getSelectedContract());
                this.gameState.selectedContract = null;
                this.selectNextContract();
            };

            this.rejectContract = function(contract) {
                var availableContracts = locationManager.getCurrentLocation().availableContracts;
                availableContracts.splice(availableContracts.indexOf(contract), 1);
                statisticsManager.trackStat("reject", "contract", 1);
                statisticsManager.trackStat("reject", contract.name, 1);
            };

            this.canSendQuest = function(contract) {
                if (!contract) return;
                var partySize = adventurerManager.getCurrentParty().length;
                return contract.requirements.minAssigned <= partySize && partySize <= contract.requirements.maxAssigned;
            };

            this.getSuggestedSkills = function(contract) {
                if (!contract) return;
                var skills = [];
                if (!contract.tasks || contract.tasks.length === 0) {
                    return contract.requirements.attributes;
                }
                for (var i = 0; i < contract.tasks.length; i++) {
                    var task = contract.tasks[i];
                    if (task.skillTest) {
                        if (skills.filter(skill => skill.type == task.skillTest).length === 0) {
                            skills.push({
                                "type": task.skillTest,
                                "amount": Math.ceil(task.difficulty)
                            });
                        } else {
                            var skill = skills.filter(skill => skill.type == task.skillTest)[0];
                            skill.amount = Math.max(Math.ceil(task.difficulty), skill.amount);
                        }
                    }
                }
                return skills;
            };

            this.getCurrentQuestRequiredAndAssignedSkillCount = function(skillName) {
                return this.getRequiredAndAssignedSkillCount(this.getSelectedContract(), skillName);
            };

            this.getRequiredAndAssignedSkillCount = function(contract, skillName) {
                if (!contract || !skillName) return;
                var currentlyAssigned = adventurerManager.getCurrentPartyAttribute(skillName);
                if (currentlyAssigned === 0) return 0;
                var requiredSkill = contract.requirements.attributes.filter(skill => skill.type == skillName)[0];
                if (!requiredSkill) {
                    return 0;
                }
                return Math.min(currentlyAssigned, requiredSkill.amount);
            };

            this.getCurrentQuestRequiredAndUnassignedSkillCount = function(skillName) {
                return this.getRequiredAndUnassignedSkillCount(this.getSelectedContract(), skillName);
            };

            this.getRequiredAndUnassignedSkillCount = function(contract, skillName) {
                var currentlyAssigned = adventurerManager.getCurrentPartyAttribute(skillName);
                var requiredSkill = contract.requirements.attributes.filter(skill => skill.type == skillName)[0];
                if (!requiredSkill) return 0;
                return Math.max(requiredSkill.amount - currentlyAssigned, 0);
            };

            this.sendSelectedQuest = function() {
                this.sendQuest(this.getSelectedContract());
                this.selectNextContract();
            };

            this.sendQuest = function(contract) {
                if (!this.canSendQuest(contract)) {
                    return;
                }

                statisticsManager.trackStat("send", "quest", 1);
                statisticsManager.trackStat("send-quest", contract.name, 1);

                var quest = {
                    id: commonFunctions.uuidv4(),
                    contract: contract,
                    start: Date.now(),
                    expires: Date.now() + (contract.duration * 1000),
                    party: adventurerManager.getCurrentParty(),
                    tasks: []
                };

                if (contract.tasks && contract.startTaskId) {
                    this.startTask(quest, contract.startTaskId);
                    quest.expires = null; // This will eventually be removed.
                }

                adventurerManager.sendCurrentParty();

                this.getRunningQuests().push(quest);

                this.getRunningQuests().sort(function(a, b) {
                    return a.expires - b.expires;
                });

                var availableContracts = locationManager.getCurrentLocation().availableContracts;
                availableContracts.splice(availableContracts.indexOf(contract), 1);
                this.gameState.selectedContract = null;
            };

            // Expediations

            this.claimAllCompletedQuests = function() {
                // while (this.completedExpeditions.length > 0) {
                //     if (this.completedExpeditions[0].success) {
                //         this.claimReward(this.completedExpeditions[0]);
                //     } else {
                //         this.removeQuest(this.completedExpeditions[0]);
                //     }
                // }
            };

            this.removeQuest = function(expedition) {
                this.getCompletedQuests().splice(this.getCompletedQuests().indexOf(expedition), 1);
            };

            this.questProgress = function(expedition) {
                return 100 * ((Date.now() - expedition.start) / (expedition.expires - expedition.start));
            };

            this.isTaskNewDay = function(quest, task) {
                var index = quest.tasks.indexOf(task);
                return index === 0 || !timeManager.isSameDay(quest.tasks[index].startTime, quest.tasks[index - 1].startTime);
            };

            this.checkForCompletedQuests = function() {

                var expired = this.getRunningQuests().filter(quest => quest.expires !== null && quest.expires <= Date.now());

                for (var i = 0; i < expired.length; i++) {
                    this.completeQuest(expired[i]);
                }

                // Check for completed tasks
                var questsWithCompletedTasks = this.getRunningQuests().filter(quest =>
                    quest.tasks.filter(task => task.status == "in-progress" && task.finishes <= Date.now()).length > 0);

                questsWithCompletedTasks.forEach(function(quest) {
                    this.completeTasks(quest);
                }, this);
            };

            this.completeTasks = function(quest) {
                var completedTasks = quest.tasks.filter(task => task.status == "in-progress" && task.finishes <= Date.now());
                completedTasks.forEach(function(task) {
                    this.completeTask(quest, task);
                }, this);
            };

            this.completeTask = function(quest, task) {
                task.status = "complete";

                if (!task.partySkill) {
                    var partySkills = adventurerManager.getPartyAttributes(quest.party);

                    var partySkill = partySkills.filter(s => s.name == task.skillTest)[0];
                    var partySkillAmount = 0;
                    if (partySkill) partySkillAmount = partySkill.amount;
                    task.partySkill = partySkillAmount;
                }
                var partyRoll = (Math.random() * task.partySkill);
                var taskRoll = (Math.random() * task.difficulty);
                // Check for injuries
                var isInjured = task.injuryType !== undefined && (partyRoll < taskRoll);

                if (isInjured) {
                    var adventurer = chance.pickone(quest.party);
                    var injury = adventurerManager.injureAdventurerOnQuest(adventurer, task.injuryType, task.finishes);
                    task.injury = { adventurer: adventurer, injury: injury };
                    if (adventurer.status == "Dead") {
                        if (!quest.casualties) quest.casualties = [];
                        quest.casualties.push(adventurer);

                        if (!task.casualties) task.casualties = [];
                        task.casualties.push(adventurer);

                        quest.party.splice(quest.party.indexOf(adventurer), 1);
                        if (quest.party.length === 0) {
                            this.finishQuest(quest, task.finishes);
                            return;
                        }
                    }
                }

                // Check success status
                task.success = !task.skillTest || Math.random() * task.partySkill >= Math.random() * task.difficulty;

                // If success
                if (task.success) {
                    if (task.taskAfterSuccess) {
                        this.startTask(quest, task.taskAfterSuccess, task.finishes);
                        return;
                    }
                    this.finishQuest(quest, task.finishes);
                    return;
                }

                // If there are no more retries
                if (!task.retry || task.attempt > task.retry) {
                    if (task.taskAfterFail) {
                        this.startTask(quest, task.taskAfterFail, task.finishes);
                        return;
                    }
                    this.finishQuest(quest, task.finishes);
                    return;
                }

                // Retry
                this.startTask(quest, task.id, task.finishes, task.attempt + 1);
                task.required = false; // Remove requirement since a retry is possible

            };

            this.finishQuest = function(quest, finishes) {
                if (!finishes) finishes = Date.now();
                log("finishQuest");
                var contract = quest.contract;
                quest.finishTime = finishes;

                var duration = quest.finishTime - quest.start;

                // Remove the quest from the running tab
                this.getRunningQuests().splice(this.getRunningQuests().indexOf(quest), 1);

                // Track the stats
                statisticsManager.trackStat("finish", "quest", 1);
                statisticsManager.trackStat("finish-quest", contract.name, 1);

                quest.success = quest.party.length > 0 && quest.tasks.filter(task => task.required && !task.success).length === 0;
                quest.survivors = [];
                quest.party.forEach(function(survivor) {
                    quest.survivors.push({ adventurer: survivor });
                    if (!survivor.questLog) survivor.questLog = [];
                    survivor.questLog.push(quest.id);
                    adventurerManager.returnFromQuest(survivor.adventurer, finishes);
                }, this);
                if (quest.success) {
                    quest.completionMessage = contract.successMessage;
                    statisticsManager.trackStat("succeed", "quest", 1);
                    statisticsManager.trackStat("succeed-quest", contract.name, 1);

                    // Divy out xp to party
                    if (quest.contract.experience > 0) {
                        var xpEach = Math.floor(quest.contract.experience / quest.survivors.length);
                        var extraXp = quest.contract.experience % quest.survivors.length;
                        for (var survivorIndex = 0; survivorIndex < quest.survivors.length; survivorIndex++) {
                            var survivor = quest.survivors[survivorIndex];
                            var xpGained = xpEach;
                            if (extraXp > 0) {
                                extraXp--;
                                xpGained++;
                            }
                            survivor.xpGained = xpGained;
                            adventurerManager.giveAdventurerXP(survivor.adventurer, xpGained);
                        }
                    }

                    quest.rewards = [];
                    // For each potential reward
                    for (var j = 0; j < contract.rewards.length; j++) {
                        var chance = contract.rewards[j].chance;
                        if (Math.random() < chance) {
                            var reward = contract.rewards[j].reward;
                            if (reward.type == "item") {
                                quest.rewards.push({ "type": reward.type, "item": itemManager.generateRewardItem(reward) });
                            } else {
                                var rewardAmount = commonFunctions.varyAmount(reward.amount);
                                if (rewardAmount > 0) {
                                    quest.rewards.push({ "type": reward.type, "amount": rewardAmount });
                                }
                            }
                        }
                    }

                    // Count the rewards
                    var coins = 0;
                    if (contract.contractAmount) {
                        coins += contract.contractAmount;
                    }
                    for (var i = 0; i < quest.rewards.length; i++) {
                        if (quest.rewards[i].type == "coins") {
                            coins += quest.rewards[i].amount;
                        } else {
                            playerManager.giveReward(quest.rewards[i]);
                        }
                    }

                    quest.wagesPaid = 0;
                    quest.cutsTaken = 0;

                    for (var survivorIndexCoins = 0; survivorIndexCoins < quest.survivors.length; survivorIndexCoins++) {
                        var survivorCoin = quest.survivors[survivorIndexCoins];
                        var cut = Math.ceil((survivorCoin.adventurer.cut / 100) * coins);
                        var wage = Math.ceil((survivorCoin.adventurer.wage) * (duration / 60000));

                        quest.cutsTaken += cut;
                        quest.wagesPaid += wage;
                        survivorCoin.coinsGained = cut + wage;
                        adventurerManager.giveAdventurerCoins(survivorCoin.adventurer, survivorCoin.coinsGained);
                    }

                    quest.remainingCoins = coins - quest.wagesPaid - quest.cutsTaken;
                    playerManager.giveCoins(quest.remainingCoins);

                } else {
                    quest.completionMessage = contract.failureMessage;
                    statisticsManager.trackStat("fail", "quest", 1);
                    statisticsManager.trackStat("fail-quest", contract.name, 1);
                }

                this.getCompletedQuests().push(quest);
            };

            this.completeQuest = function(quest, finishes) {
                if (!finishes) finishes = Date.now();
                log("completeQuest");
                var contract = quest.contract;
                quest.finishTime = finishes;

                // Remove the quest from the running tab
                this.getRunningQuests().splice(this.getRunningQuests().indexOf(quest), 1);

                // Track the stats
                statisticsManager.trackStat("complete", "quest", 1);
                statisticsManager.trackStat("complete-quest", contract.name, 1);

                // Determine if any of the party died
                quest.survivors = [];
                quest.casualaties = [];
                if (quest.party) {
                    quest.party.forEach(function(adventurer) {
                        // Did they die?
                        if (Math.random() * effectsManager.getGlobalValue("questRisk") < contract.risk) {
                            var causeOfInjury = "Injured while on contract: " + contract.name;
                            var injuryTime = quest.expires;
                            var injury = adventurerManager.injureAdventurer(adventurer, causeOfInjury, injuryTime);
                            if (adventurer.status == "Dead") {
                                quest.casualaties.push(adventurer);
                            } else {
                                quest.survivors.push({ adventurer: adventurer, injuriesGained: injury });
                            }
                        } else {
                            adventurerManager.setAdventurerRecovering(adventurer);
                            quest.survivors.push({ adventurer: adventurer });
                        }
                    }, this);
                }


                // Calculate success
                if (quest.success === undefined || quest.success === null) {
                    quest.success = quest.survivors.length > 0 && Math.random() < contract.successChance;
                }

                if (quest.success) {
                    quest.completionMessage = contract.successMessage;
                    statisticsManager.trackStat("succeed", "quest", 1);
                    statisticsManager.trackStat("succeed-quest", contract.name, 1);

                    // Divy out xp to survivors
                    if (quest.contract.experience > 0) {
                        var xpEach = Math.floor(quest.contract.experience / quest.survivors.length);
                        var extraXp = quest.contract.experience % quest.survivors.length;
                        for (var survivorIndex = 0; survivorIndex < quest.survivors.length; survivorIndex++) {
                            var survivor = quest.survivors[survivorIndex];
                            var xpGained = xpEach;
                            if (extraXp > 0) {
                                extraXp--;
                                xpGained++;
                            }
                            survivor.xpGained = xpGained;
                            adventurerManager.giveAdventurerXP(survivor.adventurer, xpGained);
                        }
                    }

                    quest.rewards = [];
                    // For each potential reward
                    for (var j = 0; j < contract.rewards.length; j++) {
                        var chance = contract.rewards[j].chance;
                        if (Math.random() < chance) {
                            var reward = contract.rewards[j].reward;
                            if (reward.type == "item") {
                                quest.rewards.push({ "type": reward.type, "item": itemManager.generateRewardItem(reward) });
                            } else {
                                var rewardAmount = commonFunctions.varyAmount(reward.amount);
                                if (rewardAmount > 0) {
                                    quest.rewards.push({ "type": reward.type, "amount": rewardAmount });
                                }
                            }
                        }
                    }

                    // Count the rewards
                    var coins = 0;
                    if (contract.contractAmount) {
                        coins += contract.contractAmount;
                    }
                    for (var i = 0; i < quest.rewards.length; i++) {
                        if (quest.rewards[i].type == "coins") {
                            coins += quest.rewards[i].amount;
                        } else {
                            playerManager.giveReward(quest.rewards[i]);
                        }
                    }

                    var remainingCoins = coins;
                    // Divy up any coins
                    if (coins > 0) {
                        // var coinsPercentTaken = quest.survivors.reduce(function(accumulator, survivor) {
                        //     return accumulator + survivor.adventurer.wage;
                        // });

                        for (var survivorIndexCoins = 0; survivorIndexCoins < quest.survivors.length; survivorIndexCoins++) {
                            var survivorCoin = quest.survivors[survivorIndexCoins];
                            var coinsGained = Math.ceil((survivorCoin.adventurer.wage / 100) * coins);
                            remainingCoins -= coinsGained;
                            survivorCoin.coinsGained = coinsGained;
                            adventurerManager.giveAdventurerCoins(survivorCoin.adventurer, coinsGained);
                        }

                    }

                    quest.remainingCoins = remainingCoins;
                    quest.wagesPaid = coins - remainingCoins;
                    playerManager.giveCoins(remainingCoins);

                } else {
                    quest.completionMessage = contract.failureMessage;
                    statisticsManager.trackStat("fail", "quest", 1);
                    statisticsManager.trackStat("fail-quest", contract.name, 1);
                }

                this.getCompletedQuests().push(quest);
            };

            this.startTask = function(quest, taskId, startTime, attempt) {
                if (!startTime) startTime = Date.now();
                if (!attempt) attempt = 1;

                var task = common.clone(quest.contract.tasks.filter(task => task.id == taskId)[0]);
                if (!task) {
                    log("Cannot find task with id '" + taskId + "' in quest '" + quest.contract.name + "'.");
                    this.completeQuest(quest);
                    return;
                }

                task.partyEfficiency = adventurerManager.getPartyEfficiency(quest.party);
                task.startTime = startTime;

                task.finishes = startTime + (task.duration / task.partyEfficiency) * 1000;
                task.status = "in-progress";
                task.attempt = attempt;
                task.difficulty = common.varyFloat(task.difficulty, 0.3);
                if (task.skillTest) {
                    var partySkills = adventurerManager.getPartyAttributes(quest.party);

                    var partySkill = partySkills.filter(s => s.name == task.skillTest)[0];
                    var partySkillAmount = 0;
                    if (partySkill) partySkillAmount = partySkill.amount;
                    task.partySkill = partySkillAmount;
                }
                quest.tasks.push(task);
            };

        };
    }
);