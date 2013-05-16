Chromatic
=

A chrome extension that uses looped [speechInput][0] to accept voice commands, and perform actions. It's kind of like [Siri][1] or [Google Now][2], but for the browser instead.

*Note*: you'll need to enable `experimental` in `chrome://flags/`

Since we're in a browser, there are some interesting integrations that are possible. For example:

1. Interact with webpages
  * open, reload, or close tabs
  * go forward & back
  * scroll pages
  * navigate to websites
2. Use your Google Contacts (with correct permission set) to send emails by name
3. Use the [Duck Duck Go API][3] to get instant answers to questions
4. And more... (see `/handlers` for full list)!

How would you describe it in a sentence?
-

The description according to `manifest.json` is
> Be in harmony with Chrome. Use your voice to get things done.

What are some sample commands?
-

![](screenshots/instructions_full.png)

What does it look like in use?
-

Starting Chromatic | Using Chromatic
--- | ---
![](screenshots/instructions_small.png) | ![](screenshots/play_music_rtm.png)

So, can I check my Gmail?
-

Yes! | Getting more answers
--- | ---
![](screenshots/inbox.png) | ![](screenshots/multiple.png)

[0]: http://developer.chrome.com/extensions/experimental.speechInput.html
[1]: http://www.apple.com/ios/siri/
[2]: http://www.google.com/landing/now/
[3]: https://duckduckgo.com/api
