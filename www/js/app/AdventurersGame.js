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
        "app/GameStateManager",
        "app/SpriteManager",
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
        GameStateManager,
        SpriteManager,
        calendar,
        contracts,
        locations,
        adventurers,
        achievements) {

        commonFunctions = new CommonFunctions();
        data = new DataManager();

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

            _GameStateManager = new GameStateManager(this);
            this.GameStateManager = function() {
                return _GameStateManager;
            };

            _SpriteManager = new SpriteManager(this);
            this.SpriteManager = function() {
                return _SpriteManager;
            };

            this.minorTick = function() {

                this.QuestManager().checkForCompletedQuests();

                this.NoticeManager().removeExpired();

                this.majorTickCounter++;
                if (this.majorTickCounter > 10) {
                    this.majorTick();
                    this.doAutomation();
                }
            };

            this.majorTick = function() {
                log("majorTick");
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

            this.doAutomation = function() {
                if (this.options.automaticRelocate) {
                    if (this.LocationManager().canRelocateUp()) {
                        this.LocationManager().relocateUp();
                    }
                }
                if (this.options.automaticClaim) {}
                if (this.options.automaticHire) {}
                if (this.options.automaticSend) {}
            };

            this.initialise = function() {
                log("initialising");
                this.GameStateManager().loadFromSavedData(saveData);
                this.NoticeManager().prepContractQueue();
                this.SessionManager().login();
                this.majorTick();
            };

            this.initialise();
        };
    });