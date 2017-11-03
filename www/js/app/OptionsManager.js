/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/GameState",
        "app/DataManager"
    ],
    function OptionsManager(
        CommonFunctions,
        GameState,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        var gameState = require("app/GameState");

        var PlayerManager = require("app/PlayerManager");
        var playerManager = new PlayerManager();

        return function OptionsManager() {

            this.gameState = gameState.getGameState();

            // Options
            this.cheat = function() {
                log("cheat");
                playerManager.giveCoins(100000000000);
                playerManager.giveRenown(100000000000);
            };

            this.getOptions = function() {
                if (!this.gameState.options) this.gameState.options = {};
                return this.gameState.options;
            };

        };
    }
);