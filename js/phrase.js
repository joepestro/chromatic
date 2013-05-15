var lastSentence;
var lastParams;

function handle(sentence) {
	var phrase = new Phrase(sentence);
	var params = phrase.parse(lastParams);

	// if (phrase.isReset())
	// clear, reset
	//
	// else if (phrase.isResultInteraction())
	// again, more, yes, no, next
	
	// farm out logic work to handler
	if (params["handler"]) {
		console.log(params);
		var result = params["handler"]["callback"].call(this, params);
		console.log(result);

		if (result && result["complete"])
			lastParams = null; // action complete, clear param history
		else
			lastParams = params; // save params for next time

		lastSentence = sentence; // save sentence for next time

		return result;
	} else {
		// don't know what action to perform, get more info
	}
	console.log(result);
}

// String additions
String.prototype.replaceSlang = function() {
	var slangPhrases = {
		"a": "1",
		"an": "1",
		"one": "1",
		"a couple": "2",
		"a few": "3"
	};

	var str = this;
	for (phrase in slangPhrases) {
		str = str.replace(phrase, slangPhrases[phrase]);
	}
	return str;
}

// Sorting
function byLength(a, b) {
	return b.length - a.length;
}

// Phrase constructor
function Phrase(sentence) {
	NAMES = ["Chromatic", "Chrome", "Computer", "Hal", "Siri"];
	this.sentence = sentence;
}

// Phrase class
Phrase.handlers = [];
Phrase.loadHandlers = function(callback) {
	// order determines priority. fallback (search) should be last.
	// keyword matches should be lower priority than handlers allowing freetext fields
	// e.g. "Remind me to find a pizza place nearby" should be handled as a reminder, not a map
	var handlerNames = [
		"googlemail",
		"googlechrome",
		// "googlemaps",
		// "weather",
		"grooveshark",
		// "eggs",
		"search",
		"duckduckgo"
	];

	// TODO: handle contractions
	for (var i = 0; i < handlerNames.length; i++) {
		var handler = handlerNames[i];

		var jsonPath = chrome.extension.getURL("handlers/" + handler + ".json");
		var jsPath = chrome.extension.getURL("handlers/" + handler + ".js");

		// block while loading these to make sure they complete fully
		$.ajaxSetup({
			async: false
		});

		// load .js
		require([jsPath]);

		// load .json
		var self = this;
		$.ajax({
			url: jsonPath,
			success: function(data) {
				var flatData = data.replace(/\n|\t/g, " ");
				self.handlers.push($.parseJSON(flatData));
			},
			error: function() {
				alert("Problem loading handler json");
			}
		});
	}

	if (callback)
		callback();
}

// Phrase instance
Phrase.prototype.parse = function(lastParams) {
	var handler;
	var who, what, when, where, why, how;

	// get sentence ready for parsing
	this.prepare();

	// TODO: if no handler is found, stem all words and try again
	if (lastParams && lastParams["handler"])
		handler = lastParams["handler"];
	else
		handler = this.extractHandler();

	// make all parameters lowercase
	for (var i = 0; i < handler["parameters"].length; i++)
	handler["parameters"][i] = handler["parameters"][i].trim().toLowerCase();

	if (handler["parameters"].indexOf("when") != -1)
		when = this.extractWhen();

	if (handler["parameters"].indexOf("who") != -1)
		who = this.extractWho();

	if (handler["parameters"].indexOf("where") != -1)
		where = this.extractWhere();

	if (handler["parameters"].indexOf("what") != -1)
		what = this.extractWhat();

	// TODO: how = how many (first, best, a list, etc)
	why = "because";
	how = "";

	var params = {
		"handler": handler, 
		"when": when, 
		"who": who, 
		"where": where, 
		"what": what, 
		"why": why
	};

	// override with what was passed in as lastParams
	if (lastParams) {
		for (key in params) {
			if (lastParams[key])
				params[key] = lastParams[key];
		}
	}

	return params;
}

Phrase.prototype.prepare = function() {
	// TODO: get rid of activation words
	// this.sentence = this.sentence.replace(/.*(Chromatic|Chrome|Computer|Hal|Siri),?/i, "");
	
	this.sentence = this.sentence.replace("?", "");
	this.sentence = this.sentence.toLowerCase();
}

Phrase.prototype.extractHandler = function() {
	var self = this;
	for (var i = 0, len=Phrase.handlers.length; i < len; i++) {
		var handler = Phrase.handlers[i];
		for (service in handler) {
			var matches = handler[service]["matches"].sort(byLength);
			for (var j = 0, len2=matches.length; j < len2; j++) {
				var match = matches[j];
				var matchRegExp;
				if (match != "*")
					matchRegExp = new RegExp("\\b" + match + "\\b", "g");

				if (match == "*" || self.sentence.match(matchRegExp)) {
					console.log(match);
					for (action in handler[service]["actions"]) {
						for (var k = 0, len3=handler[service]["actions"][action]["matches"].length; k < len3; k++) {
							var actionMatch = handler[service]["actions"][action]["matches"][k];
							var actionMatchRegExp;
							if (actionMatch != "*")
								actionMatchRegExp = new RegExp("\\b" + actionMatch + "\\b", "g");

							if (actionMatch == "*" || self.sentence.match(actionMatchRegExp)) {
								// remove the top level match from sentence
								if (match != "*")
									self.sentence = self.sentence.replace(matchRegExp, "");

								// return handler callback and desired parameters
								console.log(handler[service]["actions"][action]["handler"]);
								var callback = eval(handler[service]["actions"][action]["handler"]);
								var parameters = handler[service]["actions"][action]["parameters"];

								return ({"callback": callback, "parameters": parameters});
							}
						}
					}
				}
			}
		}
	}

	// no handler assigned, so try to extract everything we can
	return ({"callback": DuckDuckGo.search, "parameters": ["who", "what", "where", "when"]});
}

