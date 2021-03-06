/*jshint esversion: 6 */

define([
        "app/CommonFunctions",
        "app/DataManager"
    ],
    function TimeManager(CommonFunctions, DataManager) {

        commonFunctions = new CommonFunctions();
        data = new DataManager();

        return function TimeManager() {

            this.getGameTime = function(dateInMilliSeconds) {

                if (dateInMilliSeconds === undefined || dateInMilliSeconds === null || dateInMilliSeconds <= 0) {
                    dateInMilliSeconds = Date.now();
                }

                var gameDateTime = {};
                gameDateTime.realDateTime = dateInMilliSeconds;

                var gameMinutes = dateInMilliSeconds / 1000;
                gameDateTime.minutes = Math.floor(gameMinutes % 60);

                var gameHours = Math.floor(gameMinutes / 60);
                gameDateTime.hours = (gameHours % 24);

                gameDateTime.timeOfDay = data.calendar.timeOfDay[gameDateTime.hours];

                gameDateTime.amPm = "am";
                if (gameDateTime.hours >= 12) gameDateTime.amPm = "pm";
                gameDateTime.hours = (gameHours % 12);
                if (gameDateTime.hours === 0) gameDateTime.hours = 12;

                if (!gameDateTime.timeOfDay) {
                    log("Couldn't find time of day for [" + dateInMilliSeconds + "]" + JSON.stringify(gameDateTime));
                    log(new Error().stack);
                }
                gameDateTime.timeColour = gameDateTime.timeOfDay.colourHex;

                var gameDate = Math.floor(gameHours / 24);
                gameDateTime.date = (gameDate % 30) + 1;
                gameDateTime.gameDateOrdinalIndicator = commonFunctions.nth(gameDateTime.date);

                var gameMonth = Math.floor(gameDate / 30);
                var gameMonthNumber = (gameMonth % 12) + 1;
                gameDateTime.month = data.calendar.months[gameMonthNumber - 1];
                gameDateTime.monthName = gameDateTime.month.name;

                gameDateTime.season = gameDateTime.month.season;

                gameDateTime.year = Math.floor(gameMonth / 12);

                gameDateTime.holiday = data.calendar.holidays.filter(holiday => holiday.occurs.month == gameDateTime.month.name && holiday.occurs.date == gameDateTime.date)[0];

                gameDateTime.toDateString = function() {
                    return this.date + this.gameDateOrdinalIndicator + " of " + this.monthName + " " + this.year;
                };

                gameDateTime.toTimeString = function() {
                    return this.hours + ":" + this.minutes.toString().padStart(2, "0") + this.amPm;
                };

                gameDateTime.toString = function() {
                    return this.toTimeString() + " " + this.toDateString();
                };

                gameDateTime.toFullString = function() {
                    return this.timeOfDay.description + " - " + this.toTimeString() + " " + this.toDateString() + " - " + this.season;
                };

                return gameDateTime;

            };

            this.readableTime = function(milliseconds) {

                var totalSeconds = Math.floor(milliseconds / 1000);
                var seconds = totalSeconds % 60;
                var totalMinutes = (totalSeconds - seconds) / 60;
                var minutes = totalMinutes % 60;
                var hours = (totalSeconds - (seconds + minutes * 60)) % 60;

                var timeString = "";
                if (hours) {
                    timeString += hours + "hr ";
                }
                if (minutes) {
                    timeString += minutes + "m ";
                }
                if (seconds) {
                    timeString += seconds + "s";
                }

                if (timeString.length === 0) {
                    timeString = "0s";
                }
                return timeString;
            };

            this.isSameDay = function(time1, time2) {
                var date1 = this.getGameTime(time1);
                var date2 = this.getGameTime(time2);
                return date1.date == date2.date && date1.month == date2.month && date1.year == date2.year;
            };

        };
    }
);