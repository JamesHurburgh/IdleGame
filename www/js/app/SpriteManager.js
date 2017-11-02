/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/DataManager"
    ],
    function SpriteManager(
        CommonFunctions,
        DataManager) {

        common = new CommonFunctions();
        data = new DataManager();

        return function SpriteManager() {

            this.getIcon = function(iconFor) {
                switch (iconFor) {
                    case "coins":
                        return "./img/icons/crown-coin.png";
                    case "renown":
                        return "./img/icons/thumb-up.png";
                    case "item":
                        return "./img/icons/swap-bag.png";
                    case "dead":
                        return "./img/icons/dead-head.png";
                    case "idle":
                        return "./img/icons/sands-of-time.png";
                    case "injured":
                        return "./img/icons/pummeled.png";
                    case "questing":
                        return "./img/icons/cowled.png";
                    case "adventurer":
                        return "./img/characters/base.png";
                    case "recovering":
                        return "./img/icons/sleepy.png";
                }
            };

        };
    }
);