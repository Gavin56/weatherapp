$(document).ready(function () {

    //Received help from my classmate Amanda with this.
    var historyArray = JSON.parse(localStorage.getItem("searchHistory")) || [];
    var lastSearched = (historyArray[historyArray.length - 1]);
    weatherCall(lastSearched);

    //We need to call this so the search history buttons remain on the screen whenever we refresh or reopen the browser.
    renderHistory();


    $("#searchButton").on("click", function (event) {
        event.preventDefault();

        var city = $(this).siblings("input").val();

        //Received help from my classmate Amanda with this.
        if (city === "") {
            return;
        } else {
            historyArray.push(city);
            localStorage.setItem("searchHistory", JSON.stringify(historyArray));
            renderHistory();
        }

        weatherCall(city);
    }); //End of searchButton onclick//


    $(document).on("click", "#clearButton", clearHistory);


    //Received help from my classmate Amanda with this. Any clicked element with class "list-group-item" will perform this function.
    //This function sets the text of the clicked button to the city variable and then passes it to the weatherCall function.
    $(document).on("click", ".list-group-item", function () {
        var city = $(this).text();
        weatherCall(city);
    }); //End of clearButton onclick//


    function getUVIndex(response) {

        var UVIndex = response.value;
        $("#UVIndexDiv").text("UV Index: ");

        //I need to make a div inside the title div and give it the UV value and the respective class attribute so it doesnt take up the screen
        var UVbutton = $("<p>");
        UVbutton.text(UVIndex);
        $("#UVIndexDiv").append(UVbutton);

        //Conditions dictating what color the UV Index should be. Also removes irrelevant classes.
        if (UVIndex < 3) {
            $(UVbutton).removeClass("UVmoderate");
            $(UVbutton).removeClass("UVsevere");
            $(UVbutton).removeClass("UVdangerous");
            $(UVbutton).addClass("UVmild");
        } else if (UVIndex < 6) {
            $(UVbutton).removeClass("UVmild");
            $(UVbutton).removeClass("UVsevere");
            $(UVbutton).removeClass("UVdangerous");
            $(UVbutton).addClass("UVmoderate");
        } else if (UVIndex < 10) {
            $(UVbutton).removeClass("UVmoderate");
            $(UVbutton).removeClass("UVmild");
            $(UVbutton).removeClass("UVdangerous");
            $(UVbutton).addClass("UVsevere");
        } else {
            $(UVbutton).removeClass("UVmoderate");
            $(UVbutton).removeClass("UVsevere");
            $(UVbutton).removeClass("UVmild");
            $(UVbutton).addClass("UVdangerous");
        };
    }

    function getTodaysWeather(response) {
        //Temperature is returned in Kelvin, so here it is converted to Fahrenheit and rounded to the second decimal place.
        var tempKelvin = response.main.temp;
        var tempFahrenheit = ((tempKelvin - 273.15) * 9 / 5 + 32).toFixed(2);
        var date = moment().format("l");

        $("#cityName").text("Today's Forecast: " + response.name + " " + date);
        $("#temperature").text("Temperature: " + tempFahrenheit + "°F");
        $("#humidity").text("Humidity: " + response.main.humidity + "%");
        $("#windSpeed").text("Wind Speed: " + response.wind.speed + " MPH");

    }

    function getFiveDayForecast(response) {

        //Prevents the boxes from stacking on top of each other. Renders in a completely new row every time.
        $("#fiveDaySection").empty();

        //index will dictate which item from the 5 day json object's list array that we want.
        //dayCount allows us to add a day to the current date, increasing by 1 with each iteration of the loop, to get the dates for the next 5 days.
        var index = 0;
        var dayCount = 1;

        //Loop for 5 day forecast
        for (var i = 0; i < 5; i++) {

            var forecastDiv = $("<div>");
            forecastDiv.addClass("fiveDayForecastDiv");
            $("#fiveDaySection").append(forecastDiv);

            //Dynamically retrieving subsequent days in moment.js and appending desired text to the dateHeader.
            var nextDate = moment().add(dayCount, "day");
            nextDate = String(nextDate);
            var nextDateSubString = nextDate.substring(0, 15);
            var dateHeader = $("<h5>");

            forecastDiv.append(dateHeader);
            dateHeader.text(nextDateSubString);

            //Dynamically create a weather icon for each day.
            var weatherIconURL = "https://openweathermap.org/img/w/" + response.list[index].weather[0].icon + ".png";
            var weatherIconImage = $("<img>");

            weatherIconImage.attr("src", weatherIconURL);
            forecastDiv.append(weatherIconImage);

            //Dynamically display temperature for each day (converted to Fahrenheit).
            var tempKelvin = response.list[index].main.temp;
            var tempFahrenheit = ((tempKelvin - 273.15) * 9 / 5 + 32).toFixed(2);
            var tempP = $("<p>");

            forecastDiv.append(tempP);
            tempP.text("Temp: " + tempFahrenheit + " °F");

            //Dynamically display humidity percentage for each day.
            var humidityP = $("<p>");

            forecastDiv.append(humidityP);
            humidityP.text("Humidity: " + response.list[index].main.humidity + "%");
            
            //dayCount increments the moment.js function on line 106 while index increments each response.list item we retrieve by 1 day.
            dayCount++;
            index += 8;
        }
    };

    //Ajax calls
    function weatherCall(city) {
        var todayQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=2521198802838b4440f00e66a7aa70a5";

        $.ajax({
            url: todayQueryURL,
            method: "GET"
        }).then(function (response) {
            getTodaysWeather(response);

            var longitude = JSON.stringify(response.coord.lon);
            var latitude = JSON.stringify(response.coord.lat);

            //Generates weather icon image.
            $("#weatherIcon").attr("src", "https://openweathermap.org/img/w/" + response.weather[0].icon + ".png");

            var UVqueryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=2521198802838b4440f00e66a7aa70a5";

            $.ajax({
                url: UVqueryURL,
                method: "GET"
            }).then(function (response) {
                //Passing the ajax response to the getUVIndex call
                getUVIndex(response);
            });
        });

        //5 Day Forecast call and handling
        var fiveDayQueryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=2521198802838b4440f00e66a7aa70a5";

        $.ajax({
            url: fiveDayQueryURL,
            method: "GET"
        }).then(function (response) {
            getFiveDayForecast(response);
        });
    }

    //Received help from my classmate Amanda with this. This empties the div to prevent duplication, and runs through the search history array to 
    //generate buttons labeled with the text found inside the array.
    function renderHistory() {
        $(".list-group").empty();

        for (var i = 0; i < historyArray.length; i++) {
            var recentButton = $("<button class='list-group-item'>").text(historyArray[i]);
            $(".list-group").prepend(recentButton);
        };

        //Clears input box
        $("input").val("");
    };

    function clearHistory() {
        $("#list-tab").empty();
        localStorage.clear();
        historyArray = [];
    }
})
