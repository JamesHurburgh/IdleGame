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

            this.canSendQuest = function(contract) {
                return contract.requirements.attributes.reduce(function(canSend, skillRequirement) {
                    return canSend && gameState.AdventurerManager().getCurrentPartyAttribute(skillRequirement.type) >= skillRequirement.amount;
                }, true);
            };

            this.sendSelectedQuest = function() {
                this.sendQuest(this.getSelectedContract());
            };

            this.sendQuest = function(contract) {
                if (!this.canSendQuest(contract)) {
                    return;
                }

                gameState.trackStat("send", "quest", 1);
                gameState.trackStat("send-quest", contract.name, 1);

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

                gameState.trackStat("complete", "quest", 1);
                gameState.trackStat("complete-quest", contract.name, 1);

                // Return questers to sendable pool
                quest.upgradeMessages = "";
                quest.awol = false;
                var survived = 0;
                var died = 0;
                var upgraded = 0;

                if (quest.party) {
                    quest.party.forEach(function(adventurer) {
                        // Did they die?
                        if (Math.random() * gameState.getGlobalValue("questRisk") < contract.risk) {
                            adventurer.status = "Dead";
                            gameState.trackStat("death", "adventurer", 1);
                            died++;
                            // gameState.trackStat("death-adventurer", adventurer.type, 1);
                        } else {
                            if (Math.random() * gameState.getGlobalValue("upgradeChance") < contract.upgradeChance) { // Then someone 'upgraded'
                                // TODO handle upgrades
                            }
                            adventurer.status = "Idle";
                            survived++;
                        }
                    }, this);
                }

                quest.completionMessage = "";

                // Calculate success
                quest.success = survived > 0 && Math.random() < contract.successChance;
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
                    gameState.trackStat("succeed", "quest", 1);
                    gameState.trackStat("succeed-quest", contract.name, 1);
                } else {
                    quest.completionMessage = contract.failureMessage;
                    gameState.trackStat("fail", "quest", 1);
                    gameState.trackStat("fail-quest", contract.name, 1);
                }

                gameState.completedExpeditions.push(quest);
            };
        };
    }
);