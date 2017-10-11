/*jshint esversion: 6 */

/*

1. Rename file and SessionManager to Manager name.
2. Update the DATA_FILE variable.
3. Paste the following into AdventureGame:

            _SessionManager = new SessionManager(this);
            this.SessionManager = function() {
                return _SessionManager;
            };
4. Delete this comment block.

*/

define([
    "app/CommonFunctions"],
    function SessionManager(CommonFunctions) {

        commonFunctions = new CommonFunctions();

        return function SessionManager(gameState) {

            this.gameState = gameState;
            // Login
            this.login = function () {
                log("login");

                gameState.timeSinceLastLogin = -1;
                var loginTime = Date.now();
                if (gameState.loginTracker === undefined) {
                    gameState.loginTracker = [];
                } else if (gameState.loginTracker.length > 0) {
                    gameState.timeSinceLastLogin = loginTime - gameState.loginTracker[gameState.loginTracker.length - 1].logout;
                }
                gameState.loginTracker.push({ "login": loginTime });
            };

            this.stillLoggedIn = function () {
                if (gameState.loginTracker === undefined) {
                    gameState.loginTracker = [];
                    gameState.loginTracker.push({ "login": Date.now() });
                }
                gameState.loginTracker[gameState.loginTracker.length - 1].logout = Date.now();
            };

        };
    }
);