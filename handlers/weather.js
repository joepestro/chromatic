// World Weather Online

Weather = {};

Weather.getForecast = function(params) {
	if (!params.where)
		params.where = "Mountain View";

	if (!params.when)
		params.when = Date.parse("today");

	// make API request
	// http://free.worldweatheronline.com/feed/weather.ashx?q=mountain+view&format=json&num_of_days=2&key=143038ea33223455113010
	$.getJSON();
}


