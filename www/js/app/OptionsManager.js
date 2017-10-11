/*jshint esversion: 6 */

define([
    "app/CommonFunctions",
    "app/DataManager"],
    function OptionsManager(
        CommonFunctions,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        return function OptionsManager(gameState) {

            this.gameState = gameState;

            // Options
            this.cheat = function () {
                log("cheat");
                gameState.giveCoins(100000000000);
                gameState.giveRenown(100000000000);
            };

        };
    }
);