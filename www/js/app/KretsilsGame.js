/*jshint esversion: 6 */

define(["jquery"],
    function KretsilsGame(jquery) {

        function uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        var hireables = [{
            "name": "Kretsil",
            "plural": "Kretsils",
            "cpt": 1.1,
            "baseCost": 5,
            "costMultiplier": 1.123,
            "costExponent": 1.987
        }, {
            "name": "Advanced Kretsil",
            "plural": "Advanced Kretsils",
            "cpt": 10,
            "baseCost": 1000,
            "costMultiplier": 500,
            "costExponent": 1.123
        }, {
            "name": "Elite Kretsil",
            "plural": "Elite Kretsils",
            "cpt": 100,
            "baseCost": 10000,
            "costMultiplier": 2000,
            "costExponent": 1.543
        }];

        return function KretsilsGame(gameData, autoSaveFunction) {

            this.hireables = hireables;
            this.autoSave = autoSaveFunction;

            this.reset = function() {
                // Then initialise new
                this.calculateCounter = 0;

                this.coins = 10;
                this.coinsPerTick = 0;

                this.hired = [];
                this.actualCpts = [];
                this.numberOfKretsils = 0;
                this.numberOfAdvancedKretsils = 0;
                this.coinsPerKretsil = 1;
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
            };

            this.updateGameData = function(gameData) {
                if (!this.calculateCounter) this.calculateCounter = 0;

                if (!this.coins) this.coins = 10;
                if (!this.coinsPerTick) this.coinsPerTick = 0;

                if (!this.hired) this.hired = [];
                if (!this.actualCpts) this.actualCpts = [];

                if (!this.numberOfKretsils) this.numberOfKretsils = 0;
                if (!this.numberOfAdvancedKretsils) this.numberOfAdvancedKretsils = 0;
                if (!this.coinsPerKretsil) this.coinsPerKretsil = 1;
            };

            this.spendCoins = function(coins) {
                this.coins -= coins;
            };

            this.canHire = function(name) {
                return this.coins > this.getCost(name);
            };

            this.canHireAdvanced = function() {
                return this.coins > this.advancedKretsilCost;
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
            this.calculate();

        };
    });