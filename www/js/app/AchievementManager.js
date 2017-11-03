/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/GameState",
        "json!data/achievements.json"
    ],
    function AchievementManager(CommonFunctions,
        GameState, achievements) {

        commonFunctions = new CommonFunctions();
        var gameState = require("app/GameState");

        var StatisticsManager = require("app/StatisticsManager");
        var statisticsManager = new StatisticsManager();

        var MessageManager = require("app/MessageManager");
        var messageManager = new MessageManager();

        return function AchievementManager() {

            this.gameState = gameState.getGameState();

            this.getClaimedAchievements = function() {
                if (!this.gameState.claimedAchievements) this.gameState.claimedAchievements = [];
                return this.gameState.claimedAchievements;
            };

            // Achievements
            this.hasAchievement = function(achievement) {
                return this.getClaimedAchievements().filter(claimedAchievement => claimedAchievement.name == achievement.name).length > 0;
            };

            this.claimAchievement = function(achievement) {
                if (!this.hasAchievement(achievement.name)) {
                    this.getClaimedAchievements().push({ "name": achievement.name, "timeClaimed": Date.now() });
                    messageManager.message("Got achievement:" + achievement.name + " (" + achievement.description + ")");
                    statisticsManager.trackStat("claim", "achievement");
                }
            };

            this.canClaimAchievement = function(achievement) {
                if (this.hasAchievement(achievement)) {
                    return false;
                }
                switch (achievement.trigger.type) {
                    case "statistic":
                        var stat = statisticsManager.getStat(achievement.trigger.statistic);
                        return stat && stat.current > achievement.trigger.statisticamount;
                }
            };

            this.checkAndClaimAchievement = function(achievement) {
                if (this.canClaimAchievement(achievement)) {
                    this.claimAchievement(achievement);
                }
            };

            this.checkAndClaimAllAchievements = function() {
                for (var i = 0; i < achievements.length; i++) {
                    this.checkAndClaimAchievement(achievements[i]);
                }
            };

            this.achievementProgress = function(achievement) {
                if (this.hasAchievement(achievement)) {
                    return 100;
                }
                switch (achievement.trigger.type) {
                    case "statistic":
                        var stat = statisticsManager.getStat(achievement.trigger.statistic);
                        if (stat) {
                            return (stat.current / achievement.trigger.statisticamount) * 100;
                        }
                }
                return 0;
            };

        };
    }
);