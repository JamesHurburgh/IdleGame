/*jshint esversion: 6 */

define([
    "app/CommonFunctions",
    "app/DataManager"],
    function PlayerManager(
        CommonFunctions,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        return function PlayerManager(gameState) {

            this.gameState = gameState;

            // Renown
            this.getRenown = function () {
                return DataManager().renown.filter(r => r.minimum <= gameState.renown && r.maximum > gameState.renown)[0];
            };

        };
    }
);