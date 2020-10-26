$(document).ready(function () {

    //Retrieves buttons from local storage or creates an empty array.
    var historyArray = JSON.parse(localStorage.getItem("searchHistory")) || [];

    //Takes the history array's last value and stores it in a variable, then passes it to the weatherCall function to
    //generate weather based on the user's last search when opening the browser.
    var lastSearched = (historyArray[historyArray.length - 1]);
    weatherCall(lastSearched);


    //Main search button
    $("#searchButton").on("click", function (event) {
        event.preventDefault;
        var city = $(this).siblings("input").val();

        //Pushes value of city into the history array as long as it has a value
        if (city === "") {
            return;
        } else {
            historyArray.push(city);
            localStorage.setItem("searchHistory", JSON.stringify(historyArray));
            renderHistory();
        }

        // var clearButton = $("<button id='clearButton'>");
        // clearButton.text("Clear History");
        // $(".list-group").append(clearButton);

        weatherCall(city);
    });

    $(document).on("click", "#clearButton", clearHistory);

    //Dynamically generated history buttons
    $(document).on("click", ".list-group-item", function () {
        var city = $(this).text();
        weatherCall(city);
    });

    function getUVIndex(response) {

        var UVIndex = response.value;
        $("#UVIndexDiv").text("UV Index: ");

        //I need to make a div inside the title div and give it the UV value and the respective class attribute so it doesnt take up the screen
        var UVbutton = $("<p>");
        UVbutton.text(UVIndex);
        $("#UVIndexDiv").append(UVbutton);

        //Conditions dictating what color the UV Index should be
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

        // $("#weather_image").attr("src", "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png");
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
        var weatherIcon = "";

        //Loop for 5 day forecast
        for (var i = 0; i < 5; i++) {
            //createForeCastDiv function
            var forecastDiv = $("<div>");
            forecastDiv.addClass("fiveDayForecastDiv");
            $("#fiveDaySection").append(forecastDiv);


            //createNewDate function
            //Moment adds a day to the current date and returns the value.
            var nextDate = moment().add(dayCount, "day");

            //Turn the value that moment.js gives us into a string so we can use substring on it.
            nextDate = String(nextDate);

            //Use substring on the nextDate string to grab the relevant data from it.
            var nextDateSubString = nextDate.substring(0, 15);

            //Create a header to fill with the date
            var dateHeader = $("<h5>");

            //Append the new h5 tag to the forecast div and update the text within it with the subtring.
            forecastDiv.append(dateHeader);
            dateHeader.text(nextDateSubString);

            //Add 1 to day count to return the subsequent date.
            dayCount++;

            //createIcon
            var weatherIconURL = "http://openweathermap.org/img/w/" + response.list[index].weather[0].icon + ".png";

            var weatherIconImage = $("<img>");
            weatherIconImage.attr("src", weatherIconURL);

            forecastDiv.append(weatherIconImage);


            //createDailyTemp
            //Get the temp from the JSON object and convert it to Fahrenheit.
            var tempKelvin = response.list[index].main.temp;
            var tempFahrenheit = ((tempKelvin - 273.15) * 9 / 5 + 32).toFixed(2);

            //Create a p tag and fill it with the text and temp.
            var tempP = $("<p>");

            //Append the new p tag to the forecast div and update the text within it with the temperature.
            forecastDiv.append(tempP);
            tempP.text("Temp: " + tempFahrenheit + " °F");

            //Create a p tag and fill it with the text and temp.
            var humidityP = $("<p>");

            //Append the new p tag to the forecast div and update the text within it with the temperature.
            forecastDiv.append(humidityP);
            humidityP.text("Humidity: " + response.list[index].main.humidity + "%");

            index += 8;
        }
    };

    function weatherCall(city) {
        var todayQueryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=2521198802838b4440f00e66a7aa70a5";

        $.ajax({
            url: todayQueryURL,
            method: "GET"
        }).then(function (response) {
            getTodaysWeather(response);

            var longitude = JSON.stringify(response.coord.lon);
            var latitude = JSON.stringify(response.coord.lat);

            $("#weatherIcon").attr("src", "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png");

            var UVqueryURL = "http://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=2521198802838b4440f00e66a7aa70a5";

            $.ajax({
                url: UVqueryURL,
                method: "GET"
            }).then(function (response) {
                //Passing the ajax response to the getUVIndex call
                getUVIndex(response);
            });
        });

        //5 Day Forecast call and handling
        var fiveDayQueryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=2521198802838b4440f00e66a7aa70a5";

        $.ajax({
            url: fiveDayQueryURL,
            method: "GET"
        }).then(function (response) {
            getFiveDayForecast(response);
        });
    }

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

    renderHistory();
})