Phrase.prototype.extractWhen = function() {
	console.log("extractWhen: " + this.sentence);

	var prefixes = ["in", "at", "on"];
	var fuzzyTimes = {
		"tonight": Date.parse("6pm"),
		"this morning": Date.parse("9am"),
		"this afternoon": Date.parse("12pm"),
		"this evening": Date.parse("5pm"),
		"at midnight": Date.parse("12am"),
		"at noon": Date.parse("12pm"),
		"later": (1).hours().fromNow(), 
		"a little later": (30).minutes().fromNow(),
		"in a little bit": (30).minutes().fromNow(),
		"in a little while": (30).minutes().fromNow()
	};
	var numericalSlangs = {
		"a hour": "1 hour",
		"an hour": "1 hour",
		"a minute": "1 minute",
		"an minute": "1 minute",
		"one hour": "1 hour",
		"one minute": "1 minute",
		"a couple minutes": "2 minutes",
		"a couple hours": "2 hours",
		"a few minutes": "3 minutes",
		"a few hours": "3 hours"
	};

	// TODO: handle am/pm subtle assumptions
	var m = Date.parse("now").toString("tt").toLowerCase();
	this.sentence = this.sentence.replace(/([0-9])([0-9])([0-9])([0-9])/, "$1$2:$3$4" + m); // 1215pm
	this.sentence = this.sentence.replace(/([0-9])([0-9])([0-9])/, "$1:$2$3" + m); // 430pm

	// TODO: add am/pm to "at 10", "at 1"
	for (numericalSlang in numericalSlangs) {
		this.sentence = this.sentence.replace(numericalSlang, numericalSlangs[numericalSlang]);
	}

	var words = this.sentence.split(" ");
	for (var size = 4; size > 0; size--) {
		for (var i = 0; i < words.length; i++) {
			var sampleArray = words.slice(i, i+size);
			var sample = sampleArray.join(" ");

			if (sampleArray.length >= size && sample) {
				var parseDate = (Date.parse("+" + sample) || Date.parse(sample));
				if (parseDate) {
					// check if there is a prefix word
					var sampleIndex = this.sentence.indexOf(sample);
					var prefix = this.sentence.substring(sampleIndex-3, sampleIndex-1);
					console.log(prefix);

					for (var j = 0; j < prefixes.length; j++) {
						if (prefix == prefixes[j])
							sample = prefixes[j] + " " + sample;
					}

					// remove from sentence
					this.sentence = this.sentence.replace(sample, "");

					// return Date object
					return parseDate;
				}
			} 
		}
	}

	for (fuzzyTime in fuzzyTimes) {
		if (this.sentence.indexOf(fuzzyTime) != -1) {
			this.sentence = this.sentence.replace(fuzzyTime, "");
			return fuzzyTimes[fuzzyTime];
		}
	}

	return null;
}

Phrase.prototype.extractWhat = function() {
	// get rid of fillers
	var fillers = ["show me a", "show me the", "show me", "show us", "find me", "find us", "find", "look up", "display", "calculate", "what is the", "what is a", "um"];
	for (var i = 0; i < fillers.length; i++) {
		var fillerRegExp = new RegExp("\\b" + fillers[i] + "\\b", "g");
		this.sentence.replace(fillers[i], "");
	}

	// <verb> <pronoun> <amount>
	this.sentence = this.sentence.replace(/divided by/ig, "/");
	this.sentence = this.sentence.trim();

	return this.sentence;
}

Phrase.prototype.extractWho = function() {
	var contact, name;

	// look through contact names in order
	for (var i = 0, len=Chromatic.contacts.length; i < len; i++) {
		contact = Chromatic.contacts[i];

		if (!contact["name"])
			continue;

		name = contact["name"].toLowerCase();

		var firstName;
		if (name.indexOf(" ") != -1)
			firstName = name.split(" ")[0];

		// TODO: regex out everything before occurence of name
		if (this.sentence.indexOf(name) != -1) { // full name
			this.sentence = this.sentence.replace(name, "");
			return contact;
		} else if (firstName && this.sentence.indexOf(firstName) != -1) { // just first name
			this.sentence = this.sentence.replace(firstName, "");
			return contact;
		}
	}

	return null;
}

Phrase.prototype.extractWhere = function() {
	var matches = this.sentence.match(/(at|around|near|close|in).+/);
	if (matches)
		return matches[0];

	return null;
}
