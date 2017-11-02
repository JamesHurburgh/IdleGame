/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/GameState",
        "app/DataManager"
    ],
    function StatisticsManager(CommonFunctions,
        GameState, DataManager) {

        commonFunctions = new CommonFunctions();
        var gameState = require("app/GameState");

        return function StatisticsManager() {

            this.gameState = gameState.getGameState();

            this.getStatistics = function() {
                if (!this.gameState.stats) this.gameState.stats = [];
                return this.gameState.stats;
            };

            this.getStatName = function(action, subject) {
                return (action + "-" + subject).toLowerCase().replace(/ /g, "_");
            };

            this.getStat = function(name) {
                return this.getStatistics().filter(stat => stat.name == name)[0];
            };

            this.trackStat = function(action, subject, amount) {
                if (!amount) amount = 1;
                var name = this.getStatName(action, subject);
                stat = this.getStat(name);
                if (!stat) {
                    this.getStatistics().push({ name: name, current: amount, allTime: amount });
                } else {
                    stat.current += amount;
                    stat.allTime += amount;
                }
            };

            this.trackStats = function(action, subjects) {
                subjects.forEach(function(subject) {
                    this.trackStat(action, subject);
                }, this);
            };

            this.filteredStats = function(filter) {
                if (!filter) {
                    return this.getStatistics();
                }
                return this.getStatistics().filter(stat => stat.name.indexOf(filter.toLowerCase().trim()) !== -1);
            };
        };
    }
);