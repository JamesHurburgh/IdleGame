/*jshint esversion: 6 */
define([
        "app/CommonFunctions",
        "app/GameState",
        "app/DataManager"
    ],
    function NoticeManager(
        CommonFunctions,
        GameState,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        var gameState = require("app/GameState");

        var AdventurerManager = require("app/AdventurerManager");
        var adventurerManager = new AdventurerManager();
        var LocationManager = require("app/LocationManager");
        var locationManager = new LocationManager();
        var EffectsManager = require("app/EffectsManager");
        var effectsManager = new EffectsManager();
        var QuestManager = require("app/QuestManager");
        var questManager = new QuestManager();
        var StatisticsManager = require("app/StatisticsManager");
        var statisticsManager = new StatisticsManager();

        return function NoticeManager() {

            this.gameState = gameState.getGameState();

            this.viewContract = function(contract) {
                this.gameState.selectedContract = contract;
            };

            this.getSelectedJobNotice = function() {
                return this.gameState.selectedContract;
            };

            this.prepContractQueue = function() {
                var numberToPrep = Math.min(this.gameState.timeSinceLastLogin / 1000 / 60 / 10, 5); // Prep one every 10 minutes

                for (var i = 0; i < numberToPrep; i++) {
                    this.addContract();
                }
                adventurerManager.prepAdventurersQueue(numberToPrep);

            };

            // TODO make this more generic
            this.getJobNoticesAtLocation = function(location) {
                if (!location.availableContracts) location.availableContracts = [];
                return location.availableContracts;
            };

            this.addNewContracts = function() {
                // New contracts
                var maxContracts = 5;
                var noticesAtCurrentLocation = this.getJobNoticesAtLocation(locationManager.getCurrentLocation());
                if (noticesAtCurrentLocation.length < maxContracts && Math.random() < effectsManager.getGlobalValue("chanceOfNewContract")) {
                    this.addContract();
                }
            };

            this.addContract = function() {

                var location = locationManager.getCurrentLocation();
                var locationContractsTypes = location.contracts;

                if (locationContractsTypes === undefined || locationContractsTypes.length === 0) { return; }

                var contractName = locationContractsTypes[Math.floor(locationContractsTypes.length * Math.random())];

                var contract = commonFunctions.clone(data.getData("contracts", contractName));
                if (contract === undefined) {
                    log("Contract '" + contractName + "' is listed for location '" + location.name + "' but has no definition.");
                    return;
                }

                contract.expires = Date.now() + Math.floor(1000 * effectsManager.getGlobalValue("averageJobContractExpiry") * (Math.random() + 0.5));
                if (!contract.requirements) contract.requirements = {};
                contract.requirements.attributes = questManager.getSuggestedSkills(contract);

                locationManager.getCurrentLocation().availableContracts.push(contract);

                locationManager.getCurrentLocation().availableContracts.sort(function(a, b) {
                    return a.expires - b.expires;
                });
                statisticsManager.trackStat("available-contract", contract.name, 1);
                statisticsManager.trackStat("available", "contract", 1);
            };

            this.removeExpired = function() {

                var currentLocation = locationManager.getCurrentLocation();
                this.removeExpiredNoticesAtLocation(currentLocation);

                var allLocations = locationManager.getLocationList;

                for (var locationIndex = 0; locationIndex < allLocations; locationIndex++) {
                    var location = allLocations[locationIndex];
                    this.removeExpiredNoticesAtLocation(location);
                }
            };

            this.removeExpiredNoticesAtLocation = function(location) {

                // Remove expired contracts
                if (location.availableContracts) {
                    for (var m = 0; m < location.availableContracts.length; m++) {
                        var contract = location.availableContracts[m];
                        if (!contract.expires || contract.expires <= Date.now()) {
                            statisticsManager.trackStat("miss", "contract", 1);
                            statisticsManager.trackStat("miss-contract", location.availableContracts[m].name, 1);
                            if (this.gameState.selectedContract == location.availableContracts[m]) this.gameState.selectedContract = null;
                            location.availableContracts.splice(m, 1);

                        }
                    }
                }
                // Remove expired adventurers
                if (location.availableAdventurers) {
                    for (var k = 0; k < location.availableAdventurers.length; k++) {
                        var adventurerNotice = location.availableAdventurers[k];
                        if (!adventurerNotice.expires || adventurerNotice.expires <= Date.now()) {
                            statisticsManager.trackStat("miss", "adventurer", 1);
                            statisticsManager.trackStat("miss-adventurer", location.availableAdventurers[k].name, 1);
                            location.availableAdventurers.splice(k, 1);
                        }
                    }
                }
            };

            this.expiringSoon = function(date) {
                return date - Date.now() <= 5000;
            };

            this.expiringDanger = function(date) {
                return date - Date.now() <= 5000;
            };

            this.expiringWarning = function(date) {
                return !this.expiringDanger(date) && date - Date.now() <= 15000;
            };

            this.expiringSuccess = function(date) {
                return !this.expiringDanger(date) && !this.expiringWarning(date);
            };
        };
    }
);