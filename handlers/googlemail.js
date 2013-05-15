GoogleMail = {};
GoogleMail.html = '<img src="/images/googlemail.ico" />';

GoogleMail.createEmail = function(params) {
	// TODO: extract subject
	// subject is...
	// with the subject...

	if (params.what && params.what.indexOf("that says") == 0)
		params.what = params.what.replace("that says", "");

	// make a small window prefilled with info
	var url = "https://mail.google.com/mail/?source=mailto&tf=1&view=cm&fs=1";

	if (params.who)
		url += "&to=" + escape(params.who.email);

	// url += "&su=" + escape(params.subject);
	//
	if (params.what)
		url += "&body=" + escape(params.what);

	window.open(url, null, "scrollbars=yes,width=576,height=576,toolbar=no,status=no,resizable=yes");

	return {"complete": true, "response": "OK! Here's your email", "html": GoogleMail.html};
};

GoogleMail.inboxCount = function(params) {
	var unread;
	$.ajax("https://mail.google.com/mail/feed/atom", {async: false}).success(function(data) { 
		var doc = $(data);
		unread = doc.find("fullcount").text();
	});

	var synopsis = "You have " + unread + " unread emails";

	return {"complete": true, "response": synopsis, "html": GoogleMail.html};
};

GoogleMail.inboxContent = function(params) {
	// https://mail.google.com/mail/feed/atom

/*
	entry
		title
		summary
		link
		modified
		issued
		id
		author
			name
			email
*/

	var unread, emails;
	$.ajax("https://mail.google.com/mail/feed/atom", {async: false}).success(function(data) { 
		var doc = $(data);
		unread = doc.find("fullcount").text();
		emails = doc.find("entry");
	});

	var synopsis = "You have " + unread + " unread emails: ";

	for (var i = 0; i < emails.length; i++) {
		synopsis += $(emails[i]).find("summary").text() + "; ";
	}

	return {"complete": true, "response": synopsis, "html": GoogleMail.html};
};
