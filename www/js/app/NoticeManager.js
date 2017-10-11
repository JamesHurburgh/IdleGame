/*jshint esversion: 6 */
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

            this.prepContractQueue = function() {
                var numberToPrep = Math.min(gameState.timeSinceLastLogin / 1000 / 60 / 10, 5); // Prep one every 10 minutes

                for (var i = 0; i < numberToPrep; i++) {
                    this.addContract();
                }
                gameState.AdventurerManager().prepAdventurersQueue(numberToPrep);

            };

            this.addNewContracts = function() {
                // New contracts
                var maxContracts = 5;
                if (gameState.LocationManager().getCurrentLocation().availableContracts.length < maxContracts && Math.random() < gameState.getGlobalValue("chanceOfNewContract")) {
                    this.addContract();
                }
            };

            this.addContract = function() {

                var location = gameState.LocationManager().getCurrentLocation();
                var locationContractsTypes = location.contracts;

                if (locationContractsTypes === undefined || locationContractsTypes.length === 0) { return; }

                var contractName = locationContractsTypes[Math.floor(locationContractsTypes.length * Math.random())];

                var contract = commonFunctions.clone(data.getData("contracts", contractName));
                if (contract === undefined) {
                    log("Contract '" + contractName + "' is listed for location '" + location.name + "' but has no definition.");
                    return;
                }

                contract.expires = Date.now() + Math.floor(gameState.millisecondsPerSecond * gameState.getGlobalValue("averageJobContractExpiry") * (Math.random() + 0.5));

                gameState.LocationManager().getCurrentLocation().availableContracts.push(contract);

                gameState.LocationManager().getCurrentLocation().availableContracts.sort(function(a, b) {
                    return a.expires - b.expires;
                });
                gameState.StatisticsManager().trackStat("available-contract", contract.name, 1);
                gameState.StatisticsManager().trackStat("available", "contract", 1);
            };

            this.removeExpired = function() {

                // Remove expired contracts
                var availableContracts = gameState.LocationManager().getCurrentLocation().availableContracts;
                if (availableContracts) {
                    for (var j = 0; j < availableContracts.length; j++) {
                        if (availableContracts[j].expires <= Date.now()) {
                            gameState.StatisticsManager().trackStat("miss", "contract", 1);
                            gameState.StatisticsManager().trackStat("miss-contract", availableContracts[j].name, 1);
                            if (gameState.selectedContract == availableContracts[j]) gameState.selectedContract = null;
                            availableContracts.splice(j, 1);
                        }
                    }
                }

                for (var locationIndex = 0; locationIndex < gameState.allLocations.length; locationIndex++) {
                    var location = gameState.allLocations[locationIndex];

                    // Remove expired contracts
                    if (location.availableContracts) {
                        for (var m = 0; m < location.availableContracts.length; m++) {
                            if (location.availableContracts[m].expires <= Date.now()) {
                                gameState.StatisticsManager().trackStat("miss", "contract", 1);
                                gameState.StatisticsManager().trackStat("miss-contract", location.availableContracts[m].name, 1);
                                if (gameState.selectedContract == location.availableContracts[m]) gameState.selectedContract = null;
                                location.availableContracts.splice(m, 1);

                            }
                        }
                    }
                    // Remove expired adventurers
                    if (location.availableAdventurers) {
                        for (var k = 0; k < location.availableAdventurers.length; k++) {
                            if (location.availableAdventurers[k].expires <= Date.now()) {
                                gameState.StatisticsManager().trackStat("miss", "adventurer", 1);
                                gameState.StatisticsManager().trackStat("miss-adventurer", location.availableAdventurers[k].name, 1);
                                location.availableAdventurers.splice(k, 1);
                            }
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