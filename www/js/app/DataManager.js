/*jshint esversion: 6 */

/*

1. Rename file and DataManager to Manager name.
2. Update the DATA_FILE variable.
3. Paste the following into AdventureGame:

            _DataManager = new DataManager(this);
            this.DataManager = function() {
                return _DataManager;
            };
4. Delete this comment block.

*/

define([
    "app/CommonFunctions",
    "json!data/game.json",
    "json!data/settings.json",
    "json!data/calendar.json",
    "json!data/contracts.json",
    "json!data/locations.json",
    "json!data/adventurers.json",
    "json!data/renown.json",
    "json!data/achievements.json",
    "json!data/skills.json"],
    function DataManager(
        CommonFunctions,
        game,
        settings,
        calendar,
        contracts,
        locations,
        adventurers,
        renown,
        achievements,
        skills) {

        commonFunctions = new CommonFunctions();

        return function DataManager(gameState) {

            this.gameState = gameState;

            this.calendar = calendar;

        };
    }
);