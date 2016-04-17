# PebbleVoiceText
Pebble app using dictation API to capture speech and send as SMS message
This is my very first attempt at Github and the first coding I've done for about 20 years, so don't expect it to work :)
Building a watchapp for Pebble Time (Basalt) which uses the Dictation API to capture speech and then send via SMS gateway.
Initial build uses Textlocal which is a paid service so please don't use my credits up. Have also tried using the IFTTT SMS channel which works fine and is free to use, but limited to a single pre-registered recipient. It also supports only certain networks which are available in the US.
Next steps are
- add a config so that the user can use their own gateway
- address book lookup using dictation so you can speak the (nick)name of the recipient: done properly this would use a companion app on the smartphone but this is beyond me at present; thinking about using Google API as I use Gmail :)
- If I get this stuff working then I'll think about extending it to email and possibly FB Messenger (not sure if this is possible yet).
