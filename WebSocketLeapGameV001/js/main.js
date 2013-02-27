var webSocket;

var globalMusic;
var critterRunMusic;


var spriteHeight = 48;
var spriteWidth = 48;

var canvas;
var stage;
var screen_width;
var screen_height;

var imagesLoaded = 0;
var imagesToLoad = 3;

function debug(str){ $("#debug").append("<p>"+str+"</p>"); };


Skullhead = {
  bitmapAnim: null, 
  growing : false,
  walkingTo : false,
  defaultScale : 2.0,
  lastGrowMessage : new Date().getTime() / 1000,
  minGrowCallsTime : 1.0,
  desiredX : null,
  desiredY : null,

 spriteImage : new Image(),

  move: function () {
     if(this.bitmapAnim) {
        if(!this.growing && this.walkingTo) { this.moveTo(this.desiredX, this.desiredY); }
      }
 },

moveTo: function (newX, newY) {
           var x = parseInt(newX);
           var y = parseInt(newY);

           var maxDenom = 2.0;
           if (y > screen_height ) { y = screen_height;  }
           if (x > screen_width ) { x = screen_width;  }

           if (y < 0 ) { y = 0 }
           if (x < 0 ) { x = 0;  }

           var deltaX = (x - this.bitmapAnim.x );
           var deltaY = (y - this.bitmapAnim.y );

           var ratio = (Math.abs(deltaX)/Math.abs(deltaY));

           if (ratio < 1/maxDenom ) { ratio = 1/maxDenom ; }
           if (ratio > maxDenom ) { ratio = maxDenom ; }

           if (Math.abs(deltaX) < this.bitmapAnim.vX*1.5 ) {
             // no change in bitmapAnim.x, do nothing
           } else if (deltaX > 0) {
             if (this.bitmapAnim.x < screen_width  - (spriteWidth/2)) { this.bitmapAnim.x += (this.bitmapAnim.vX*ratio); }
           } else { // decrement X if there is room to move 
             if (this.bitmapAnim.x > (spriteWidth/2))                 { this.bitmapAnim.x -= (this.bitmapAnim.vX*ratio); }
           }

           if (Math.abs(deltaY) < this.bitmapAnim.vX*2 ) {
             // no change in bitmapAnim.y
           } else if (deltaY > 0) {
             if (this.bitmapAnim.y < screen_height  - (spriteHeight/2)) { this.bitmapAnim.y += (this.bitmapAnim.vX/ratio ); }
           } else {
             if (this.bitmapAnim.y > (spriteHeight/2))                  { this.bitmapAnim.y -= (this.bitmapAnim.vX/ratio); }
           }
         },

loadImage: function(url) {
              this.spriteImage.src = url; 
            },

walkTo:  function(x, y) {

           if (!this.bitmapAnim) {return;}

            this.growing   = false;
            this.walkingTo = true;

            this.bitmapAnim.scaleX = this.defaultScale;
            this.bitmapAnim.scaleY = this.defaultScale;

            // Actual movement is based on clock ticks; it's not "real time".
            // That means that instead of just moving the sprite to the new location in
            // a single smooth action, we instead set the desired new location X and Y.
            // tick() then invokes move() which will (ulitmately) use these properties
            // to step the sprite to a new location. 
            this.desiredX = parseInt(x);
            this.desiredY = parseInt(y);

            this.bitmapAnim.gotoAndPlay("walk"); 
          },

onImageLoaded: function(evt) { 
                      var spriteSheet;

                      try {
                        spriteSheet = new createjs.SpriteSheet({ images: [evt.target],
                            frames: { width: spriteWidth, height: spriteHeight, regX: spriteWidth/2, regY: spriteHeight }, 
                            animations: { walk: [0, 8, "walk", 6],
                            grow: [9, 20, "grow", 4]
                            } });
                      } catch(e) {
                        alert("Error creating spriteSheet: " + e );
                      }
                      //  Create the animation
                      try {
                        Skullhead.bitmapAnim = new createjs.BitmapAnimation(spriteSheet);
                      } catch(e) {
                        alert("Error creating bitmapAnim: " + e );
                      }

                      Skullhead.bitmapAnim.name = "Skullhead";
                      Skullhead.bitmapAnim.vX = 4;
                      Skullhead.bitmapAnim.currentFrame = 0;

                      Skullhead.bitmapAnim.scaleX = 2.0;
                      Skullhead.bitmapAnim.scaleY = 2.0;
                      try {
                        stage.addChild(Skullhead.bitmapAnim);
                      } catch(e) { 
                        alert( "stage.addChild(stage.addChild(bitmapAnim); error:" + e ); 
                      }

                      Skullhead.bitmapAnim.gotoAndPlay("walk"); 

                      imagesToLoad += 1;
                      
                      Skullhead.walkingTo = true;
                      Skullhead.walkTo( screen_height/2, screen_width/2 ); 
                    },

grow: function (scaleFactorArray) {
         var timeNow = new Date().getTime() / 1000;
         var tDelta = timeNow  - this.lastGrowMessage;

         this.walkingTo = false;
         this.growing   = true;    
         this.bitmapAnim.scaleX = scaleFactorArray[0];
         this.bitmapAnim.scaleY = scaleFactorArray[0];

         if (tDelta  < this.minGrowCallsTime ) { return }
         this.lastGrowMessage = timeNow;
         this.bitmapAnim.gotoAndPlay("grow"); 
       },

x: function() {
      if (this.bitmapAnim) {
        return(this.bitmapAnim.x);
      } else {
        return 0;
      }
    },

y: function() {
      if (this.bitmapAnim) {
        return(this.bitmapAnim.y);
      } else {
        return 0;
      }
    },

init: function() {
         this.spriteImage.onload = this.onImageLoaded;  
         return this;
       },

}.init();


