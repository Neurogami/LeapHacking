Leap Hacking
============

Code to demonstrate assorted things you can do with a Leap Motion as covered by the site [Leap Hacking](http://leaphacking.com)

### WebSocketLeapGameV001

This is a simple browser-based game that is controlled using WebSockets.  In this version, there is a JRuby program that grabs the Leap frame data and converts various hand movements into custom WebSocket messages.  This game connects to that program as the WebSocket server


### WebSocketLeapGameV002

The same game as in V001 except it works directly from the Leap WebSocket server.  It includes the [leap.js](https://github.com/leapmotion/leapjs) JavaScript library.  The code is also cleaned up some from V001.





