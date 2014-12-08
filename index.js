// with using node.js johnny-five, must upload standard firmata to arduino

// for digital input

var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , five = require("johnny-five"),
    board, redButton, yellowButton, greenButton, slider,
    redLED1, yellowLED1, redLED2, yellowLED2;

// make web server listen on port 8080
app.listen(8080);

// handle web server
function handler (req, res) {
  //console.log(__dirname + '/index.html');
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

// board and Arduino buttons and slider
board = new five.Board();
board.on("ready", function() {
  redButton = new five.Button(2);
  yellowButton = new five.Button(3);
  greenButton = new five.Button(7);
  redLED1 = new five.Led(13);
  yellowLED1 = new five.Led(12);
  redLED2 = new five.Led(11);
  yellowLED2 = new five.Led(10);

  redButton.on("down", function(value){
    //led.on();
    console.log("red down!");
  });

  yellowButton.on("down", function(value){
    //led.on();
    console.log("yellow down!");
  });

  greenButton.on("down", function(value){
    //led.on();
    console.log("green down!");
  });

  slider = new five.Sensor({
    pin: "A0",
    freq: 500
  });

  slider.scale(0,100).on("slide", function(err, value) {
    if (err) {
      console.log("error: ", err);
    } else {
      console.log(Math.floor(this.value));
    }
  });
});


// on a socket connection
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
 
  // if board is ready
  if(board.isReady){
    // read in slider data, pass to browser
    slider.on("data",function(){
      socket.emit('slider', { raw: this.raw });
    });

    // read in red button clicked
    redButton.on("down", function() {
      socket.emit('redButton', { raw: this.raw });
      //console.log("red is down in socket");
    });

    // read in yellow button clicked
    yellowButton.on("down", function() {
      socket.emit('yellowButton', { raw: this.raw });
      //console.log("yellow is down in socket");
    });

    // read in green button clicked
    greenButton.on("down", function() {
      socket.emit('greenButton', { raw: this.raw });
      //console.log("green is down in socket");
    });
  }

  // if quiet message received, turn on yellow led for 5 sec
  socket.on('clickquiet', function() {
    if(board.isReady){   
      console.log("yellowLED on"); 
      yellowLED1.on();
      yellowLED2.on();
      console.log("yellow quiet 1");
      board.wait(5000, function() {
        console.log("yellow quiet 2");
        yellowLED1.off();
        yellowLED2.off();
        console.log("yellowLED off");
      });
    } 
  }); 
    
    // if listen message received, turn on red led for 5 sec
    socket.on('clicklisten', function() {
    if(board.isReady){   
      console.log("redLED on"); 
      redLED1.on();
      redLED2.on();
      console.log("red listen 1");
      board.wait(5000, function() {
        console.log("red listen 2");
        redLED1.off();
        redLED2.off();
        console.log("redLED off");
      });
    } 
  }); 


  // if two min message received, flash red and yellow (orange) for 5 sec
  socket.on('clicktwomin', function() {
     if(board.isReady){   
      console.log("redLED and yellowLED on"); 
      yellowLED1.on();
      yellowLED2.on();
      redLED1.on();
      redLED2.on();
      board.wait(1000, function() {
        console.log("redLED and yellowLED strobing");
        yellowLED1.strobe(1000);
        yellowLED2.strobe(1000);
        redLED1.strobe(1000);
        redLED2.strobe(1000);
      });
      board.wait(10000, function() {
        yellowLED1.stop();
        redLED1.stop();
        yellowLED2.stop();
        redLED2.stop();
        yellowLED1.off();
        yellowLED2.off();
        redLED1.off();
        redLED2.off();
        console.log("redLED and yellowLED off");
      });
    } 
  });
});
