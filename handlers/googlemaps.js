GoogleMaps = {}

GoogleMaps.html = '<img src="powered-by-google-on-white.png" />';
GoogleMaps.API_KEY = "AIzaSyCguk1f0LDysAGN30aRB77tfRWyfgs2G0E";

GoogleMaps.search = function(params) {
	if (!Chromatic.location)
		return {"complete": true, "response": "Could not determine your location", "html": null};

	var url = "https://maps.googleapis.com/maps/api/place/search/json";
	var place;
	$.ajax(url, {
		async: false,
		cache: true,
		dataType: "json",
		data: {
			key: GoogleMaps.API_KEY,
			location: Chromatic.location.latitude + "," + Chromatic.location.longitude,
			sensor: true,
			radius: 5*1609, // 5 miles
			name: params.what
		}
	}).success(function(data) { 
		console.log(data.results);
		place = data.results[0].name + " at " + data.results[0].vicinity;
	});

	return {"complete": true, "response": "Here is a map to " + place, "html": GoogleMaps.html};
}
