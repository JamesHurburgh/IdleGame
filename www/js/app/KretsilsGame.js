define([],
    function KretsilsGame() {

        function uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        return function KretsilsGame(gameData, autoSaveFunction) {
            this.autoSave = autoSaveFunction;
            this.reset = function(){
                // Then initialise new
                this.calculateCounter = 0;

                this.coins = 10;
                this.coinsPerTick = 0;
                
                this.numberOfKretsils = 0;
                this.coinsPerKretsil = 1;
            };

            if(!gameData){
                this.reset();
            }else{
                // Copy data
                this.calculateCounter = gameData.calculateCounter;
                
                this.coins = gameData.coins;
                this.coinsPerTick = gameData.coinsPerTick;
                
                this.numberOfKretsils = gameData.numberOfKretsils;
                this.coinsPerKretsil = gameData.coinsPerKretsil;
            }


            this.calculate = function(){
                // Do all calculations here
                this.calculateCounter = 0;
                console.log("calculating");
                // Autosave
                this.autoSave();

                this.coinsPerTick = this.coinsPerKretsil * this.numberOfKretsils;
            };

            this.spendCoins = function(coins){
                this.coins -= coins;
            };

            this.canHire = function(){
                return this.coins > 5;
            };

            this.hire = function(){
                this.spendCoins(5);
                this.numberOfKretsils++;
                this.calculate();
            };

            this.tick = function(){
                // Do all task completion here

                this.coins += this.coinsPerTick;

                this.calculateCounter++;
                if(this.calculateCounter > 10){
                    this.calculate();
                }
            };

        };
    });