Critter = {

bitmapAnim: null,
            spriteImage:  new Image(),

            haveCritter    : false,
            showCritterCount : 0,
            showCritterMax   : 250,
            hideCritterCount : 0,
            hideCritterMax   : 350,

            loadImage : function(url) {
              this.spriteImage.src   =  url
            },

show : function(){
         if(!Critter.bitmapAnim){ return; }

         if (!this.haveCritter) {
           Critter.bitmapAnim.x = getRandomCritterX(); 
           Critter.bitmapAnim.y = getRandomCritterY(); 
           Critter.bitmapAnim.currentFrame = 0;
           Critter.bitmapAnim.scaleX = 2.0;
           Critter.bitmapAnim.scaleY = 2.0;

           try {
             stage.addChild(Critter.bitmapAnim);
           } catch(e) { 
             alert( "stage.addChild(stage.addChild(Critter.bitmapAnim); error:" + e ); 
           }
           Critter.bitmapAnim.gotoAndPlay("walk"); 
           this.haveCritter = true
         }
       },

remove : function() {
           this.showCritterCount = 0;

           try {
             stage.removeChild(Critter.bitmapAnim); 
           } catch(e) { 
             alert( "stage.removeChild; error:" + e ); 
           }
           this.haveCritter = false;
         },


move : function() {

         // Check for a collision while Skullhead is growing.
         // BTW, is it possible to just freeze the critter in place if you never have Skullhead stop growing?
         if(Skullhead.growing){ 
           var deltaX = Math.abs(Critter.bitmapAnim.x - Skullhead.bitmapAnim.x);
           var deltaY = Math.abs(Critter.bitmapAnim.y - Skullhead.bitmapAnim.y);
           if ( (deltaY < 35) && (deltaX < 35 ) ){
             // Collision!
             critterRunMusic.play();
             Critter.bitmapAnim.scaleX = 6.0;
             Critter.bitmapAnim.scaleY = 6.0;
             Critter.bitmapAnim.gotoAndPlay("run"); 
             this.showCritterCount = this.showCritterMax - 40;

             debug("showCritterCount = " + this.showCritterCount );
             return;
           }
         } 

         if (Critter.bitmapAnim.x >= screen_width - (spriteWidth/2)) {
           // We've reached the right side of our screen
           // We need to walk left now to go back to our initial position
           Critter.bitmapAnim.direction = -90;
         }

         if (Critter.bitmapAnim.x < (spriteWidth/2)) {
           // We've reached the left side of our screen
           // We need to walk right now
           Critter.bitmapAnim.direction = 90;
         }

         // Moving the sprite based on the direction & the speed
         if (Critter.bitmapAnim.direction == 90) {
           Critter.bitmapAnim.x += Critter.bitmapAnim.vX;
         }
         else {
           Critter.bitmapAnim.x -= Critter.bitmapAnim.vX;
         }
       },

onImageLoaded: function(evt) { 

                    var spriteSheet;

                    try {
                      spriteSheet = new createjs.SpriteSheet({ images: [evt.target],
                          frames: { width: spriteWidth, height: spriteHeight, regX: spriteWidth/2, regY: spriteHeight }, 
                          animations: { walk: [0, 5, "walk", 20],
                          run: [6, 11, "run", 12]
                          } });
                    } catch(e) {
                      alert("Error creating Critter spriteSheet: " + e );
                    }

                    try {
                      Critter.bitmapAnim = new createjs.BitmapAnimation(spriteSheet);
                    } catch(e) {
                      alert("Error creating Critter.bitmapAnim: " + e );
                    }

                    Critter.bitmapAnim.name = "Critter";
                    Critter.bitmapAnim.vX = 5;
                    Critter.bitmapAnim.direction = 90; // http://blogs.msdn.com/b/davrous/archive/2011/07/21/html5-gaming-animating-sprites-in-canvas-with-easeljs.aspx?Redirected=true

                    Critter.bitmapAnim.currentFrame = 0;
                    Critter.bitmapAnim.scaleX = 2.0;
                    Critter.bitmapAnim.scaleY = 2.0;

                    Critter.show();
                    imagesToLoad += 1;
                  },

init: function() {
         this.spriteImage.onload = this.onImageLoaded;  
         return this;
       }

}.init();




