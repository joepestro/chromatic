Chromatic = {};

Chromatic.GOOGLE_CONTACTS_URL = "https://mail.google.com/mail/c/data/contactstore?hl=en&out=js&type=4&max=100";
Chromatic.contacts = [];
Chromatic.location = null;

Chromatic.loadContacts = function() {
	var self = this;
	$.ajax({
		url: this.GOOGLE_CONTACTS_URL, dataType: "text", cache: true, async: false,
		success: function(results) {
			var start = results.indexOf("&&&START&&&") + 11;
			var end = results.lastIndexOf("&&&END&&&");
			results = results.substring(start, end);	

			var json = $.parseJSON(results);
			var contacts = eval(json.Body.AutoComplete);

			var normalizedContacts = [];
			for (var i = 0, len=contacts.length; i < len; i++) {
				var name = contacts[i][2];
				var email = contacts[i][3][0];

				if (name.length == 0)
					name = null;
				if (email.length == 0)
					email = null;

				normalizedContacts[i] = {
					"name": name,
					"email": email
				};
			}

			self.contacts = normalizedContacts;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert("Chromatic: There was a problem loading your contacts. Please try again later.");
		}
	});
}

Chromatic.getPosition = function() {
	navigator.geolocation.getCurrentPosition(function(position) {
		Chromatic.location = position.coords;
	});
}
