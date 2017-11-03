/*jshint esversion: 6 */

define(["jquery",
        "app/CommonFunctions",
        "alertify",
        "json!data/game.json",
        "json!data/settings.json",
        "app/PlayerManager",
        "app/PartyManager",
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
        PartyManager,
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

        return function AdventurersGame(logFunction) {

            log = logFunction;

            this.gameStateManager = new GameStateManager();
            this.GameStateManager = function() {
                return this.gameStateManager;
            };

            this.itemManager = new itemManager();
            this.ItemManager = function() {
                return this.itemManager;
            };

            this.LocationManager = function() {
                return new locationManager();
            };

            this.AdventurerManager = function() {
                return new AdventurerManager();
            };

            this.QuestManager = function() {
                return new QuestManager();
            };

            this.MessageManager = function() {
                return new MessageManager();
            };

            this.AchievementManager = function() {
                return new AchievementManager();
            };

            this.DataManager = function() {
                return new DataManager();
            };

            this._TimeManager = Time;
            this.TimeManager = function() {
                return new TimeManager();
            };

            this.SessionManager = function() {
                return new SessionManager();
            };

            this.StatisticsManager = function() {
                return new StatisticsManager();
            };

            this.OptionsManager = function() {
                return new OptionsManager();
            };

            this.PlayerManager = function() {
                return new PlayerManager();
            };

            this.NoticeManager = function() {
                return new NoticeManager();
            };

            this.EffectsManager = function() {
                return new EffectsManager();
            };

            this.SpriteManager = function() {
                return new SpriteManager();
            };

            this.PartyManager = function() {
                return new PartyManager();
            };

            this.minorTick = function() {

                this.QuestManager().checkForCompletedQuests();

                this.NoticeManager().removeExpired();

                this.gameState.majorTickCounter++;
                if (this.gameState.majorTickCounter > 10) {
                    this.majorTick();
                    this.doAutomation();
                }
            };

            this.majorTick = function() {
                log("majorTick");
                // Do all calculations here
                this.gameState.majorTickCounter = 0;

                this.EffectsManager().removeExpired();
                this.NoticeManager().addNewContracts();
                this.AdventurerManager().addNewAdverturersForHire();
                this.AdventurerManager().updateQuotes();
                this.AdventurerManager().recoverAdventurers();

                this.AchievementManager().checkAndClaimAllAchievements();

                this.gameState.gameDateTime = this.TimeManager().getGameTime();

                // Autosave
                this.SessionManager().stillLoggedIn();
                this.GameStateManager().save();
            };

            this.doAutomation = function() {
                if (this.OptionsManager().getOptions().automaticRelocate) {
                    if (this.LocationManager().canRelocateUp()) {
                        this.LocationManager().relocateUp();
                    }
                }
                if (this.OptionsManager().getOptions().automaticClaim) {}
                if (this.OptionsManager().getOptions().automaticHire) {}
                if (this.OptionsManager().getOptions().automaticSend) {}
            };

            this.initialise = function() {
                log("Initialising - Adventurers of Otium");

                if (this.gameState === undefined || this.gameState === null) {
                    this.gameState = {};
                    this.GameStateManager().reset();
                    this.majorTick();
                }

                this.GameStateManager().versionCheck();
                this.NoticeManager().prepContractQueue();
                this.SessionManager().login();
                this.majorTick();
            };

            this.initialise();
        };
    });