define(function() {
    var instance = null;

    function GameState() {
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one GameState, use GameState.getInstance()");
        }

        this.initialize();
    }
    GameState.prototype = {
        load: function() {
            var store = require("store");
            return store.get(this.key);
        },
        save: function() {
            var store = require("store");
            store.set(this.key, this.gameState);
        },
        initialize: function() {
            this.key = "AdventurersGame";
            this.gameState = this.load();
        },
        getGameState: function() {
            if (!this.gameState) this.gameState = this.load();
            return this.gameState;
        }
    };
    GameState.getInstance = function() {
        // summary:
        //      Gets an instance of the singleton. It is better to use 
        if (instance === null) {
            instance = new GameState();
        }
        return instance;
    };

    return GameState.getInstance();
});