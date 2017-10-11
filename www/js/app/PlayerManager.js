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

            this.giveRenown = function(amount) {
                $('#footerRenown').animateCss('bounce');
                gameState.StatisticsManager().trackStat("get", "renown", amount);
                gameState.renown += amount;
            };

            // Coins

            this.giveCoins = function(amount) {
                $('#footerCoin').animateCss('bounce');
                gameState.StatisticsManager().trackStat("get", "coins", amount);
                gameState.coins += amount;
            };

            this.spendCoins = function(coins) {
                gameState.coins -= coins;
                gameState.StatisticsManager().trackStat("spend", "coins", coins);
            };

        };
    }
);