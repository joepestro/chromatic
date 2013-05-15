DuckDuckGo = {};

DuckDuckGo.search = function(params) {
/*
	/^how do i/
		/^how do we/
		/^what is the best way to/
		/^what is/
		/^show me the/
		/^show me/
		/^find a/
		/^find the/
		/^find me/
		/^find/
		/again$/
*/

	var fillers = [
		/(how|what|show|find|define|look up|spell|calculate|calc) /,
		/(add|subtract|multiply|divide) /,
		/(does|do|is|are) /,
		/(i|we|us|me) /,
		/(the|a|an) /,
		/ (look like)/,
		/\?/
	];

	// remove fillers
	for (var i = 0, len=fillers.length; i < len; i++) {
		params.what = params.what.replace(fillers[i], "");
	}

	var query = "http://api.duckduckgo.com/?format=json&q=" + encodeURIComponent(params.what);
	var answer;
	$.ajax(query, {async: false,cache:true,dataType:"json"}).success(function(data) { 
		answer = data["Answer"] || data["Definition"] || data["AbstractText"];

		// credit source
		if (data["Definition"] && data["DefinitionSource"]) {
			answer += " (from " + data["DefinitionSource"] + ")"; 	
		} else if (data["AbstractText"] && data["AbstractSource"]) {
			answer += " (from " + data["AbstractSource"] + ")"; 	
		}

		// strip div tag
		answer = answer.replace("<div>", "");
	});
	
	if (answer) {
		var html = '<a href="http://duckduckgo.com?q=' + encodeURIComponent(params.what) + '" target="_blank"><img src="https://duckduckgo.com/favicon.ico" /></a>';
		return {"complete":true, "response": answer, "html": html};
	} else {
		return {"complete":true, "response": "Sorry, I don't know that!"};
	}
}
