/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/DataManager",
        "app/GameState",
        "alertify",
        "store"
    ],
    function GameStateManager(
        CommonFunctions,
        DataManager,
        GameState,
        alertify,
        store) {

        common = new CommonFunctions();
        data = new DataManager();
        var gameState = require("app/GameState");

        var LocationManager = require("app/LocationManager");
        var locationManager = new LocationManager();

        var AdventurerManager = require("app/AdventurerManager");
        var adventurerManager = new AdventurerManager();

        return function GameStateManager() {

            this.gameState = gameState.getGameState();

            this.save = function() {
                gameState.save();
            };

            this.reset = function() {
                log("reset");

                this.gameState.majorTickCounter = 0;

                this.gameState.coins = 50;
                this.gameState.renown = 0;

                this.gameState.runningQuests = [];
                this.gameState.completedQuests = [];

                // Take a local copy of the locations
                locationManager.resetLocations();

                // locationManager.setCurrentLocation(this.gameState.locationList[0].name);
                // var location = locationManager.getCurrentLocation();
                // location.availableContracts = [];
                // location.availableAdventurers = [];

                // Initilise options
                this.gameState.options = {
                    "claimAllButtons": false,
                    "automaticHire": false,
                    "automaticClaim": false,
                    "automaticSend": false,
                    "automaticRelocate": false,
                    "automaticFreeCoins": false,
                    "showMessageTimeAsRealTime": false
                };

                // Initialise stats
                if (!this.gameState.stats) {
                    this.gameState.stats = [];
                } else {
                    for (var i = 0; i < this.gameState.stats.length; i++) {
                        this.gameState.stats[i].current = 0;
                    }
                }
                this.gameState.claimedAchievements = [];

                this.gameState.ownedItems = [];
                this.gameState.messages = [];

                this.gameState.currentEffects = [];

                this.gameState.selectedContract = null;
                this.gameState.selectedAdverturer = null;
                this.gameState.currentParty = [];
                this.gameState.adventurerList = [];

                this.gameState.loginTracker = [];

                this.gameState.version = data.game.versions[0].number;

            };

            this.versionCheck = function() {
                log("versionCheck");

                // Fix for version 0.10.7

                adventurerManager.addMissingFields();

                var currentVersion = data.game.versions[0].number;
                if (this.gameState.version != currentVersion) {
                    var releaseNotesButton = '<button class="btn btn-info" data-toggle="modal" data-target="#releaseNotes">Release Notes</button>';
                    var versionUpdateMessage = "Version updated from " + this.gameState.version + " to " + currentVersion + ". Check the " + releaseNotesButton + ".";
                    alertify.delay(10000);
                    alertify.alert("<h2>Version update!</h2><p class='text-info'>" + versionUpdateMessage + "</p>");
                }
                this.gameState.version = data.game.versions[0].number;
            };

        };
    }
);