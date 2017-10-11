/*jshint esversion: 6 */

define(["jquery",
        "app/CommonFunctions",
        "alertify",
        "json!data/game.json",
        "json!data/settings.json",
        "app/PlayerManager",
        "app/ItemManager",
        "app/LocationManager",
        "app/AdventurerManager",
        "app/AchievementManager",
        "app/QuestManager",
        "app/MessageManager",
        "app/SessionManager",
        "app/DataManager",
        "app/TimeManager",
        "app/StatisticsManager",
        "app/OptionsManager",
        "app/NoticeManager",
        "app/EffectsManager",
        "json!data/calendar.json",
        "json!data/contracts.json",
        "json!data/locations.json",
        "json!data/adventurers.json",
        "json!data/achievements.json"
    ],
    function AdventurersGame(
        jquery,
        CommonFunctions,
        alertify,
        game,
        settings,
        PlayerManager,
        ItemManager,
        LocationManager,
        AdventurerManager,
        AchievementManager,
        QuestManager,
        MessageManager,
        SessionManager,
        DataManager,
        TimeManager,
        StatisticsManager,
        OptionsManager,
        NoticeManager,
        EffectsManager,
        calendar,
        contracts,
        locations,
        adventurers,
        achievements) {

        commonFunctions = new CommonFunctions();

        return function AdventurersGame(saveData, autoSaveFunction, logFunction) {

            log = logFunction;
            this.autoSave = autoSaveFunction;
            this.millisecondsPerSecond = 1000;

            _itemManager = new ItemManager(this);
            this.ItemManager = function() {
                return _itemManager;
            };
            _locationManager = new LocationManager(this);
            this.LocationManager = function() {
                return _locationManager;
            };

            _AdventurerManager = new AdventurerManager(this);
            this.AdventurerManager = function() {
                return _AdventurerManager;
            };

            _QuestManager = new QuestManager(this);
            this.QuestManager = function() {
                return _QuestManager;
            };

            _MessageManager = new MessageManager(this);
            this.MessageManager = function() {
                return _MessageManager;
            };

            _AchievementManager = new AchievementManager(this);
            this.AchievementManager = function() {
                return _AchievementManager;
            };

            _DataManager = new DataManager(this);
            this.DataManager = function() {
                return _DataManager;
            };

            _TimeManager = new TimeManager(this);
            this.TimeManager = function() {
                return _TimeManager;
            };

            _SessionManager = new SessionManager(this);
            this.SessionManager = function() {
                return _SessionManager;
            };

            _StatisticsManager = new StatisticsManager(this);
            this.StatisticsManager = function() {
                return _StatisticsManager;
            };

            _OptionsManager = new OptionsManager(this);
            this.OptionsManager = function() {
                return _OptionsManager;
            };

            _PlayerManager = new PlayerManager(this);
            this.PlayerManager = function() {
                return _PlayerManager;
            };

            _NoticeManager = new NoticeManager(this);
            this.NoticeManager = function() {
                return _NoticeManager;
            };

            _EffectsManager = new EffectsManager(this);
            this.EffectsManager = function() {
                return _EffectsManager;
            };

            this.minorTick = function() {
                this.freeCoinsTimeout--;


                this.QuestManager().checkForCompletedQuests();

                this.NoticeManager().removeExpired();

                this.majorTickCounter++;
                if (this.majorTickCounter > 10) {
                    this.majorTick();
                    this.doAutomation();
                }
            };

            this.majorTick = function() {
                log("calculate");
                // Do all calculations here
                this.majorTickCounter = 0;

                this.EffectsManager().removeExpired();
                this.NoticeManager().addNewContracts();
                this.AdventurerManager().addNewAdverturersForHire();

                this.AchievementManager().checkAndClaimAllAchievements();

                this.gameDateTime = this.TimeManager().getGameTime();

                // Autosave
                this.SessionManager().stillLoggedIn();
                this.autoSave();
            };

            this.reset = function() {
                log("reset");
                // Then initialise new
                this.majorTickCounter = 0;

                this.coins = 10;
                this.renown = 0;
                this.freeCoinsTimeout = 0;

                this.hired = {};

                this.runningExpeditions = [];
                this.completedExpeditions = [];

                // Take a local copy of the locations
                this.allLocations = commonFunctions.clone(locations);
                this.LocationManager().setCurrentLocation(this.allLocations[0].name);

                this.LocationManager().getCurrentLocation().availableContracts = [];
                this.LocationManager().getCurrentLocation().availableAdventurers = [];

                // Initilise options
                this.options = {
                    "claimAllButtons": false,
                    "automaticHire": false,
                    "automaticClaim": false,
                    "automaticSend": false,
                    "automaticRelocate": false,
                    "automaticFreeCoins": false,
                    "showMessageTimeAsRealTime": false
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

                this.ownedItems = [];
                this.messages = [];

                this.currentEffects = [];

                this.selectedContract = null;
                this.selectedAdverturer = null;
                this.currentParty = [];
                this.adventurerList = [];

                this.loginTracker = [];

                this.version = game.versions[0].number;

                // Data
                this.adventurers = adventurers;
                this.contracts = contracts;
                this.locations = locations;
                this.achievements = achievements;
                this.items = items;
                this.game = game;

                this.SessionManager().login();
                this.majorTick();

                this.NoticeManager().prepContractQueue(5);
                this.AdventurerManager().prepAdventurersQueue(5);
            };

            this.loadFromSavedData = function(savedData) {
                log("loadFromSavedData");
                if (!saveData) {
                    this.reset();
                    return;
                }

                this.coins = savedData.coins;
                this.renown = savedData.renown;
                if (savedData.reknown !== undefined) {
                    this.renown = savedData.reknown;
                }
                this.freeCoinsTimeout = savedData.freeCoinsTimeout;

                this.hired = savedData.hired;

                this.runningExpeditions = savedData.runningExpeditions;
                this.completedExpeditions = savedData.completedExpeditions;

                this.allLocations = savedData.allLocations;
                this.location = savedData.location;
                this.LocationManager().getCurrentLocation().availableContracts = savedData.location.availableContracts;
                this.LocationManager().getCurrentLocation().availableAdventurers = savedData.location.availableAdventurers;
                if (this.LocationManager().getCurrentLocation().availableAdventurers === undefined) this.LocationManager().getCurrentLocation().availableAdventurers = [];

                this.options = savedData.options;
                if (this.options !== undefined && this.options.automatic !== undefined) {
                    {
                        this.automaticHire = this.options.automatic;
                        this.automaticClaim = this.options.automatic;
                        this.automaticSend = this.options.automatic;
                        this.automaticRelocate = this.options.automatic;
                        this.automaticFreeCoins = this.options.automatic;
                        this.options.automatic = undefined;
                    }
                }
                if (this.options === undefined) {
                    this.options = {
                        "claimAllButtons": false,
                        "automaticHire": false,
                        "automaticClaim": false,
                        "automaticSend": false,
                        "automaticRelocate": false,
                        "automaticFreeCoins": false,
                        "showMessageTimeAsRealTime": false
                    };
                }

                this.stats = savedData.stats;
                if (this.stats === undefined) {
                    this.stats = [];
                }
                this.claimedAchievements = savedData.claimedAchievements;
                if (this.claimedAchievements === undefined) {
                    this.claimedAchievements = [];
                }
                this.ownedItems = savedData.ownedItems;
                if (this.ownedItems === undefined) {
                    this.ownedItems = [];
                }
                this.messages = savedData.messages;
                if (this.messages === undefined) {
                    this.messages = [];
                }
                this.currentEffects = savedData.currentEffects;
                if (this.currentEffects === undefined) {
                    this.currentEffects = [];
                }

                this.selectedContract = null;
                this.selectedAdverturer = null;
                this.currentParty = [];

                this.adventurerList = savedData.adventurerList;
                if (this.adventurerList === undefined) this.adventurerList = [];
                this.availableAdventurers = savedData.availableAdventurers;
                if (this.availableAdventurers === undefined) this.availableAdventurers = [];

                this.loginTracker = savedData.loginTracker;

                // Begin standard version management
                if (savedData.version === undefined) {
                    if (!this.LocationManager().getCurrentLocation().availableContracts) this.LocationManager().getCurrentLocation().availableContracts = [];
                    if (!this.LocationManager().getCurrentLocation().availableHires) this.LocationManager().getCurrentLocation().availableHires = [];
                    if (!this.allLocations) this.allLocations = clone(locations);
                    if (!this.renown) this.renown = 0;
                    if (!this.coins) this.coins = 0;
                }

                this.version = game.versions[0].number;
                if (savedData.version != this.version) {
                    var releaseNotesButton = '<button class="btn btn-info" data-toggle="modal" data-target="#releaseNotes">Release Notes</button>';
                    var versionUpdateMessage = "Version updated from " + savedData.version + " to " + this.version + ". Check the " + releaseNotesButton + ".";
                    alertify.delay(10000);
                    alertify.alert("<h2>Version update!</h2><p class='text-info'>" + versionUpdateMessage + "</p>");
                }

                // Data
                this.adventurers = adventurers;
                this.contracts = contracts;
                this.locations = locations;
                this.achievements = achievements;
                this.game = game;
                this.items = items;

                for (var i = 0; i < this.allLocations.length; i++) {
                    this.allLocations[i].contracts = this.locations[i].contracts;
                    this.allLocations[i].adventurers = this.locations[i].adventurers;
                }

                this.SessionManager().login();
                this.majorTick();
            };

            // Globals
            this.getGlobalValue = function(name) {
                var global = this.game.globals.filter(global => global.name == name)[0];
                if (global === undefined) { return null; }
                var effects = this.currentEffects.filter(effect => effect.affects === name);
                var value = global.baseValue;
                for (var i = 0; i < effects.length; i++) {
                    value *= effects[i].valueModifier;
                }
                return value;
            };

            // Coins
            this.canGetFreeCoins = function() {
                return this.freeCoinsTimeout <= 0;
            };

            this.freeCoins = function(location) {
                var amount = location.freeCoins * this.getGlobalValue("freeCoinsModifier");
                this.PlayerManager().giveCoins(amount);
                this.StatisticsManager().trackStat("click", "free-coins", 1);
                this.StatisticsManager().trackStat("collect", "free-coins", amount);
                this.freeCoinsTimeout = location.freeCoinsTimeout;
            };

            this.getIcon = function(iconFor) {
                switch (iconFor) {
                    case "coins":
                        return "./img/icons/crown-coin.png";
                    case "renown":
                        return "./img/icons/thumb-up.png";
                    case "item":
                        return "./img/icons/swap-bag.png";
                }

            };

            this.doAutomation = function() {

                if (this.options.automaticRelocate) {
                    if (this.LocationManager().canRelocateUp()) {
                        this.LocationManager().relocateUp();
                    }
                }
                if (this.options.automaticFreeCoins) {
                    if (this.canGetFreeCoins()) {
                        this.freeCoins(this.LocationManager().getCurrentLocation());
                    }
                }
                if (this.options.automaticClaim) {
                    this.claimAllCompletedExpeditions();
                }
                if (this.options.automaticHire) {}
                if (this.options.automaticSend) {}
            };


            log("initialising");

            this.loadFromSavedData(saveData);

            this.NoticeManager().prepContractQueue();

        };
    });