/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/GameState"
    ],
    function SessionManager(CommonFunctions,
        GameState) {

        commonFunctions = new CommonFunctions();
        var gameState = require("app/GameState");

        return function SessionManager() {

            this.gameState = gameState.getGameState();

            // Login
            this.login = function() {
                log("login");

                this.gameState.timeSinceLastLogin = -1;
                var loginTime = Date.now();
                if (this.gameState.loginTracker === undefined) {
                    this.gameState.loginTracker = [];
                } else if (this.gameState.loginTracker.length > 0) {
                    this.gameState.timeSinceLastLogin = loginTime - this.gameState.loginTracker[this.gameState.loginTracker.length - 1].logout;
                }
                this.gameState.loginTracker.push({ "login": loginTime });
            };

            this.stillLoggedIn = function() {
                if (this.gameState.loginTracker === undefined || this.gameState.loginTracker === null || this.gameState.loginTracker.length === 0) {
                    this.gameState.loginTracker = [];
                    this.gameState.loginTracker.push({ "login": Date.now() });
                }
                this.gameState.loginTracker[this.gameState.loginTracker.length - 1].logout = Date.now();
            };

        };
    }
);