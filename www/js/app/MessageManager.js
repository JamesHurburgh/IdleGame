/*jshint esversion: 6 */

define([
        "alertify",
        "app/CommonFunctions",
        "app/GameState"
    ],
    function MessageManager(
        alertify,
        CommonFunctions,
        GameState) {

        commonFunctions = new CommonFunctions();
        var gameState = require("app/GameState");

        return function MessageManager() {

            this.gameState = gameState.getGameState();

            this.getMessages = function() {
                if (!this.gameState.messages) this.gameState.messages = [];
                return this.gameState.messages;
            };

            this.showMessageTab = function() {
                return this.getMessages().length !== 0;
            };

            this.recentMessages = function() {
                return this.getMessages().filter(message => message.time + 60000 > Date.now());
            };

            this.message = function(message) {
                alertify.alert(message);
                this.getMessages().unshift({ "id": commonFunctions.uuidv4, "message": message, "time": Date.now() });
            };

            this.dismissMessage = function(message) {
                this.getMessages().splice(this.getMessages().indexOf(message), 1);
            };
        };
    }
);