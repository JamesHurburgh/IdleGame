/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/DataManager",
        "app/GameState"
    ],
    function EffectsManager(
        CommonFunctions,
        DataManager,
        GameState) {

        common = new CommonFunctions();
        data = new DataManager();
        var gameState = require("app/GameState");

        return function EffectsManager() {

            this.gameState = gameState.getGameState();

            this.getCurrentEffects = function() {
                if (!this.gameState.currentEffects) {
                    this.gameState.currentEffects = [];
                }
                return this.gameState.currentEffects;
            };

            // Effect
            this.addEffect = function(name, valueModifier, expires) {
                this.getCurrentEffects().push({ "name": name, "valueModifier": valueModifier, "expires": expires });
            };


            this.removeExpired = function() {
                var currentEffects = this.getCurrentEffects();
                for (var h = 0; h < currentEffects.length; h++) {
                    var effect = currentEffects[h];
                    if (currentEffects[h].expires === undefined || currentEffects[h].expires <= Date.now()) {
                        currentEffects.splice(h, 1);
                    }
                }
            };

            // Globals
            this.getGlobalValue = function(name) {
                var global = data.game.globals.filter(global => global.name == name)[0];
                if (global === undefined) { return null; }
                var effects = this.getCurrentEffects().filter(effect => effect.affects === name);
                var value = global.baseValue;
                for (var i = 0; i < effects.length; i++) {
                    value *= effects[i].valueModifier;
                }
                return value;
            };
        };
    }
);