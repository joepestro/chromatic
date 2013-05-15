Search = {};

Search.google = function(params) {
	params.what = Search._extractQuery(params.what);
	var url = "http://www.google.com/search?q=" + encodeURIComponent(params.what);
	var html = '<img src="http://www.google.com/favicon.ico" />';
	return Search._createTab(url, html);
}

Search.youtube = function(params) {
	params.what = Search._extractQuery(params.what);
	var url = "http://www.youtube.com/results?search_query=" + encodeURIComponent(params.what);
	var html = '<img src="http://www.youtube.com/favicon.ico" />';
	return Search._createTab(url, html);
}

Search.twitter = function(params) {
	params.what = Search._extractQuery(params.what);
	var url = "http://twitter.com/#!/search/" + encodeURIComponent(params.what);
	var html = '<img src="http://www.twitter.com/favicon.ico" />';
	return Search._createTab(url, html);
}

Search.facebook = function(params) {
	params.what = Search._extractQuery(params.what);
	var url = "http://www.facebook.com/search/results.php?q=" + encodeURIComponent(params.what);
	var html = '<img src="http://www.facebook.com/favicon.ico" />';
	return Search._createTab(url, html);
}

Search.reddit = function(params) {
	params.what = Search._extractQuery(params.what);
	var url = "http://www.reddit.com/search?q=" + encodeURIComponent(params.what);
	var html = '<img src="http://www.reddit.com/favicon.ico" />';
	return Search._createTab(url, html);
}

Search.duckduckgo = function(params) {
	params.what = Search._extractQuery(params.what);
	var url = "http://www.duckduckgo.com/?q=" + encodeURIComponent(params.what);
	var html = '<img src="http://duckduckgo.com/favicon.ico" />';
	return Search._createTab(url, html);
}

Search.wolframalpha = function(params) {
	params.what = Search._extractQuery(params.what);
	var url = "http://www.wolframalpha.com/input/?i=" + encodeURIComponent(params.what);
	var html = '<img src="http://www.wolframalpha.com/favicon.ico" />';
	return Search._createTab(url, html);
}

Search._extractQuery = function(sentence) {
	var query = sentence.replace(/\b(in|a|new|navigate|go|change|open|to|tab|window|browser)\b/g, "");
	query = sentence.replace(/\b(that|mention|include|have|having|find|search|for)\b/g, "");
	return query.trim();
}

Search._createTab = function(url, html) {
	chrome.tabs.create({url: url});

	return {"complete": true, "html": html};
}
