/*jshint esversion: 6 */

define(["jquery"],
    function AdventurersGame(jquery) {

        function uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        var hireables = [{
            "name": "Drunkard",
            "plural": "Drunkards",
            "cpt": 0.1,
            "baseCost": 1,
            "costMultiplier": 1.5,
            "costExponent": 1.5
        }, {
            "name": "Street rat",
            "plural": "Street rats",
            "cpt": 0.2,
            "baseCost": 2,
            "costMultiplier": 5,
            "costExponent": 1.5
        }, {
            "name": "Greenthumb",
            "plural": "Greenthumbs",
            "cpt": 0.5,
            "baseCost": 10,
            "costMultiplier": 5,
            "costExponent": 1.5
        }, {
            "name": "Adventurer",
            "plural": "Adventurers",
            "cpt": 1,
            "baseCost": 100,
            "costMultiplier": 5,
            "costExponent": 1.5
        }, {
            "name": "Seasoned veteran",
            "plural": "Seasoned veterans",
            "cpt": 5,
            "baseCost": 1000,
            "costMultiplier": 5,
            "costExponent": 1.5
        }];


        var expeditionTypes = [{
            "name": "Rob some graves",
            "reward": "50",
            "hireables": {
                "Drunkard": "1"
            }
        }];

        return function AdventurersGame(gameData, autoSaveFunction) {

            this.autoSave = autoSaveFunction;

            this.reset = function() {
                // Then initialise new
                this.calculateCounter = 0;

                this.coins = 10;
                this.coinsPerTick = 0;

                this.hired = {};
                this.actualCpts = [];

                this.expedition = false;
                this.expeditionProgress = 0;

                this.numberOfAdventurers = 0;
                this.numberOfAdvancedAdventurers = 0;
                this.coinsPerAdventurer = 1;
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

                for (var i = 0; i < hireables.length; i++) {
                    this.coinsPerTick += this.getCPT(hireables[i].name);
                }

                // Expedition Progress
                this.expeditionProgressPerTick = 0;
                if (this.expedition) {
                    this.expeditionProgressPerTick += 1;
                }
            };

            this.updateGameData = function(gameData) {
                if (!this.calculateCounter) this.calculateCounter = 0;

                if (!this.coins) this.coins = 10;
                if (!this.coinsPerTick) this.coinsPerTick = 0;

                if (!this.hired) this.hired = {};

                if (!this.expedition) this.expedition = false;
                if (!this.expeditionProgress) this.expeditionProgress = 0;

                if (!this.numberOfAdventurers) this.numberOfAdventurers = 0;
                if (!this.numberOfAdvancedAdventurers) this.numberOfAdvancedAdventurers = 0;
                if (!this.coinsPerAdventurer) this.coinsPerAdventurer = 1;
            };

            this.spendCoins = function(coins) {
                this.coins -= coins;
            };

            this.canHire = function(name) {
                return this.coins > this.getCost(name);
            };

            this.canHireAdvanced = function() {
                return this.coins > this.advancedAdventurerCost;
            };

            this.getHireable = function(name) {
                return hireables.filter(hireable => hireable.name == name)[0];
            };

            this.getHiredCount = function(name) {
                var hiredCount = this.hired[name];
                if (!hiredCount) hiredCount = 0;
                return hiredCount;
            };

            this.getTotalCPT = function() {

            };

            this.canSendExpedition = function() {
                return !this.expedition && this.getHiredCount("Adventurer") >= 10;
            };

            this.spendHires = function(name, amount) {
                this.hired[name] = this.hired[name] - amount;
                this.calculate();
            };

            this.sendExpedition = function() {
                this.expedition = true;
                this.expeditionProgress = 0;
                this.spendHires("Adventurer", 10);
            };

            this.completeExpedition = function() {
                this.expedition = false;
                this.expeditionProgress = 0;
                this.coins += 5000;
                this.calculate();
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

            this.hire = function(name) {
                var hiredCount = this.getHiredCount(name);

                this.spendCoins(this.getCost(name));
                this.hired[name] = hiredCount + 1;

                this.calculate();
            };

            this.tick = function() {
                // Do all task completion here

                this.coins += this.coinsPerTick;

                this.expeditionProgress += this.expeditionProgressPerTick;
                if (this.expeditionProgress >= 100) {
                    this.completeExpedition();
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


            this.hireables = hireables;
            this.expeditionTypes = expeditionTypes;

            this.calculate();

        };
    });