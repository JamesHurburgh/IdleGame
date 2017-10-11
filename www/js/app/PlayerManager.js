/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/DataManager"
    ],
    function PlayerManager(
        CommonFunctions,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        return function PlayerManager(gameState) {

            this.gameState = gameState;

            // Renown
            this.getRenown = function() {
                return data.renown.filter(r => r.minimum <= this.gameState.renown && r.maximum > this.gameState.renown)[0];
            };


            // Coins
            this.spendCoins = function(coins) {
                this.coins -= coins;
                gameState.StatisticsManager().trackStat("spend", "coins", coins);
            };

        };
    }
);