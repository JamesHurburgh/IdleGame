/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/DataManager"
    ],
    function GameStateManager(
        CommonFunctions,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        return function GameStateManager(gameState) {

            this.gameState = gameState;

            this.reset = function() {
                log("reset");
                // Then initialise new
                gameState.majorTickCounter = 0;

                gameState.coins = 10;
                gameState.renown = 0;
                gameState.freeCoinsTimeout = 0;

                gameState.hired = {};

                gameState.runningExpeditions = [];
                gameState.completedExpeditions = [];

                // Take a local copy of the locations
                gameState.allLocations = commonFunctions.clone(locations);
                gameState.LocationManager().setCurrentLocation(gameState.allLocations[0].name);

                gameState.LocationManager().getCurrentLocation().availableContracts = [];
                gameState.LocationManager().getCurrentLocation().availableAdventurers = [];

                // Initilise options
                gameState.options = {
                    "claimAllButtons": false,
                    "automaticHire": false,
                    "automaticClaim": false,
                    "automaticSend": false,
                    "automaticRelocate": false,
                    "automaticFreeCoins": false,
                    "showMessageTimeAsRealTime": false
                };

                // Initialise stats
                if (!gameStatethis.stats) {
                    gameState.stats = [];
                } else {
                    for (var i = 0; i < gameState.stats.length; i++) {
                        gameState.stats[i].current = 0;
                    }
                }
                gameState.claimedAchievements = [];

                gameState.ownedItems = [];
                gameState.messages = [];

                gameState.currentEffects = [];

                gameState.selectedContract = null;
                gameState.selectedAdverturer = null;
                gameState.currentParty = [];
                gameState.adventurerList = [];

                gameState.loginTracker = [];

                gameState.version = game.versions[0].number;

            };

            this.loadFromSavedData = function(savedData) {
                log("loadFromSavedData");
                if (!savedData) {
                    this.reset();
                    return;
                }

                gameState.coins = savedData.coins;
                gameState.renown = savedData.renown;
                if (savedData.reknown !== undefined) {
                    gameState.renown = savedData.reknown;
                }

                gameState.runningExpeditions = savedData.runningExpeditions;
                gameState.completedExpeditions = savedData.completedExpeditions;

                gameState.allLocations = savedData.allLocations;
                gameState.location = savedData.location;
                gameState.LocationManager().getCurrentLocation().availableContracts = savedData.location.availableContracts;
                gameState.LocationManager().getCurrentLocation().availableAdventurers = savedData.location.availableAdventurers;
                if (gameState.LocationManager().getCurrentLocation().availableAdventurers === undefined) gameState.LocationManager().getCurrentLocation().availableAdventurers = [];

                gameState.options = savedData.options;
                if (gameState.options !== undefined && gameState.options.automatic !== undefined) {
                    {
                        gameState.automaticHire = gameState.options.automatic;
                        gameState.automaticClaim = gameState.options.automatic;
                        gameState.automaticSend = gameState.options.automatic;
                        gameState.automaticRelocate = gameState.options.automatic;
                        gameState.automaticFreeCoins = gameState.options.automatic;
                        gameState.options.automatic = undefined;
                    }
                }
                if (gameState.options === undefined) {
                    gameState.options = {
                        "claimAllButtons": false,
                        "automaticHire": false,
                        "automaticClaim": false,
                        "automaticSend": false,
                        "automaticRelocate": false,
                        "automaticFreeCoins": false,
                        "showMessageTimeAsRealTime": false
                    };
                }

                gameState.stats = savedData.stats;
                if (gameState.stats === undefined) {
                    gameState.stats = [];
                }
                gameState.claimedAchievements = savedData.claimedAchievements;
                if (gameState.claimedAchievements === undefined) {
                    gameState.claimedAchievements = [];
                }
                gameState.ownedItems = savedData.ownedItems;
                if (gameState.ownedItems === undefined) {
                    gameState.ownedItems = [];
                }
                gameState.messages = savedData.messages;
                if (gameState.messages === undefined) {
                    gameState.messages = [];
                }
                gameState.currentEffects = savedData.currentEffects;
                if (gameState.currentEffects === undefined) {
                    gameState.currentEffects = [];
                }

                gameState.selectedContract = null;
                gameState.selectedAdverturer = null;
                gameState.currentParty = [];

                gameState.adventurerList = savedData.adventurerList;
                if (gameState.adventurerList === undefined) gameState.adventurerList = [];
                gameState.availableAdventurers = savedData.availableAdventurers;
                if (gameState.availableAdventurers === undefined) gameState.availableAdventurers = [];

                gameState.loginTracker = savedData.loginTracker;

                // Begin standard version management
                if (savedData.version === undefined) {
                    if (!gameState.LocationManager().getCurrentLocation().availableContracts) gameState.LocationManager().getCurrentLocation().availableContracts = [];
                    if (!gameState.LocationManager().getCurrentLocation().availableHires) gameState.LocationManager().getCurrentLocation().availableHires = [];
                    if (!gameState.allLocations) gameState.allLocations = clone(locations);
                    if (!gameState.renown) gameState.renown = 0;
                    if (!gameState.coins) gameState.coins = 0;
                }

                gameState.version = data.game.versions[0].number;
                if (savedData.version != gameState.version) {
                    var releaseNotesButton = '<button class="btn btn-info" data-toggle="modal" data-target="#releaseNotes">Release Notes</button>';
                    var versionUpdateMessage = "Version updated from " + savedData.version + " to " + gameState.version + ". Check the " + releaseNotesButton + ".";
                    alertify.delay(10000);
                    alertify.alert("<h2>Version update!</h2><p class='text-info'>" + versionUpdateMessage + "</p>");
                }

            };

        };
    }
);