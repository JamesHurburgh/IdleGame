define([
        "app/CommonFunctions",
        "app/DataManager",
        "app/GameState"
    ],
    function PartyManager(
        CommonFunctions,
        DataManager,
        GameState) {

        common = new CommonFunctions();
        data = new DataManager();
        var gameState = require("app/GameState");

        return function PartyManager() {

            this.gameState = gameState.getGameState();

        };
    }
);