GoogleChrome = {};

GoogleChrome.html = '<img src="http://www.google.com/images/icons/product/chrome-16.png" />';

GoogleChrome.createTab = function(params) {
	chrome.tabs.create({});

	return {"complete": true, "html": GoogleChrome.html};
}

GoogleChrome.removeTab = function(params) {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.remove(tab.id);
	});

	return {"complete": true, "html": GoogleChrome.html};
}

GoogleChrome.reloadTab = function(params) {
	chrome.tabs.executeScript(null, {code:"document.location.reload()"});

	return {"complete": true, "html": GoogleChrome.html};
}

GoogleChrome.navigateTo = function(params) {
	params.what = params.what.replace(/\b(in|a|new|navigate|go|change|open|to|tab|window|browser)\b/g, "");
	params.what = params.what.trim();

	if (params.what.indexOf("forward") != -1) {
		chrome.tabs.executeScript(null, {code:"history.go(1)"});
	} else if (params.what.indexOf("back") != -1) {
		chrome.tabs.executeScript(null, {code:"history.go(-1)"});
	} else if (params.what.length > 0) {
		var feelingLucky = "http://google.com/search?btnI=I%27m+Feeling+Lucky&sourceid=navclient&q=" + encodeURIComponent(params.what);
		chrome.tabs.create({url: feelingLucky});
	} else {
		chrome.tabs.create({});
	}

	return {"complete": true, "html": GoogleChrome.html};
}

GoogleChrome.enhance = function(params) {

}

GoogleChrome.jumpTab = function(params) {
	params.what = "jump " + params.what;
	return GoogleChrome.scrollTab(params);
}

GoogleChrome.scrollTab = function(params) {
	var locations = {
		"top": "0px",
		"bottom": "max",
		"up": "-=1000px",
		"down": "+=1000px"
	};

	var durations = {
		"slow": 5000,
		"fast": 200,
		"quick": 200,
		"snap": 0,
		"jump": 0
	};
	
	// var multipliers = ["a lot", "more", "ton", "big", "large", "bunch"];
	
	// defaults
	var location = "+=1000px";
   	var duration = 1000;

	// check if a location is specified
	for (l in locations) {
		 if (params.what.indexOf(l) != -1)
			 location = locations[l];
	}

	// check if a duration is specified
	for (d in durations) {
		if (params.what.indexOf(d) != -1)
			duration = durations[d];
	}

	chrome.tabs.executeScript(null, {file:"js/jquery.js"}, function() {
		chrome.tabs.executeScript(null, {file:"js/jquery.scrollTo.js"}, function() {
			chrome.tabs.executeScript(null, {code:"$.scrollTo('" + location + "', {duration:" + duration + "});"}, function() {
				// now scrolling
			});
		});
	});
		
	return {"complete": true, "html": GoogleChrome.html};
}

GoogleChrome.createReminder = function(params) {
	if (!params.what) {
		return {"complete": false, "response": "What should I remind you to do?"};
	} else if (!params.when) {
		return {"complete": false, "response": "When should I remind you to " + params.what + "?"};
	} else {
		var now = new Date().getTime();
		var offset = params.when - now;
		console.log(offset);

		setTimeout(function() {
			var notification = webkitNotifications.createNotification(
				'images/48.png',
				'Reminder from Chromatic',
				params.what
			);
			notification.show();
		}, offset);
		return {"complete": true, "response": "OK! I'll remind you to " + params.what + " on " + params.when.toString("dddd, MMMM dS") + " at " + params.when.toString("h:mm tt")};
	}
}
