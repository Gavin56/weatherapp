# Weather App

This application makes two ajax calls to the OpenWeatherMap API and uses its JSON data to render weather information to the user's screen. The user is first presented with an empty, basic weather info interface and an input field. Upon filling the input field and clicking search, the ajax calls are made, and the user will be presented information regarding the city they entered. Text entries in the input field are not case-sensitive and are trimmed automatically. After each search, a search history button is dynamically generated and prepended to an ever growing list underneath the input field. Each button represents the city corresponding to that search, and upon being clicked, will once again retrieve the weather data for that city. This app uses local storage to save those buttons and re-render them when the user opens their browser again or refreshes the page. If the app is closed, it will also automatically render the last searched city upon reopening. If, however, the user clicks the "Clear History" button, the buttons and local storage will be cleared, and the page will no longer retrieve the last searched city upon reopening. 
<br>
<br>
## Link to Deployed Application

<br>
<br>
## Preview Image
<img src="https://github.com/Gavin56/weatherman/blob/main/Assets/weatherDashboardMain.png?raw=true" alt="Weather App Screenshot" width="600"/>
