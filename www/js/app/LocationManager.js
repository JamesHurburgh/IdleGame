/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/DataManager"
    ],
    function LocationManager(
        CommonFunctions,
        DataManager) {

        return function LocationManager(gameState) {

            this.gameState = gameState;

            this.getJobContractsAtCurrentLocation = function() {
                return this.getJobContractsAtLocation(this.getCurrentLocation());
            };

            this.getJobContractsAtLocation = function(location) {
                if (!location.availableContracts) location.availableContracts = [];
                return location.availableContracts.length;
            };

            this.getAdventurerContractsAtCurrentLocation = function() {
                return this.getAdventurerContractsAtLocation(this.getCurrentLocation());
            };

            this.getAdventurerContractsAtLocation = function(location) {
                if (!location.availableAdventurers) location.availableAdventurers = [];
                return location.availableAdventurers.length;
            };

            this.getLocation = function(name) {
                return data.locations.filter(location => location.name == name)[0];
            };

            this.getCurrentLocation = function() {
                return gameState.location;
            };

            this.setCurrentLocation = function(name) {
                gameState.location = this.getLocation(name);
            };

            // Locations
            this.currentLocationIndex = function() {
                return data.locations.indexOf(data.locations.filter(location => location.name == gameState.location.name)[0]);
            };

            this.canRelocateDown = function() {
                return this.currentLocationIndex() > 0;
            };

            this.relocateDown = function() {
                if (this.canRelocateDown()) {
                    gameState.location = data.locations[this.currentLocationIndex() - 1];
                    if (!gameState.location.availableContracts) gameState.location.availableContracts = [];
                    if (!gameState.location.availableHires) gameState.location.availableHires = [];
                    gameState.StatisticsManager().trackStat("relocate-to", gameState.location.name, 1);
                }
            };

            this.canRelocateUp = function() {
                // This is the hard limit for now.
                if (gameState.location.disabled !== undefined && gameState.location.disabled) {
                    return false;
                }
                if (this.currentLocationIndex() == data.locations.length - 1) {
                    return false;
                }
                var newLocation = data.locations[this.currentLocationIndex() + 1];
                return newLocation.renownRequired <= gameState.renown;
            };

            this.relocateUp = function() {
                if (this.canRelocateUp()) {
                    gameState.location = common.clone(data.locations[this.currentLocationIndex() + 1]);
                    if (!gameState.location.availableContracts) gameState.location.availableContracts = [];
                    if (!gameState.location.availableHires) gameState.location.availableHires = [];
                    gameState.StatisticsManager().trackStat("relocate-to", gameState.location.name, 1);
                }
            };

        };

    }
);