requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        models: '../app/models'
    }
});

// Start the main app logic.
requirejs(['jquery', 'vue', 'alertify', 'store', 'chance', 'app/KretsilsGame'],
    function($, Vue, alertify, store, chance, KretsilsGame) {

        function uuidv4() {
            return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            );
        }

        function save(){
            store.set("KretsilsGame", controller._data);
        }

        var kretsilsGame = new KretsilsGame(store.get("KretsilsGame"), save);

        var gameDifficulty = 3; // 100 is normal

        //var idleGame = new Vue({
        var controller = new Vue({
            el: '#kretsilsGame',
            data: kretsilsGame,
            computed: {
                canHire: function(){
                    return kretsilsGame.canHire();
                }
            },
            methods: {
                reset: function(){
                    kretsilsGame.reset();
                },
                hire: function(){
                    kretsilsGame.hire();
                }
            }
        });

        function tick() {
            kretsilsGame.tick();
            //store.set("idleGameData", idleGameData);
            setTimeout(tick, 100);
        }

        // boot up the first call
        tick();


    });