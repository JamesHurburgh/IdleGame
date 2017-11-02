/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/GameState",
        "json!data/items.json"
    ],
    function ItemManager(
        CommonFunctions,
        GameState,
        items) {

        var gameState = require("app/GameState");

        var StatisticsManager = require("app/StatisticsManager");
        var statisticsManager = new StatisticsManager();

        var PlayerManager = require("app/PlayerManager");
        var playerManager = new PlayerManager();

        var EffectsManager = require("app/EffectsManager");
        var effectsManager = new EffectsManager();

        return function ItemManager() {

            this.gameState = gameState.getGameState();

            this.getOwnedItems = function() {
                if (!this.gameState.ownedItems) this.gameState.ownedItems = [];
                return this.gameState.ownedItems;
            };

            this.showItemTab = function() {
                return this.getOwnedItems().length !== 0;
            };

            this.itemFunctions = [];
            this.itemFunctions["use-minor-mysterious-scroll"] = function(game) {
                var effects = [{
                        "description": "Suddenly your purse seems heavier.",
                        "effect": function(game) {
                            playerManager.giveCoins(1000);
                        }
                    },
                    {
                        "description": "Suddenly every seems to have a job for you.",
                        "effect": function(game) {
                            effectsManager.addEffect("chanceOfNewContract", 2, Date.now() + 60000);
                        }
                    },
                    {
                        "description": "Suddenly every seems to want to work for you.",
                        "effect": function(game) {
                            effectsManager.addEffect("chanceOfNewHire", 2, Date.now() + 60000);
                        }
                    },
                    {
                        "description": "Suddenly every seems to be willing to work for much less.",
                        "effect": function(game) {
                            effectsManager.addEffect("hireCostModifier", 2, Date.now() + 60000);
                        }
                    },
                    {
                        "description": "Suddenly it seems like there are lots more coins around for the taking.",
                        "effect": function(game) {
                            effectsManager.addEffect("freeCoinsModifier", 10, Date.now() + 60000);
                        }
                    },
                    {
                        "description": "Suddenly it seems like everyone on quests are a lot safer.",
                        "effect": function(game) {
                            effectsManager.addEffect("questRisk", 0.1, Date.now() + 60000);
                        }
                    },
                    {
                        "description": "Suddenly it seems like everyone on quests are learning new things.",
                        "effect": function(game) {
                            effectsManager.addEffect("upgradeChance", 5, Date.now() + 60000);
                        }
                    }
                ];

                var effect = effects[Math.floor(Math.random() * effects.length)];
                game.MessageManager().message("You read a mysterious scroll. " + effect.description);
                effect.effect(game);
            };
            this.itemFunctions["use-mysterious-scroll"] = this.itemFunctions["use-minor-mysterious-scroll"];

            this.canSell = function(item) {
                return item.value !== undefined && item.value > 0;
            };

            this.sellItem = function(item) {
                if (!this.canSell(item)) {
                    return;
                }
                statisticsManager.trackStat("sell", "item", 1);
                statisticsManager.trackStat("sell-item", item.name, 1);
                playerManager.giveCoins(item.value);
                this.removeItem(item);

            };

            this.canUse = function(item) {
                if (item.usage !== undefined) {
                    return true;
                }
            };

            this.removeItem = function(item) {
                this.gameState.ownedItems.splice(this.gameState.ownedItems.indexOf(item), 1);
            };

            this.useItem = function(item) {
                if (!this.canUse(item)) {
                    return;
                }

                var usageFunction = this.itemFunctions[item.usage];
                if (!usageFunction) {
                    return;
                }

                usageFunction();
                statisticsManager.trackStat("use-item", item.name, 1);
                this.removeItem(item);
            };

            this.giveItem = function(item) {
                this.gameState.ownedItems.push(item);
                statisticsManager.trackStat("collect", "item", 1);
                statisticsManager.trackStat("collect-item", item.name, 1);
            };

            this.generateRewardItem = function(reward) {
                return this.generateItem(reward.itemType, reward.value);
            };

            this.getItemDefinition = function(itemType) {
                return items.filter(item => item.type == itemType)[0];
            };

            this.generateItem = function(itemType, value) {
                var itemDefinition = this.getItemDefinition(itemType);
                if (itemDefinition === undefined) {
                    return { "name": itemType, "value": commonFunctions.varyAmount(value) };
                }
                // Check for subsets first
                if (itemDefinition.subsets !== undefined) {
                    var subset = itemDefinition.subsets[Math.floor(Math.random() * itemDefinition.subsets.length)];
                    return this.generateItem(subset, value);
                }

                var item = { "name": itemDefinition.displayName, "usage": itemDefinition.usage, "value": itemDefinition.baseValue };

                if (itemDefinition.prefixesList !== undefined) {
                    for (var i = 0; i < itemDefinition.prefixesList.length; i++) {
                        var prefix = itemDefinition.prefixesList[i][Math.floor(Math.random() * itemDefinition.prefixesList[i].length + 1)];
                        if (prefix !== undefined) {
                            item.name = prefix.prefix + " " + item.name;
                            item.value *= prefix.valueModifier;
                        }
                    }
                }
                item.value = Math.floor(item.value);

                return item;
            };
        };
    }
);