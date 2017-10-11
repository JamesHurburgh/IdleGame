/*jshint esversion: 6 */

/*

1. Rename file and EffectsManager to Manager name.
2. Paste the following into AdventureGame:

            _EffectsManager = new EffectsManager(this);
            this.EffectsManager = function() {
                return _EffectsManager;
            };
3. Delete this comment block.

*/

define([
        "app/CommonFunctions",
        "app/DataManager"
    ],
    function EffectsManager(
        CommonFunctions,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();
        return function EffectsManager(gameState) {

            this.gameState = gameState;

            // Effect
            this.addEffect = function(name, valueModifier, expires) {
                gameState.currentEffects.push({ "name": name, "valueModifier": valueModifier, "expires": expires });
            };

            this.removeExpired = function() {
                for (var h = 0; h < gameState.currentEffects.length; h++) {
                    var effect = gameState.currentEffects[h];
                    if (gameState.currentEffects[h].expires === undefined || gameState.currentEffects[h].expires <= Date.now()) {
                        gameState.currentEffects.splice(h, 1);
                    }
                }
            };

            // Globals
            this.getGlobalValue = function(name) {
                var global = data.game.globals.filter(global => global.name == name)[0];
                if (global === undefined) { return null; }
                var effects = gameState.currentEffects.filter(effect => effect.affects === name);
                var value = global.baseValue;
                for (var i = 0; i < effects.length; i++) {
                    value *= effects[i].valueModifier;
                }
                return value;
            };
        };
    }
);