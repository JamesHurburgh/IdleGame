/*jshint esversion: 6 */

define(["jquery",
        "alertify",
        "json!data/game.json",
        "json!data/contracts.json",
        "json!data/locations.json",
        "json!data/adventurers.json",
        "json!data/reknown.json",
        "json!data/achievements.json"
    ],
    function AdventurersGame(
        jquery,
        alertify,
        game,
        contracts,
        locations,
        adventurers,
        reknown,
        achievements) {

        // alertify.parent(document.getElementById("container"));
        alertify.logPosition("top left");

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

        return function AdventurersGame(saveData, autoSaveFunction) {

            this.autoSave = autoSaveFunction;
            this.millisecondsPerSecond = 1000;

            this.reset = function() {
                console.log("reset");
                // Then initialise new
                this.calculateCounter = 0;

                this.coins = 10;
                this.reknown = 0;
                this.freeCoinsTimeout = 0;

                this.hired = {};

                this.runningExpeditions = [];
                this.completedExpeditions = [];

                // Take a local copy of the locations
                this.allLocations = clone(locations);
                this.location = this.allLocations[0];

                this.location.availableContracts = [];
                this.location.availableHires = [];

                // Initilise options
                this.options = {
                    "claimAllButtons": false,
                    "automaticHire": false,
                    "automaticClaim": false,
                    "automaticSend": false,
                    "automaticRelocate": false,
                    "automaticFreeCoins": false
                };

                // Initialise stats
                if (!this.stats) {
                    this.stats = [];
                } else {
                    for (var i = 0; i < this.stats.length; i++) {
                        this.stats[i].current = 0;
                    }
                }
                this.claimedAchievements = [];
                
                this.items = [];

                // Data
                this.adventurers = adventurers;
                this.contracts = contracts;
                this.locations = locations;
                this.achievements = achievements;
                this.game = game;

                this.calculate();
            };

            this.calculate = function() {
                console.log("calculate");
                // Do all calculations here
                this.calculateCounter = 0;
                // Autosave
                this.autoSave();

                this.addNewContracts();
                this.addNewAdverturersForHire();

                this.checkAndClaimAllAchievements();
            };

            this.addNewContracts = function() {
                // New contracts
                var maxContracts = 5;
                if (this.location.availableContracts.length < maxContracts && Math.random() > 0.85) {
                    this.addContract();
                }
            };

            this.addNewAdverturersForHire = function() {
                // New hires
                var maxAvailableHires = 5;
                if (this.location.availableHires.length < maxAvailableHires && Math.random() > 0.75) {
                    this.addAvailableHire();
                }
            };

            this.loadFromSavedData = function(savedData) {
                console.log("loadFromSavedData");

                this.coins = savedData.coins;
                this.reknown = savedData.reknown;
                this.freeCoinsTimeout = savedData.freeCoinsTimeout;

                this.hired = savedData.hired;

                this.runningExpeditions = savedData.runningExpeditions;
                this.completedExpeditions = savedData.completedExpeditions;

                this.allLocations = savedData.allLocations;
                this.location = savedData.location;
                this.location.availableContracts = savedData.location.availableContracts;
                this.location.availableHires = savedData.location.availableHires;

                this.options = savedData.options;

                this.stats = savedData.stats;
                this.claimedAchievements = savedData.claimedAchievements;

                
                this.items = savedData.items;

                switch (savedData.version) {
                    default: if (!this.location.availableContracts) this.location.availableContracts = [];
                    if (!this.location.availableHires) this.location.availableHires = [];
                    if (!this.allLocations) this.allLocations = clone(locations);
                    if (!this.reknown) this.reknown = 0;
                    if (!this.coins) this.coins = 0;
                    case "0.2":
                    case "0.3":
                    case "0.4":
                        this.stats = [];
                    case "0.5":
                        this.claimedAchievements = [];
                    case "0.6":
                    case "0.7":
                        if (this.options !== undefined && this.options.automatic !== undefined) {
                            {
                                this.automaticHire = this.options.automatic;
                                this.automaticClaim = this.options.automatic;
                                this.automaticSend = this.options.automatic;
                                this.automaticRelocate = this.options.automatic;
                                this.automaticFreeCoins = this.options.automatic;
                            }
                        }
                    case "0.8":
                    this.items = [];
                        alertify.alert("New version!  Check the release notes.");
                    case "0.9":
                }

                if (!this.options) {
                    this.options = {
                        "claimAllButtons": false,
                        "automaticHire": false,
                        "automaticClaim": false,
                        "automaticSend": false,
                        "automaticRelocate": false,
                        "automaticFreeCoins": false
                    };
                }
                // Data
                this.adventurers = adventurers;
                this.contracts = contracts;
                this.locations = locations;
                this.achievements = achievements;
                this.game = game;
                this.version = game.versions[0].number;

                for (var i = 0; i < this.allLocations.length; i++) {
                    this.allLocations[i].contracts = this.locations[i].contracts;
                    this.allLocations[i].adventurers = this.locations[i].adventurers;
                }

                this.calculate();
            };

            // Achievements
            this.hasAchievement = function(achievement) {
                return this.claimedAchievements.filter(claimedAchievement => claimedAchievement.name == achievement.name).length > 0;
            };

            this.claimAchievement = function(achievement) {
                if (!this.hasAchievement(achievement.name)) {
                    this.claimedAchievements.push({ "name": achievement.name, "timeClaimed": Date.now() });
                    alertify
                        .closeLogOnClick(true)
                        .success("Got achievement:" + achievement.name + " (" + achievement.description + ")");
                }
            };

            this.canClaimAchievement = function(achievement) {
                if (this.hasAchievement(achievement)) {
                    return false;
                }
                switch (achievement.trigger.type) {
                    case "statistic":
                        var stat = this.getStat(achievement.trigger.statistic);
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
                        var stat = this.getStat(achievement.trigger.statistic);
                        if (stat) {
                            return (stat.current / achievement.trigger.statisticamount) * 100;
                        }
                }
                return 0;
            };

            // Stats
            this.getStatName = function(action, subject) {
                return (action + "-" + subject).toLowerCase().replace(/ /g, "_");
            };

            this.getStat = function(name) {
                return this.stats.filter(stat => stat.name == name)[0];
            };

            this.trackStat = function(action, subject, amount) {
                var name = this.getStatName(action, subject);
                stat = this.getStat(name);
                if (!stat) {
                    this.stats.push({ name: name, current: amount, allTime: amount });
                } else {
                    stat.current += amount;
                    stat.allTime += amount;
                }
            };

            this.filteredStats = function(filter) {
                if (!filter) {
                    return this.stats;
                }
                return this.stats.filter(stat => stat.name.indexOf(filter.toLowerCase()) !== -1);
            };

            // Options
            this.cheat = function() {
                console.log("cheat");
                this.giveCoins(100000000000);
                this.giveReknown(100000000000);

                for (var i = 0; i < adventurers.length; i++) {
                    this.hired[adventurers[i].name] += 100000;
                }
            };

            this.toggleClaimAll = function() {
                this.options.claimAllButtons = !this.options.claimAllButtons;
            };

            this.claimAllVisible = function() {
                return this.options.claimAllButtons && this.completedExpeditions.length > 0;
            };

            this.startAllVisible = function() {
                return this.options.claimAllButtons && this.location.availableContracts.length > 0;
            };

            this.hireAllVisible = function() {
                return this.options.claimAllButtons && this.location.availableHires.length > 0;
            };

            this.toggleAutomatic = function() {
                this.options.automatic = !this.options.automatic;
            };

            // Reknown
            this.reknownText = function() {
                return reknown.filter(r => r.minimum <= this.reknown && r.maximum > this.reknown)[0].name;
            };

            // Items

            // Locations
            this.currentLocationIndex = function() {
                return this.allLocations.indexOf(this.allLocations.filter(location => location.name == this.location.name)[0]);
            };

            this.canRelocateDown = function() {
                return this.currentLocationIndex() > 0;
            };

            this.relocateDown = function() {
                if (this.canRelocateDown()) {
                    this.location = this.allLocations[this.currentLocationIndex() - 1];
                    if (!this.location.availableContracts) this.location.availableContracts = [];
                    if (!this.location.availableHires) this.location.availableHires = [];
                    this.expireAllExpired();
                    this.trackStat("relocate-to", this.location.name, 1);
                }
            };

            this.canRelocateUp = function() {
                // This is the hard limit for now.
                if (this.location.disabled !== undefined && this.location.disabled) {
                    return false;
                }
                if (this.currentLocationIndex() == this.allLocations.length - 1) {
                    return false;
                }
                var newLocation = this.allLocations[this.currentLocationIndex() + 1];
                return newLocation.reknownRequired <= this.reknown;
            };

            this.relocateUp = function() {
                if (this.canRelocateUp()) {
                    this.location = this.allLocations[this.currentLocationIndex() + 1];
                    if (!this.location.availableContracts) this.location.availableContracts = [];
                    if (!this.location.availableHires) this.location.availableHires = [];
                    this.expireAllExpired();
                    this.trackStat("relocate-to", this.location.name, 1);
                }
            };

            // Coins
            this.canGetFreeCoins = function() {
                return this.freeCoinsTimeout <= 0;
            };

            this.freeCoins = function(location) {
                this.giveCoins(location.freeCoins);
                this.trackStat("click", "free-coins", 1);
                this.trackStat("collect", "free-coins", location.freeCoins);
                this.freeCoinsTimeout = location.freeCoinsTimeout;
            };

            this.spendCoins = function(coins) {
                this.coins -= coins;
                this.trackStat("spend", "coins", coins);
            };

            // Adventurers

            this.hiredAdventurers = function() {
                return adventurers.filter(hireable => this.totalAdventurers(hireable) > 0);
            };

            this.totalAdventurers = function(adventurer) {
                return this.getHiredCount(adventurer.name) + this.getAdventurersOnTheJob(adventurer.name);
            };

            this.canHire = function(name) {
                return this.coins >= this.getCost(name);
            };

            this.getHireable = function(name) {
                return adventurers.filter(hireable => hireable.name == name)[0];
            };

            this.getAllHireableAdventurers = function() {
                return this.location.availableHires.filter(adventurer => this.canHire(adventurer.name));
            };

            this.hireAll = function() {
                while (this.getAllHireableAdventurers().length > 0) {
                    this.hire(this.getAllHireableAdventurers()[0]);
                }
            };

            this.getHiredCount = function(name) {
                var hiredCount = this.hired[name];
                if (!hiredCount) hiredCount = 0;
                return hiredCount;
            };

            this.getAdventurersOnTheJob = function(name) {
                var count = 0;
                for (var i = 0; i < this.runningExpeditions.length; i++) {
                    var expeditionCount = this.runningExpeditions[i].adventurers.filter(adventurer => adventurer.type == name).length;
                    if (expeditionCount) {
                        count += expeditionCount;
                    }
                }
                return count;
            };

            this.addAvailableHire = function() {
                var locationHireables = this.adventurers.filter(hireable => this.location.adventurers.indexOf(hireable.name) >= 0);
                var hireable = clone(locationHireables[Math.floor(locationHireables.length * Math.random())]);
                hireable.expires = Date.now() + Math.floor(this.millisecondsPerSecond * 60 * (Math.random() + 0.5));
                this.location.availableHires.push(hireable);
                this.location.availableHires.sort(function(a, b) {
                    return a.expires - b.expires;
                });
                this.trackStat("available-adventurer", hireable.name, 1);
                this.trackStat("available", "adventurers", 1);
            };

            this.spendHires = function(name, amount) {
                this.hired[name] = this.hired[name] - amount;
                this.trackStat("send-adventurer", name, amount);
                this.trackStat("send", "adventurers", amount);
            };

            // Contracts
            this.addContract = function() {
                var locationContracts = contracts.filter(contract => this.location.contracts.indexOf(contract.name) >= 0);
                var contract = clone(locationContracts[Math.floor(locationContracts.length * Math.random())]);
                contract.expires = Date.now() + Math.floor(this.millisecondsPerSecond * 60 * (Math.random() + 0.5));
                this.location.availableContracts.push(contract);
                this.location.availableContracts.sort(function(a, b) {
                    return a.expires - b.expires;
                });
                this.trackStat("available-contract", contract.name, 1);
                this.trackStat("available", "contract", 1);
            };

            this.getContract = function(name) {
                return contracts.filter(contract => contract.name == name)[0];
            };

            // Expediations
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

            this.claimAllCompletedExpeditions = function() {
                while (this.completedExpeditions.length > 0) {
                    if (this.completedExpeditions[0].success) {
                        this.claimReward(this.completedExpeditions[0]);
                    } else {
                        this.removeExpedition(this.completedExpeditions[0]);
                    }
                }
            };

            this.giveCoins = function(amount) {
                this.trackStat("get", "coins", amount);
                this.coins += amount;
            };

            this.giveReknown = function(amount) {
                this.trackStat("get", "reknown", amount);
                this.reknown += amount;
            };

            this.giveReward = function(reward) {
                switch (reward.type) {
                    case "coins":
                        this.giveCoins(reward.amount);
                        break;
                    case "reknown":
                        this.giveReknown(reward.amount);
                        break;
                        case "item":
                        this.giveItem(reward.item);
                        break;
                    default:
                        this.hired[type] += amount;
                }
            };

            this.generateRewardItem = function(reward){
                return this.generateItem(reward.itemType, reward.value);
            }

            this.generateItem = function(itemType, value){
                return {"name" : "ring", "value" : value };
            };

            this.giveItem = function(item){
                this.items.push(item);
            };

            this.claimReward = function(expedition) {
                this.trackStat("claim", "reward", 1);
                if (expedition.contract.contractAmount) {
                    this.giveCoins(expedition.contract.contractAmount);
                }
                for (var i = 0; i < expedition.rewards.length; i++) {
                    this.giveReward(expedition.rewards[i]);
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

            this.expeditionProgress = function(expedition) {
                return 100 * ((Date.now() - expedition.start) / (expedition.expires - expedition.start));
            };

            this.getStartableContracts = function() {
                return this.location.availableContracts.filter(contract => this.canSendExpedition(contract));
            };

            this.startAllContracts = function() {
                while (this.getStartableContracts().length > 0) {
                    this.sendExpedition(this.getStartableContracts()[0]);
                }
            };

            this.sendExpedition = function(contract) {
                if (!this.canSendExpedition(contract)) {
                    return;
                }

                this.trackStat("send", "expedition", 1);
                this.trackStat("send-expedition", contract.name, 1);

                var expedition = {
                    id: uuidv4(),
                    contract: contract,
                    start: Date.now(),
                    expires: Date.now() + (contract.duration * this.millisecondsPerSecond),
                    adventurers: []
                };

                if (contract.requirements.adventurers) {
                    for (var i = 0; i < contract.requirements.adventurers.length; i++) {
                        this.spendHires(contract.requirements.adventurers[i].type, contract.requirements.adventurers[i].amount);
                        for (var j = 0; j < contract.requirements.adventurers[i].amount; j++) {
                            expedition.adventurers.push({ "type": contract.requirements.adventurers[i].type });
                        }
                    }
                }

                this.runningExpeditions.push(expedition);

                this.runningExpeditions.sort(function(a, b) {
                    return a.expires - b.expires;
                });

                this.location.availableContracts.splice(this.location.availableContracts.indexOf(contract), 1);
            };

            this.completeExpedition = function(expedition) {
                this.runningExpeditions.splice(this.runningExpeditions.indexOf(expedition), 1);

                var contract = expedition.contract;

                this.trackStat("complete", "expedition", 1);
                this.trackStat("complete-expedition", contract.name, 1);

                // Return questers to sendable pool
                expedition.upgradeMessages = "";
                expedition.awol = false;
                var survived = 0;

                if (expedition.adventurers) {
                    for (var i = 0; i < expedition.adventurers.length; i++) {
                        var adventurerType = expedition.adventurers[i].type;
                        var upgrade = this.getUpgrade(adventurerType);

                        if (Math.random() < contract.risk) { // Then someone 'died'
                            expedition.adventurers[i].awol = true;
                            expedition.awol = true;
                            this.trackStat("death", "adventurer", 1);
                            this.trackStat("death-adventurer", adventurerType, 1);
                        } else if (upgrade && Math.random() < contract.upgradeChance) { // Then someone 'upgraded'
                            expedition.adventurers[i].upgradedTo = upgrade;
                            this.hired[upgrade]++;
                            survived++;
                            this.trackStat("upgrade", "adventurer", 1);
                            this.trackStat("upgrade-adventurer", adventurerType, 1);
                            this.trackStat("upgrade-adventurer-to", upgrade, 1);
                        } else {
                            this.hired[adventurerType]++;
                            survived++;
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
                            var reward = contract.rewards[i].reward;
                            if(reward.type == "item"){
                                expedition.rewards.push({ "type": reward.type, "item": this.generateRewardItem(reward) });
                            }else{
                                var rewardAmount = Math.floor(reward.amount * variation);
                                if (rewardAmount > 0) {
                                    expedition.rewards.push({ "type": reward.type, "amount": rewardAmount });
                                }
                            }
                        }
                    }
                    this.trackStat("succeed", "expedition", 1);
                    this.trackStat("succeed-expedition", contract.name, 1);
                } else {
                    expedition.completionMessage = contract.failureMessage;
                    this.trackStat("fail", "expedition", 1);
                    this.trackStat("fail-expedition", contract.name, 1);
                }

                this.completedExpeditions.push(expedition);
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

                this.trackStat("hire", "adventurer", 1);
                this.trackStat("hire-adventurer", hireable.name, 1);
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

            this.expireAllExpired = function() {

                // Check for completed expeditions
                for (var i = 0; i < this.runningExpeditions.length; i++) {
                    if (this.runningExpeditions[i].expires <= Date.now()) {
                        this.completeExpedition(this.runningExpeditions[i]);
                    }
                }
                // Remove expired contracts
                if (this.location.availableContracts) {
                    for (var j = 0; j < this.location.availableContracts.length; j++) {
                        if (this.location.availableContracts[j].expires <= Date.now()) {
                            this.trackStat("miss", "contract", 1);
                            this.trackStat("miss-contract", this.location.availableContracts[j].name, 1);
                            this.location.availableContracts.splice(j, 1);
                        }
                    }
                }

                // Remove expired hired
                if (this.location.availableHires) {
                    for (var k = 0; k < this.location.availableHires.length; k++) {
                        if (this.location.availableHires[k].expires <= Date.now()) {
                            this.trackStat("miss", "adventurer", 1);
                            this.trackStat("miss-adventurer", this.location.availableHires[k].name, 1);
                            this.location.availableHires.splice(k, 1);
                        }
                    }
                }

                for (var locationIndex = 0; locationIndex < this.allLocations.length; locationIndex++) {
                    var location = this.allLocations[locationIndex];

                    // Remove expired contracts
                    if (location.availableContracts) {
                        for (var j = 0; j < location.availableContracts.length; j++) {
                            if (location.availableContracts[j].expires <= Date.now()) {
                                this.trackStat("miss", "contract", 1);
                                this.trackStat("miss-contract", location.availableContracts[j].name, 1);
                                location.availableContracts.splice(j, 1);

                            }
                        }
                    }

                    // Remove expired hired
                    if (location.availableHires) {
                        for (var k = 0; k < location.availableHires.length; k++) {
                            if (location.availableHires[k].expires <= Date.now()) {
                                this.trackStat("miss", "adventurer", 1);
                                this.trackStat("miss-adventurer", location.availableHires[k].name, 1);
                                location.availableHires.splice(k, 1);
                            }
                        }
                    }
                }
            };

            this.lessthan = function(a, b) {
                return a < b;
            };

            this.tick = function() {
                this.freeCoinsTimeout--;

                this.expireAllExpired();

                this.calculateCounter++;
                if (this.calculateCounter > 10) {
                    this.calculate();

                    if (this.options.automaticRelocate) {
                        if (this.canRelocateUp()) {
                            this.relocateUp();
                        }
                    }
                    if (this.options.automaticFreeCoins) {
                        if (this.canGetFreeCoins()) {
                            this.freeCoins(this.location);
                        }
                    }
                    if (this.options.automaticClaim) {
                        this.claimAllCompletedExpeditions();
                    }
                    if (this.options.automaticHire) {
                        this.hireAll();
                    }
                    if (this.options.automaticSend) {
                        this.startAllContracts();
                    }
                }
            };


            console.log("initialising");

            if (!saveData) {
                this.reset();
            } else {
                this.loadFromSavedData(saveData);
            }

        };
    });