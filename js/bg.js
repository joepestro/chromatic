var status;
var retorts = [];

// timeouts
var okTimeout, unrecognizedTimeout, errorTimeout;

// intervals
var popupInterval;

// minimum allowed phrase confidence
var CONFIDENCE_THRESHOLD = 0.5;

// badge behavior
var BADGE_DECAY = 400;
var BADGE_ACTIONS = {
	"ready": {
		text: "*",
		color: [0, 255, 255, 50]
	},
	"listening": {
		text: "*",
		color: [0, 255, 255, 255]
	},
	"unsure what you said": {
		text: "?",
		color: [255, 0, 0, 255]
	},
	"responding": {
		text: "ok",
		color: [0, 255, 0, 255]
	}
}

function iAm(action) {
	status = action;

	// show listening status on icon
	chrome.browserAction.setBadgeText({"text": BADGE_ACTIONS[action]["text"]});
	chrome.browserAction.setBadgeBackgroundColor({"color": BADGE_ACTIONS[action]["color"]});

	var popup = getPopup();
	if (popup)
		popup.updateStatus();
}

function getStatus() {
	return status;	
}

function getRetorts() {
	return retorts;
}

function getPopup() {
	var popups = chrome.extension.getViews({type: "popup"});
	if (popups.length > 0)
		return popups[0];
	else
		return null;
}

function checkPopup() {
	if (!getPopup()) {
		// clear badge icon
		chrome.browserAction.setBadgeText({"text": ""});

		// don't listen after popup is closed
		stopListening();
	}
}

function openOptions() {
	chrome.tabs.create({url: "options.html"});
}

function listen() {
	if (getPopup()) {
		chrome.experimental.speechInput.start({
			"language": "en-US",
			"grammar": "builtin:search",
			"filterProfanities": false
		}, function() {
			chrome.experimental.speechInput.isRecording(function(isRecording) {
				if (isRecording)
					iAm("ready");
			});
		});
	}
}

function stopListening() {
	// make sure we don't start listening again if closed
	clearTimeout(okTimeout);
	clearTimeout(unrecognizedTimeout);
	clearTimeout(errorTimeout);

	chrome.experimental.speechInput.isRecording(function callback(isRecording) {
		if (isRecording) {
			chrome.experimental.speechInput.stop(function() {
				// should not be recording now!
			});
		}

		chrome.browserAction.setBadgeText({"text": ""});
	});	
}

function speak(utterance) {
	chrome.tts.speak(utterance, {
		onEvent: function(e) {
			// console.log('Event ' + e.type + ' at position ' + e.charIndex);
			if (e.type == "error")
				console.log("Error speaking: " + e.errorMessage);
		}
	});

	console.log(chrome.extension.getViews());
}

function playSound(sound) {
	audio = document.createElement("audio");
	document.body.appendChild(audio);

	audio.volume = 1.0;
	audio.src = "audio/" + sound;
	audio.autoplay = true;

	// audio.addEventListener('ended', function(evt) {
	//     isPlaying = false;
	// });
}

function input(utterance) {
	// we just got user input
	retorts.push([utterance, "user"]);
	iAm("responding");

	// play success tone if completed action
	// if (result && result["complete"] == true)
	playSound("success.ogg");			

	// figure out what to do based on this utterance
	var result = handle(utterance);

	// we just got user output
	retorts.push([[result["response"], result["html"]].join(" "), "chromatic"]);

	// update popup (if exists)
	var popup = getPopup();
	if (popup)
		popup.updateRetorts();

	return result;
}

chrome.experimental.speechInput.onResult.addListener(function(result) {
	console.log(result.hypotheses);

	var result;
	if (result.hypotheses && result.hypotheses[0] && result.hypotheses[0].confidence > CONFIDENCE_THRESHOLD) {
		result = input(result.hypotheses[0].utterance);		

		// say response text if it exists
		if (result && result["response"]) {
			chrome.experimental.speechInput.isRecording(function callback(isRecording) {
				if (isRecording) {
					chrome.experimental.speechInput.stop(function() {
						speak(result["response"]);
					});
				} else {
					speak(result["response"]);
				}
			});
		} 

		// tts is about 180-220 wpm
		var numWords = 0;
		if (result && result["response"])
			numWords = result["response"].split(" ").length;

		setTimeout(listen, 60/150.0 * numWords * 1000 + 500);
	} else { // confidence is not high enough
		// play failure sound
		// playSound("failure.ogg");
		
		iAm("unsure what you said");
		setTimeout(listen, 500);
	}
});

chrome.experimental.speechInput.onSoundStart.addListener(function() {
	iAm("listening");
});
chrome.experimental.speechInput.onSoundEnd.addListener(function() {
	// chrome.browserAction.setBadgeText({"text": ""});
});
chrome.experimental.speechInput.onError.addListener(function(error) {
	console.log("Error listening: " + error.code);

	iAm("unsure what you said");
	setTimeout(listen, 500);
});

// load internal service handlers
Phrase.loadHandlers();

// get current user information from browser
Chromatic.loadContacts();
Chromatic.getPosition();

// check if popup is closed (if callback fails)
popupInterval = setInterval(checkPopup, 10000);

// start listening on launch if "always listen" option set
// setTimeout(listen, 500);
