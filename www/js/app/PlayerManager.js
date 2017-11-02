/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/GameState",
        "app/DataManager"
    ],
    function PlayerManager(
        CommonFunctions,
        GameState,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        var gameState = require("app/GameState");

        var StatisticsManager = require("app/StatisticsManager");
        var statisticsManager = new StatisticsManager();

        var ItemManager = require("app/ItemManager");
        var itemManager = new ItemManager();

        return function PlayerManager() {

            this.gameState = gameState.getGameState();

            // Renown
            this.getRenownValue = function() {
                if (!this.gameState.renown) this.gameState.renown = 0;
                return this.gameState.renown;
            };

            this.getRenown = function() {
                return data.renown.filter(r => r.minimum <= this.getRenownValue() && r.maximum > this.getRenownValue())[0];
            };

            this.getCoins = function() {
                if (this.gameState.coins === undefined || this.gameState.coins === null) this.gameState.coins = 50;
                return this.gameState.coins;
            };

            this.giveRenown = function(amount) {
                $('#footerRenown').animateCss('bounce');
                statisticsManager.trackStat("get", "renown", amount);
                this.gameState.renown = this.getRenownValue() + amount;
            };

            // Coins
            this.giveCoins = function(amount) {
                $('#footerCoin').animateCss('bounce');
                statisticsManager.trackStat("get", "coins", amount);
                this.gameState.coins += amount;
            };

            this.spendCoins = function(coins) {
                this.gameState.coins -= coins;
                statisticsManager.trackStat("spend", "coins", coins);
            };

            // Rewards
            this.giveReward = function(reward) {
                switch (reward.type) {
                    case "coins":
                        this.giveCoins(reward.amount);
                        break;
                    case "reknown":
                    case "renown":
                        this.giveRenown(reward.amount);
                        break;
                    case "item":
                        itemManager.giveItem(reward.item);
                        break;
                    default:
                }
            };

        };
    }
);