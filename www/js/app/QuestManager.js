/*jshint esversion: 6 */

define([
    "app/CommonFunctions",
    "json!data/contracts.json"
],
    function QuestManager(
        CommonFunctions,
        contracts) {

        commonFunctions = new CommonFunctions();
        chance = new Chance();
        return function QuestManager(gameController, gameState) {

            this.gameState = gameState;
            this.gameController = gameController;

            this.getCompletedQuests = function () {
                if (!this.gameState.completedQuests) this.gameState.completedQuests = [];
                return this.gameState.completedQuests;
            };

            this.getRunningQuests = function () {
                if (!this.gameState.runningQuests) this.gameState.runningQuests = [];
                return this.gameState.runningQuests;
            };

            this.showQuestsTab = function () {
                return this.getCompletedQuests().length + this.getRunningQuests().length !== 0;
            };

            this.getSelectedContract = function () {
                return this.gameState.selectedContract;
            };

            this.selectNextContract = function () {
                var availableContracts = this.gameController.LocationManager().getCurrentLocation().availableContracts;
                var selectedContract = this.getSelectedContract();
                var index = 0;
                if (selectedContract) {
                    index = (availableContracts.indexOf(selectedContract) + 1) % availableContracts.length;
                }
                this.gameState.selectedContract = availableContracts[index];
            };

            this.canSendSelectedQuest = function () {
                return this.canSendQuest(this.getSelectedContract());
            };

            this.isSkillRelevantToContract = function (skill, contract) {
                if (!skill || !contract) return false;
                var skillRequiredForContract = contract.requirements.attributes.filter(sk => sk.type == skill.name)[0];
                return skillRequiredForContract !== undefined && skillRequiredForContract.amount > 0;
            };

            this.rejectSelectedContract = function () {
                this.rejectContract(this.getSelectedContract());
                this.gameState.selectedContract = null;
                this.selectNextContract();
            };

            this.rejectContract = function (contract) {
                var availableContracts = this.gameController.LocationManager().getCurrentLocation().availableContracts;
                availableContracts.splice(availableContracts.indexOf(contract), 1);
                this.gameController.StatisticsManager().trackStat("reject", "contract", 1);
                this.gameController.StatisticsManager().trackStat("reject", contract.name, 1);
            };

            this.canSendQuest = function (contract) {
                if (!contract) return;
                var adventurerManager = this.gameController.AdventurerManager();
                return contract.requirements.attributes.reduce(function (canSend, skillRequirement) {
                    return canSend && adventurerManager.getCurrentPartyAttribute(skillRequirement.type) >= skillRequirement.amount;
                }, true);
            };

            this.getCurrentQuestRequiredAndAssignedSkillCount = function (skillName) {
                return this.getRequiredAndAssignedSkillCount(this.getSelectedContract(), skillName);
            };

            this.getRequiredAndAssignedSkillCount = function (contract, skillName) {
                if (!contract || !skillName) return;
                var currentlyAssigned = this.gameController.AdventurerManager().getCurrentPartyAttribute(skillName);
                if (currentlyAssigned === 0) return 0;
                var requiredSkill = contract.requirements.attributes.filter(skill => skill.type == skillName)[0];
                if (!requiredSkill) {
                    return 0;
                }
                return Math.min(currentlyAssigned, requiredSkill.amount);
            };

            this.getCurrentQuestRequiredAndUnassignedSkillCount = function (skillName) {
                return this.getRequiredAndUnassignedSkillCount(this.getSelectedContract(), skillName);
            };

            this.getRequiredAndUnassignedSkillCount = function (contract, skillName) {
                var currentlyAssigned = this.gameController.AdventurerManager().getCurrentPartyAttribute(skillName);
                var requiredSkill = contract.requirements.attributes.filter(skill => skill.type == skillName)[0];
                if (!requiredSkill) return 0;
                return Math.max(requiredSkill.amount - currentlyAssigned, 0);
            };

            this.sendSelectedQuest = function () {
                this.sendQuest(this.getSelectedContract());
                this.selectNextContract();
            };

            this.sendQuest = function (contract) {
                if (!this.canSendQuest(contract)) {
                    return;
                }

                this.gameController.StatisticsManager().trackStat("send", "quest", 1);
                this.gameController.StatisticsManager().trackStat("send-quest", contract.name, 1);

                var quest = {
                    id: commonFunctions.uuidv4(),
                    contract: contract,
                    start: Date.now(),
                    expires: Date.now() + (contract.duration * 1000),
                    party: this.gameController.AdventurerManager().getCurrentParty(),
                    tasks: []
                };

                if (contract.tasks && contract.startTaskId) {
                    this.startTask(quest, contract.startTaskId);
                    quest.expires = null; // This will eventually be removed.
                }

                this.gameController.AdventurerManager().sendCurrentParty();

                this.getRunningQuests().push(quest);

                this.getRunningQuests().sort(function (a, b) {
                    return a.expires - b.expires;
                });

                var availableContracts = this.gameController.LocationManager().getCurrentLocation().availableContracts;
                availableContracts.splice(availableContracts.indexOf(contract), 1);
                this.gameState.selectedContract = null;
            };

            this.completeQuest = function (quest, finishes) {
                if (!finishes) finishes = Date.now();
                log("completeQuest");
                var contract = quest.contract;
                quest.finishTime = finishes;

                // Remove the quest from the running tab
                this.getRunningQuests().splice(this.getRunningQuests().indexOf(quest), 1);

                // Track the stats
                this.gameController.StatisticsManager().trackStat("complete", "quest", 1);
                this.gameController.StatisticsManager().trackStat("complete-quest", contract.name, 1);

                // Determine if any of the party died
                quest.survivors = [];
                quest.casualaties = [];
                if (quest.party) {
                    quest.party.forEach(function (adventurer) {
                        // Did they die?
                        if (Math.random() * this.gameController.EffectsManager().getGlobalValue("questRisk") < contract.risk) {
                            var causeOfInjury = "Injured while on contract: " + contract.name;
                            var injuryTime = quest.expires;
                            var injury = this.gameController.AdventurerManager().injureAdventurer(adventurer, causeOfInjury, injuryTime);
                            if (adventurer.status == "Dead") {
                                quest.casualaties.push(adventurer);
                            } else {
                                quest.survivors.push({ adventurer: adventurer, injuriesGained: injury });
                            }
                        } else {
                            this.gameController.AdventurerManager().setAdventurerRecovering(adventurer);
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
                    this.gameController.StatisticsManager().trackStat("succeed", "quest", 1);
                    this.gameController.StatisticsManager().trackStat("succeed-quest", contract.name, 1);

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
                            this.gameController.AdventurerManager().giveAdventurerXP(survivor.adventurer, xpGained);
                        }
                    }

                    quest.rewards = [];
                    // For each potential reward
                    for (var j = 0; j < contract.rewards.length; j++) {
                        var chance = contract.rewards[j].chance;
                        if (Math.random() < chance) {
                            var reward = contract.rewards[j].reward;
                            if (reward.type == "item") {
                                quest.rewards.push({ "type": reward.type, "item": this.gameController.ItemManager().generateRewardItem(reward) });
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
                            this.gameController.PlayerManager().giveReward(quest.rewards[i]);
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
                            this.gameController.AdventurerManager().giveAdventurerCoins(survivorCoin.adventurer, coinsGained);
                        }

                    }

                    quest.remainingCoins = remainingCoins;
                    quest.wagesPaid = coins - remainingCoins;
                    this.gameController.PlayerManager().giveCoins(remainingCoins);

                } else {
                    quest.completionMessage = contract.failureMessage;
                    this.gameController.StatisticsManager().trackStat("fail", "quest", 1);
                    this.gameController.StatisticsManager().trackStat("fail-quest", contract.name, 1);
                }

                this.getCompletedQuests().push(quest);
            };

            // Expediations

            this.claimAllCompletedQuests = function () {
                // while (this.completedExpeditions.length > 0) {
                //     if (this.completedExpeditions[0].success) {
                //         this.claimReward(this.completedExpeditions[0]);
                //     } else {
                //         this.removeQuest(this.completedExpeditions[0]);
                //     }
                // }
            };

            this.removeQuest = function (expedition) {
                this.getCompletedQuests().splice(this.getCompletedQuests().indexOf(expedition), 1);
            };

            this.questProgress = function (expedition) {
                return 100 * ((Date.now() - expedition.start) / (expedition.expires - expedition.start));
            };

            this.checkForCompletedQuests = function () {

                var expired = this.getRunningQuests().filter(quest => quest.expires !== null && quest.expires <= Date.now());

                for (var i = 0; i < expired.length; i++) {
                    this.completeQuest(expired[i]);
                }

                // Check for completed tasks
                var questsWithCompletedTasks = this.getRunningQuests().filter(quest =>
                    quest.tasks.filter(task => task.status == "in-progress" && task.finishes <= Date.now()).length > 0);

                questsWithCompletedTasks.forEach(function (quest) {
                    this.completeTasks(quest);
                }, this);
            };

            this.completeTasks = function (quest) {
                var completedTasks = quest.tasks.filter(task => task.status == "in-progress" && task.finishes <= Date.now());
                var partySkills = this.gameController.AdventurerManager().getPartyAttributes(quest.party);
                completedTasks.forEach(function (task) {
                    if (task.skillTest) {
                        var partySkill = partySkills.filter(s => s.name == task.skillTest)[0];
                        var partySkillAmount = 0;
                        if (partySkill) partySkillAmount = partySkill.amount;

                        var difficulty = task.difficulty;

                        task.success = Math.random() * partySkillAmount >= Math.random() * difficulty;
                    } else {
                        task.success = true;
                    }

                    if (task.success) {
                        task.status = "complete";
                        if (task.taskAfterSuccess) {
                            this.startTask(quest, task.taskAfterSuccess, task.finishes);
                        } else {
                            this.finishQuest(quest, task.finishes);
                        }
                    } else {

                        if (task.injuryOnFail) {
                            var adventurer = chance.pickone(quest.party);
                            this.injureAdventurerOnQuest(adventurer, task.injuryOnFail, task.finishes);
                        }

                        if (task.attempt > task.retry) {
                            task.status = "complete";
                            if (task.taskAfterFail) {
                                this.startTask(quest, task.taskAfterFail, task.finishes);
                            } else {
                                this.finishQuest(quest, task.finishes);
                            }
                        } else {
                            this.startTask(quest, task.id, task.finishes, task.attempt + 1);
                        }
                        this.finishQuest(quest, task.finishes);
                    }
                }, this);
            };

            this.finishQuest = function (quest, finishes) {
                this.completeQuest(quest, finishes);
            };

            this.startTask = function (quest, taskId, startTime, attempt) {
                if (!startTime) startTime = Date.now();
                if (!attempt) attempt = 1;

                var task = common.clone(quest.contract.tasks.filter(task => task.id == taskId)[0]);
                if (!task) {
                    log("Cannot find task with id '" + taskId + "' in quest '" + quest.contract.name + "'.");
                    this.completeQuest(quest);
                    return;
                }
                task.startTime = startTime;
                task.finishes = startTime + task.duration * 1000;
                task.status = "in-progress";
                task.attempt = attempt;
                if (task.skillTest) {
                    var partySkills = this.gameController.AdventurerManager().getPartyAttributes(quest.party);

                    task.partySkill = partySkills.filter(s => s.name == task.skillTest)[0].amount;
                }
                quest.tasks.push(task);
            };

        };
    }
);