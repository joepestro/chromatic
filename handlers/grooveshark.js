// http://developers.grooveshark.com/docs/js_api/

Grooveshark = {};

Grooveshark.html = '<img src="http://grooveshark.com/webincludes/images/favicon.ico" />';

Grooveshark.findTab = function(callback) {
	chrome.tabs.getAllInWindow(null, function(tabs) {
		for (var i = 0, len=tabs.length; i < len; i++) {
			if (tabs[i].title.indexOf("Grooveshark") != -1) {
				callback(tabs[i].id);
				return;
			}
		}			

		// no grooveshark tab found
		callback(null);
	});
}

Grooveshark.inject = function() {
	return (function exec(fn) {
		var script = document.createElement('script');
		script.setAttribute("type", "application/javascript");
		script.textContent = '(' + fn + ')();';
		document.body.appendChild(script); // run the script
		document.body.removeChild(script); // clean up
	}).toString() + ";";
}

Grooveshark.play = function(params) {
	Grooveshark.findTab(function(tabID) {
		if (tabID) {
			chrome.tabs.executeScript(tabID, {
				code: Grooveshark.inject() + "exec(function() { window.Grooveshark.play() });"
			}, function callback() {
				console.log("callback from play");
			});
		} else {
			// no grooveshark tab found, so create one
			chrome.tabs.create({
				url: "http://www.grooveshark.com",
				pinned: true
			});
		}
	});

	return {"complete": true, "html": Grooveshark.html};
}

Grooveshark.pause = function(params) {
	Grooveshark.findTab(function(tabID) {
		chrome.tabs.executeScript(tabID, {
			code: Grooveshark.inject() + "exec(function() { window.Grooveshark.pause() });"
		}, function callback() {
			console.log("callback from pause");
		});
	});

	return {"complete": true, "html": Grooveshark.html};
}

Grooveshark.next = function(params) {
	Grooveshark.findTab(function(tabID) {
		chrome.tabs.executeScript(tabID, {
			code: Grooveshark.inject() + "exec(function() { window.Grooveshark.next() });"
		}, function callback() {
			console.log("callback from next");
		});
	});

	return {"complete": true, "html": Grooveshark.html};
}

Grooveshark.previous = function(params) {
	Grooveshark.findTab(function(tabID) {
		chrome.tabs.executeScript(tabID, {
			code: Grooveshark.inject() + "exec(function() { window.Grooveshark.previous() });"
		}, function callback() {
			console.log("callback from previous");
		});
	});

	return {"complete": true, "html": Grooveshark.html};
}

Grooveshark.seekTo = function(params) {
	Grooveshark.findTab(function(tabID) {
		chrome.tabs.executeScript(tabID, {
			code: Grooveshark.inject() + "exec(function() { window.Grooveshark.seekTo() });"
		}, function callback() {
			console.log("callback from seekTo");
		});
	});

	return {"complete": true, "html": Grooveshark.html};
}

Grooveshark.volumeUp = function(params) {
	Grooveshark.findTab(function(tabID) {
		chrome.tabs.executeScript(tabID, {
			code: Grooveshark.inject() + "exec(function() { var currentVolume = window.Grooveshark.getVolume();	window.Grooveshark.setVolume(currentVolume + 20); });"
		}, function callback() {
			console.log("callback from volumeUp");
		});
	});

	return {"complete": true, "html": Grooveshark.html};
}

Grooveshark.volumeDown = function(params) {
	Grooveshark.findTab(function(tabID) {
		chrome.tabs.executeScript(tabID, {
			code: Grooveshark.inject() + "exec(function() { var currentVolume = window.Grooveshark.getVolume();	window.Grooveshark.setVolume(currentVolume - 20); });"
		}, function callback() {
			console.log("callback from volumeDown");
		});
	});

	return {"complete": true, "html": Grooveshark.html};
}

Grooveshark.mute = function(params) {
	Grooveshark.findTab(function(tabID) {
		chrome.tabs.executeScript(tabID, {
			code: Grooveshark.inject() + "exec(function() { window.Grooveshark.setVolume(0); });"
		}, function callback() {
			console.log("callback from mute");
		});
	});

	return {"complete": true, "html": Grooveshark.html};
}

