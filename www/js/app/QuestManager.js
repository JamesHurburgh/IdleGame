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
        return function QuestManager(gameState) {

            this.gameState = gameState;

            this.showQuestsTab = function() {
                return gameState.completedExpeditions.length + gameState.runningExpeditions.length !== 0;
            };

            this.getSelectedContract = function() {
                return gameState.selectedContract;
            };

            this.selectNextContract = function() {
                var availableContracts = gameState.LocationManager().getCurrentLocation().availableContracts;
                var selectedContract = this.getSelectedContract();
                var index = 0;
                if (selectedContract) {
                    index = (availableContracts.indexOf(selectedContract) + 1) % availableContracts.length;
                }
                gameState.selectedContract = availableContracts[index];
            };

            this.canSendSelectedQuest = function() {
                return this.canSendQuest(this.getSelectedContract());
            };

            this.rejectSelectedContract = function() {
                this.rejectContract(this.getSelectedContract());
                gameState.selectedContract = null;
                this.selectNextContract();
            };

            this.rejectContract = function(contract) {
                var availableContracts = gameState.LocationManager().getCurrentLocation().availableContracts;
                availableContracts.splice(availableContracts.indexOf(contract), 1);
            };

            this.canSendQuest = function(contract) {
                return contract.requirements.attributes.reduce(function(canSend, skillRequirement) {
                    return canSend && gameState.AdventurerManager().getCurrentPartyAttribute(skillRequirement.type) >= skillRequirement.amount;
                }, true);
            };

            this.getCurrentQuestRequiredAndAssignedSkillCount = function(skillName) {
                return this.getRequiredAndAssignedSkillCount(this.getSelectedContract(), skillName);
            };

            this.getRequiredAndAssignedSkillCount = function(contract, skillName) {
                var currentlyAssigned = gameState.AdventurerManager().getCurrentPartyAttribute(skillName);
                if (currentlyAssigned === 0) return 0;
                var requiredSkill = contract.requirements.attributes.filter(skill => skill.type == skillName)[0];
                if (!requiredSkill) return 0;
                return Math.min(currentlyAssigned, requiredSkill.amount);
            };

            this.getCurrentQuestRequiredAndUnassignedSkillCount = function(skillName) {
                return this.getRequiredAndUnassignedSkillCount(this.getSelectedContract(), skillName);
            };

            this.getRequiredAndUnassignedSkillCount = function(contract, skillName) {
                var currentlyAssigned = gameState.AdventurerManager().getCurrentPartyAttribute(skillName);
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

                gameState.StatisticsManager().trackStat("send", "quest", 1);
                gameState.StatisticsManager().trackStat("send-quest", contract.name, 1);

                var quest = {
                    id: commonFunctions.uuidv4(),
                    contract: contract,
                    start: Date.now(),
                    expires: Date.now() + (contract.duration * 1000),
                    party: gameState.AdventurerManager().getCurrentParty()
                };

                gameState.AdventurerManager().sendCurrentParty();

                gameState.runningExpeditions.push(quest);

                gameState.runningExpeditions.sort(function(a, b) {
                    return a.expires - b.expires;
                });

                var availableContracts = gameState.LocationManager().getCurrentLocation().availableContracts;
                availableContracts.splice(availableContracts.indexOf(contract), 1);
                gameState.selectedContract = null;
            };

            this.completeQuest = function(quest) {
                gameState.runningExpeditions.splice(gameState.runningExpeditions.indexOf(quest), 1);

                var contract = quest.contract;

                gameState.StatisticsManager().trackStat("complete", "quest", 1);
                gameState.StatisticsManager().trackStat("complete-quest", contract.name, 1);

                // Return questers to sendable pool
                quest.upgradeMessages = "";
                quest.awol = false;
                quest.survivors = [];
                quest.casualaties = [];

                if (quest.party) {
                    quest.party.forEach(function(adventurer) {
                        // Did they die?
                        if (Math.random() * gameState.EffectsManager().getGlobalValue("questRisk") < contract.risk) {
                            adventurer.status = "Dead";
                            gameState.StatisticsManager().trackStat("death", "adventurer", 1);
                            quest.casualaties.push(adventurer);

                            // gameState.StatisticsManager().trackStat("death-adventurer", adventurer.type, 1);
                        } else {
                            // if (Math.random() * gameState.EffectsManager().getGlobalValue("upgradeChance") < contract.upgradeChance) { // Then someone 'upgraded'
                            //     gameState.AdventurerManager().upgradeAdventurer(adventurer);
                            //     // TODO handle upgrades
                            // }
                            adventurer.status = "Idle";
                            adventurer.experience++;
                            quest.survivors.push(adventurer);
                        }
                    }, this);
                }

                if (quest.contract.experience > 0 && quest.survivors.length > 0) {
                    var xpEach = Math.ceil(quest.experience / survived);
                    quest.survivors.foreach(function(adventurer) {
                        adventurer.experience += xpEach;
                    });
                }

                quest.completionMessage = "";

                // Calculate success
                quest.success = quest.survivors.length > 0 && Math.random() < contract.successChance;
                if (quest.success) {
                    quest.completionMessage = contract.successMessage;

                    quest.rewards = [];
                    for (var j = 0; j < contract.rewards.length; j++) {
                        var chance = contract.rewards[j].chance;
                        if (Math.random() < chance) {
                            var reward = contract.rewards[j].reward;
                            if (reward.type == "item") {
                                quest.rewards.push({ "type": reward.type, "item": gameState.ItemManager().generateRewardItem(reward) });
                            } else {
                                var rewardAmount = commonFunctions.varyAmount(reward.amount);
                                if (rewardAmount > 0) {
                                    quest.rewards.push({ "type": reward.type, "amount": rewardAmount });
                                }
                            }
                        }
                    }
                    gameState.StatisticsManager().trackStat("succeed", "quest", 1);
                    gameState.StatisticsManager().trackStat("succeed-quest", contract.name, 1);
                } else {
                    quest.completionMessage = contract.failureMessage;
                    gameState.StatisticsManager().trackStat("fail", "quest", 1);
                    gameState.StatisticsManager().trackStat("fail-quest", contract.name, 1);
                }

                gameState.completedExpeditions.push(quest);
            };

            this.claimReward = function(expedition) {
                gameState.StatisticsManager().trackStat("claim", "reward", 1);
                if (expedition.contract.contractAmount) {
                    gameState.PlayerManager().giveCoins(expedition.contract.contractAmount);
                }
                for (var i = 0; i < expedition.rewards.length; i++) {
                    gameState.PlayerManager().giveReward(expedition.rewards[i]);
                }
                this.removeQuest(expedition);
            };


            // Expediations

            this.claimAllCompletedExpeditions = function() {
                // while (this.completedExpeditions.length > 0) {
                //     if (this.completedExpeditions[0].success) {
                //         this.claimReward(this.completedExpeditions[0]);
                //     } else {
                //         this.removeQuest(this.completedExpeditions[0]);
                //     }
                // }
            };

            this.removeQuest = function(expedition) {
                gameState.completedExpeditions.splice(gameState.completedExpeditions.indexOf(expedition), 1);
            };

            this.questProgress = function(expedition) {
                return 100 * ((Date.now() - expedition.start) / (expedition.expires - expedition.start));
            };

            this.checkForCompletedQuests = function() {

                var expired = gameState.runningExpeditions.filter(quest => quest.expires <= Date.now());

                for (var i = 0; i < expired.length; i++) {
                    this.completeQuest(expired[i]);
                }
            };

        };
    }
);