/*****************************************************************************/
function onBackgroundLoaded(img) {  
  var i ;
  try { i = new createjs.Bitmap(img.target); 
  } catch(e) { 
    errorMsg("Error calling  createjs.Bitmap(img.target) " + e ); 
  }

  i.regX = 0; 
  i.regY = 0;
  i.x    = 0;  
  i.y    = 0;  
  stage.addChild(i);  
  imagesLoaded += 1;
}  


/*****************************************************************************/
function errorMsg(msg) {
  alert(msg);
  console.log(msg);
}

/*****************************************************************************/
function startGame() {  

  canvas = document.getElementById("gameCanvas");

  screen_width = canvas.width;
  screen_height = canvas.height;

  try { 
    stage = new createjs.Stage(canvas); 
  }catch(e) {
    errorMsg("Error calling createjs.Stage(canvas) " + e ); 
  }

  var ctx = canvas.getContext("2d");

  var background = new Image();
  background.onerror  =  handleImageError;
  background.src = "img/game_scene01BW.png";
  background.onload = onBackgroundLoaded;  

  Critter.loadImage('img/critter-head-002.png');  
  Skullhead.loadImage('img/skull-head002.png');

  createjs.Ticker.addListener(window);
  createjs.Ticker.useRAF = true;
  createjs.Ticker.setFPS(60);

  try {
    globalMusic.play();
  } catch(e) {
    alert("Error playing music: " + e );
  }

}

/*****************************************************************************/
function handleImageError(e) {
  errorMsg("Error Loading Image : " + e.target.src); 
}


