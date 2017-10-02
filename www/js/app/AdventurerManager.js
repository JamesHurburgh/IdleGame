/*jshint esversion: 6 */

define(["app/CommonFunctions", "json!data/adventurers.json"],
    function AdventurerManager(CommonFunctions, adventurers) {

        commonFunctions = new CommonFunctions();
        return function AdventurerManager(gameState) {

            this.gameState = gameState;

            this.addNewAdverturersForHire = function() {
                // New hires
                var maxAvailableHires = 5;
                if (gameState.LocationManager().getCurrentLocation().availableHires.length < maxAvailableHires && Math.random() < gameState.getGlobalValue("chanceOfNewHire")) {
                    this.addAvailableHire();
                }
            };

            this.addAvailableHire = function() {
                // Choose type from location list first, then look it up.
                var location = gameState.LocationManager().getCurrentLocation();
                var locationHireableTypes = location.adventurers;

                if (locationHireableTypes === undefined || locationHireableTypes.length === 0) { return; }

                // Start function
                var weightedList = [];
                var min = 0;
                var max = 0;
                for (var i = 0; i < locationHireableTypes.length; i++) {
                    max += locationHireableTypes[i].chance;
                    weightedList.push({ item: locationHireableTypes[i], min: min, max: max });
                    min += locationHireableTypes[i].chance;
                }
                var chance = max * Math.random();
                var selection = weightedList.filter(item => item.min <= chance && item.max >= chance)[0].item;
                // End function

                var adventurerType = selection.type;

                // var adventurerType = locationHireableTypes[Math.floor(locationHireableTypes.length * Math.random())].type; // TODO take chance into account


                var hireable = commonFunctions.clone(gameState.adventurers.filter(hireable => hireable.name == adventurerType)[0]);
                hireable.expires = Date.now() + Math.floor(gameState.millisecondsPerSecond * 60 * (Math.random() + 0.5));
                gameState.LocationManager().getCurrentLocation().availableHires.push(hireable);
                gameState.LocationManager().getCurrentLocation().availableHires.sort(function(a, b) {
                    return a.expires - b.expires;
                });
                gameState.trackStat("available-adventurer", hireable.name, 1);
                gameState.trackStat("available", "adventurers", 1);
            };

        };
    }
);