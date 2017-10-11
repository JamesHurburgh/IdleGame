/*jshint esversion: 6 */

/*

1. Rename file and NoticeManager to Manager name.
2. Paste the following into AdventureGame:

3. Delete this comment block.

*/

define([
        "app/CommonFunctions",
        "app/DataManager"
    ],
    function NoticeManager(
        CommonFunctions,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        return function NoticeManager(gameState) {

            this.gameState = gameState;

            this.viewContract = function(contract) {
                gameState.selectedContract = contract;
            };

        };
    }
);