/*****************************************************************************/
function tick() {
  // Do we need to do something with this?  If this were served over the 'net,
  // do we want to check that all resources have been loaded?
  // imagesLoaded == imagesToLoad

  if (!Critter.haveCritter) {
    
    Critter.hideCritterCount += 1;

    if ( Critter.hideCritterCount > Critter.hideCritterMax) { 
      Critter.show();
      Critter.haveCritter = true;
      Critter.hideCritterCount = 0;
    }
  } else {
    Critter.hideCritterCount = 0; 
    Critter.showCritterCount += 1;

    if (Critter.showCritterCount  > Critter.showCritterMax ) {
      Critter.remove();
      Critter.haveCritter = false;
      Critter.hideCritterCount = 0;
    } else {
      if(Critter.bitmapAnim) { Critter.move(); }
    }
  }

  Skullhead.move();
  stage.update();
}



function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


function getRandomCritterX(){
  var skullheadX = Skullhead.x();

  if (skullheadX < (screen_width/2) ) {
    return getRandomInt(screen_width/2, screen_width-40)
  }
  return(Math.floor(Math.random() * (screen_width - skullheadX) ) + skullheadX);
  return getRandomInt(40, screen_width/2)
}


function getRandomCritterY(){

  var skullheadY = Skullhead.y();
  if (skullheadY < (screen_height/2) ) {
    return getRandomInt(skullheadY, screen_height-100)
      //  return( Math.floor(Math.random() * (skullheadY - 1) + 1) );
  }
  return getRandomInt(100, skullheadY)

}




function prepareAudio() {
  var myAudio = document.createElement('audio');
  var canPlayMp3;
  var canPlayOgg;

  if (myAudio.canPlayType) {
    canPlayMp3 = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mpeg');
    canPlayOgg = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"');
    var audioExtension = ".none";

    if (canPlayMp3) { audioExtension = ".mp3"; } else if (canPlayOgg) { audioExtension = ".ogg"; }

    if (audioExtension !== ".none") {            
      globalMusic = new Audio();
      globalMusic.preload  = true;
      globalMusic.loop  = true;
      globalMusic.src = "assets/voodoo-ring002" + audioExtension

        critterRunMusic = new Audio();
      critterRunMusic.preload  = true;
      critterRunMusic.loop  = false
        critterRunMusic.src = "assets/critter-run-002" + audioExtension

    } else {
      alert("Canot play mp3 or ogg!");
    }
  } else {
    alert("Can NOT play audio! :(");
  }
}

$(document).ready(function() {
    webSocket = new WebSocket("ws://127.0.0.1:8090");

    try {
    webSocket.onmessage = function(evt) { processWsEvent(evt); };
    webSocket.onclose = function() { debug("socket closed"); };
    webSocket.onopen = function() {
    debug("connected...");
    webSocket.send("hello game server");
    };

    } catch(e) {
    alert("Error with WebSockets: " + e );
    }
    prepareAudio();
    });



/***************** WS stuff ******************/
function processWsEvent(evt){
  var message ;
  // Expecting messages that look something like this:
  // {"command":"walk","args":[100,201]}
  // {"command":"grow"}

  try {
    message = JSON.parse(evt.data);
  } catch(e) {
    alert("Error with JSON parse, given '" + evt.data +  "': " + e );
  }

  try {
    Handlers[message.command](message.args);
  } catch(e) {
    //     alert("Error trying to dispatch '" + message.command + '" with args ' + message.args + "': " + e );
  }
}


var Handlers = new Object();

Handlers.walkto = function(pointArray){
  var x = pointArray[0];
  var y = pointArray[1];

  try {
    Skullhead.walkTo(x, y);
  } catch(e) {
    alert('Error calling Skullhead.walkTo: ' +  e);
  }

}

Handlers.grow = function(scaleFactorArray){
  Skullhead.grow( scaleFactorArray );
}

