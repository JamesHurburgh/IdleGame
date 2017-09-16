/*jshint esversion: 6 */

define(["jquery", "json!data/contracts.json", "json!data/locations.json", "json!data/adventurers.json"],
    function AdventurersGame(jquery, contracts, locations, adventurers) {

        function uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        function clone(object) {
            try {
                return JSON.parse(JSON.stringify(object));
            } catch (exception) {
                console.log("Unable to parse object: " + JSON.stringify(object));
            }
        }

        return function AdventurersGame(gameData, autoSaveFunction) {

            this.autoSave = autoSaveFunction;

            this.reset = function() {
                // Then initialise new
                this.calculateCounter = 0;

                this.coins = 10;
                this.coinsPerTick = 0;
                this.reknown = 0;
                this.freeCoinsTimeout = 0;

                this.hired = {};
                this.actualCpts = [];

                this.runningExpeditions = [];
                this.completedExpeditions = [];

                this.allLocations = clone(locations);
                this.location = this.allLocations[0];

                this.location.availableContracts = [];
                this.location.availableHires = [];

                // Data
                this.adventurers = adventurers;
                this.contracts = contracts;
                this.locations = locations;

                this.calculate();
            };

            this.calculate = function() {
                // Do all calculations here
                this.calculateCounter = 0;
                console.log("calculating");
                // Autosave
                this.autoSave();

                // Resource Gathering
                this.coinsPerTick = 0;

                for (var i = 0; i < adventurers.length; i++) {
                    this.coinsPerTick += this.getCPT(adventurers[i].name);
                }

                // Expedition Progress
                this.expeditionProgressPerTick = 0;
                if (this.expedition) {
                    this.expeditionProgressPerTick += 1;
                }

                // New contracts
                var maxContracts = 5;
                if (this.location.availableContracts.length < maxContracts && Math.random() > 0.85) {
                    this.addContract();
                }

                var maxAvailableHires = 5;
                // New hires
                if (this.location.availableHires.length < maxAvailableHires && Math.random() > 0.75) {
                    this.addAvailableHire();
                }


            };

            this.updateGameData = function(gameData) {
                if (!this.calculateCounter) this.calculateCounter = 0;

                if (!this.coins) this.coins = 10;
                if (!this.coinsPerTick) this.coinsPerTick = 0;
                if (!this.reknown) this.reknown = 0;
                if (!this.freeCoinsTimeout) this.freeCoinsTimeout = 0;

                if (!this.hired) this.hired = {};

                if (!this.runningExpeditions) this.runningExpeditions = [];
                if (!this.completedExpeditions) this.completedExpeditions = [];

                if (!this.allLocations) this.allLocations = clone(locations);
                if (!this.location) this.location = this.allLocations[0];

                if (!this.location.availableContracts) this.location.availableContracts = [];
                if (!this.location.availableHires) this.location.availableHires = [];

                // Data
                this.adventurers = adventurers;
                this.contracts = contracts;
                this.locations = locations;
            };

            // Locations
            this.currentLocationIndex = function() {
                return this.allLocations.indexOf(this.allLocations.filter(location => location.name == this.location.name)[0]);
            };

            this.canRelocateDown = function() {
                return this.allLocations.indexOf(this.allLocations.filter(location => location.name == this.location.name)[0]) > 0;
            };

            this.relocateDown = function() {
                if (this.canRelocateDown()) {
                    this.location = this.allLocations[this.allLocations.indexOf(this.allLocations.filter(location => location.name == this.location.name)[0]) - 1];
                    if (!this.location.availableContracts) this.location.availableContracts = [];
                    if (!this.location.availableHires) this.location.availableHires = [];
                }
            };

            this.canRelocateUp = function() {
                var newLocation = this.allLocations[this.allLocations.indexOf(this.allLocations.filter(location => location.name == this.location.name)[0]) + 1];
                return newLocation.reknownRequired <= this.reknown;
            };

            this.relocateUp = function() {
                if (this.canRelocateUp()) {
                    this.location = this.allLocations[this.allLocations.indexOf(this.allLocations.filter(location => location.name == this.location.name)[0]) + 1];
                    if (!this.location.availableContracts) this.location.availableContracts = [];
                    if (!this.location.availableHires) this.location.availableHires = [];
                }
            };

            // Coins
            this.canGetFreeCoins = function() {
                return this.freeCoinsTimeout <= 0;
            };

            this.freeCoins = function(location) {
                this.giveCoins(location.freeCoins);
                this.freeCoinsTimeout = location.freeCoinsTimeout;
            };

            this.spendCoins = function(coins) {
                this.coins -= coins;
            };

            this.canHire = function(name) {
                return this.coins >= this.getCost(name);
            };

            this.getHireable = function(name) {
                return adventurers.filter(hireable => hireable.name == name)[0];
            };

            this.getHiredCount = function(name) {
                var hiredCount = this.hired[name];
                if (!hiredCount) hiredCount = 0;
                return hiredCount;
            };

            this.getAdventurersOnTheJob = function(name) {
                var count = 0;
                for (var i = 0; i < this.runningExpeditions.length; i++) {
                    var expeditionCount = this.runningExpeditions[i].adventurers.filter(adventurerCount => adventurerCount.type == name)[0];
                    if (expeditionCount) {
                        count += expeditionCount.amount;
                    }
                }
                return count;
            };

            this.addAvailableHire = function() {
                var locationHireables = this.adventurers.filter(hireable => this.location.adventurers.indexOf(hireable.name) >= 0);
                var hireable = clone(locationHireables[Math.floor(locationHireables.length * Math.random())]);
                hireable.expires = Date.now() + Math.floor(60000 * (Math.random() + 0.5));
                this.location.availableHires.push(hireable);
                this.location.availableHires.sort(function(a, b) {
                    return a.expires > b.expires;
                });
            };

            this.spendHires = function(name, amount) {
                this.hired[name] = this.hired[name] - amount;
                this.calculate();
            };

            this.addContract = function() {
                var locationContracts = contracts.filter(contract => this.location.contracts.indexOf(contract.name) >= 0);
                var contract = clone(locationContracts[Math.floor(locationContracts.length * Math.random())]);
                contract.expires = Date.now() + Math.floor(60000 * (Math.random() + 0.5));
                this.location.availableContracts.push(contract);
                this.location.availableContracts.sort(function(a, b) {
                    return a.expires > b.expires;
                });
            };

            this.getContract = function(name) {
                return contracts.filter(contract => contract.name == name)[0];
            };

            this.canSendExpedition = function(contract) {
                if (contract.requirements.adventurers) {
                    for (var i = 0; i < contract.requirements.adventurers.length; i++) {
                        if (contract.requirements.adventurers[i].amount > this.getHiredCount(contract.requirements.adventurers[i].type)) {
                            return false;
                        }
                    }
                }
                return this.reknown >= contract.requirements.reknown;
            };

            this.sendExpedition = function(contract) {
                if (!this.canSendExpedition(contract)) {
                    return;
                }

                var expedition = {
                    id: uuidv4(),
                    contract: contract,
                    expires: Date.now() + (contract.duration * 1000),
                    adventurers: []
                };

                if (contract.requirements.adventurers) {
                    for (var i = 0; i < contract.requirements.adventurers.length; i++) {
                        this.spendHires(contract.requirements.adventurers[i].type, contract.requirements.adventurers[i].amount);
                        expedition.adventurers.push({ type: contract.requirements.adventurers[i].type, amount: contract.requirements.adventurers[i].amount });
                    }
                }

                this.runningExpeditions.push(expedition);

                this.runningExpeditions.sort(function(a, b) {
                    return a.expires > b.expires;
                });

                this.location.availableContracts.splice(this.location.availableContracts.indexOf(contract), 1);
            };

            this.giveCoins = function(amount) {
                this.coins += amount;
            };

            this.giveReknown = function(amount) {
                this.reknown += amount;
            };

            this.giveReward = function(type, amount) {
                switch (type) {
                    case "coins":
                        this.giveCoins(amount);
                        break;
                    case "reknown":
                        this.giveReknown(amount);
                        break;
                    default:
                        this.hired[type] += amount;
                }
            };

            this.claimReward = function(expedition) {
                if (expedition.contract.contractAmount) {
                    this.giveCoins(expedition.contract.contractAmount);
                }
                for (var i = 0; i < expedition.rewards.length; i++) {
                    this.giveReward(expedition.rewards[i].type, expedition.rewards[i].amount);
                }
                this.removeExpedition(expedition);
            };

            this.removeExpedition = function(expedition) {
                this.completedExpeditions.splice(this.completedExpeditions.indexOf(expedition), 1);
            };

            this.getUpgrade = function(adventurerType) {
                var becomesList = this.getHireable(adventurerType).becomes;
                if (becomesList.length === 0) {
                    return null;
                }
                return becomesList[Math.floor(Math.random() * becomesList.length)];
            };

            this.completeExpedition = function(expedition) {
                this.runningExpeditions.splice(this.runningExpeditions.indexOf(expedition), 1);

                var contract = expedition.contract;
                // Return questers to sendable pool
                var deathMessages = "";
                expedition.upgradeMessages = "";
                var survived = 0;

                if (contract.requirements.adventurers) {
                    for (var i = 0; i < contract.requirements.adventurers.length; i++) {
                        for (var j = 0; j < contract.requirements.adventurers[i].amount; j++) {
                            var upgrade = this.getUpgrade(contract.requirements.adventurers[i].type);
                            if (Math.random() < contract.risk) { // Then someone 'died'
                                deathMessages += contract.requirements.adventurers[i].type + "-" + j + " didn't come back. ";
                            } else if (upgrade && Math.random() < contract.upgradeChance) { // Then someone 'upgraded'
                                expedition.upgradeMessages += contract.requirements.adventurers[i].type + "-" + j + " has become a " + upgrade + ". ";
                                this.hired[upgrade]++;
                                survived++;
                            } else {
                                this.hired[contract.requirements.adventurers[i].type]++;
                                survived++;
                            }
                        }
                    }
                }
                expedition.completionMessage = "";

                // Calculate success
                expedition.success = survived > 0 && Math.random() < contract.successChance;
                if (expedition.success) {
                    expedition.completionMessage = contract.successMessage;

                    expedition.rewards = [];
                    for (var i = 0; i < contract.rewards.length; i++) {
                        var chance = contract.rewards[i].chance;
                        if (Math.random() < chance) {
                            var variation = Math.random() + 0.5;
                            var reward = contract.rewards[i].reward
                            var rewardAmount = Math.floor(reward.amount * variation);
                            if (rewardAmount > 0) {
                                expedition.rewards.push({ "type": reward.type, "amount": rewardAmount });
                            }
                        }
                    }
                } else {
                    expedition.completionMessage = contract.failureMessage;
                }
                if (deathMessages.length > 0) {
                    expedition.deathMessage = contract.deathMessage;
                }
                expedition.deathMessages = deathMessages;

                this.completedExpeditions.push(expedition);
            };

            this.getCPT = function(name) {
                var hireable = this.getHireable(name);
                var hiredCount = this.getHiredCount(name);
                return Math.floor(hiredCount * hireable.cpt);
            };

            this.getCost = function(name) {
                var hiredCount = this.getHiredCount(name);
                var hireable = this.getHireable(name);
                return Math.floor(hireable.baseCost + hireable.costMultiplier * hiredCount + Math.pow(hireable.costExponent, hiredCount));
            };

            this.hire = function(hireable) {
                if (!this.canHire(hireable.name)) {
                    return;
                }
                var hiredCount = this.getHiredCount(hireable.name);

                this.spendCoins(this.getCost(hireable.name));
                this.hired[hireable.name] = hiredCount + 1;

                this.location.availableHires.splice(this.location.availableHires.indexOf(hireable), 1);

                this.calculate();
            };

            this.readableTime = function(milliseconds) {

                var totalSeconds = Math.floor(milliseconds / 1000);
                var seconds = totalSeconds % 60;
                var totalMinutes = (totalSeconds - seconds) / 60;
                var minutes = totalMinutes % 60;
                var hours = (totalSeconds - (seconds + minutes * 60)) % 60;

                var timeString = "";
                if (hours) {
                    timeString += hours + "hr ";
                }
                if (minutes) {
                    timeString += minutes + "m ";
                }
                if (seconds) {
                    timeString += seconds + "s";
                }

                if (timeString.length === 0) {
                    timeString = "0s";
                }
                return timeString;
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

            this.lessthan = function(a, b) {
                return a < b;
            };

            this.tick = function() {
                // Do all task completion here

                this.coins += this.coinsPerTick;
                this.freeCoinsTimeout--;

                // Check for completed expeditions
                for (var i = 0; i < this.runningExpeditions.length; i++) {
                    if (this.runningExpeditions[i].expires <= Date.now()) {
                        this.completeExpedition(this.runningExpeditions[i]);
                    }
                }

                // Remove expired contracts
                for (var j = 0; j < this.location.availableContracts.length; j++) {
                    if (this.location.availableContracts[j].expires <= Date.now()) {
                        this.location.availableContracts.splice(j, 1);
                    }
                }
                // Remove expired hired
                for (var k = 0; k < this.location.availableHires.length; k++) {
                    if (this.location.availableHires[k].expires <= Date.now()) {
                        this.location.availableHires.splice(k, 1);
                    }
                }


                this.calculateCounter++;
                if (this.calculateCounter > 10) {
                    this.calculate();
                }
            };

            if (!gameData) {
                this.reset();
            }
            this.updateGameData(gameData);
            $.extend(this, gameData);

            // Data
            this.adventurers = adventurers;
            this.contracts = contracts;
            this.locations = locations;
            this.calculate();

        };
    });