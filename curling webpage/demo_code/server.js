

//Cntl+C to stop server

const http = require("http") //need to http
const fs = require("fs") //need to read static files
const url = require("url") //to parse url strings

//new stuff
const app = require('http').createServer(handler)
const io = require('socket.io')(app) //wrap server app in socket io capability
const PORT = process.env.PORT || 3000



let redPlayer = -1;
let yellowPlayer = -1;


const ROOT_DIR = "html" //dir to serve static files from

const MIME_TYPES = {
  css: "text/css",
  gif: "image/gif",
  htm: "text/html",
  html: "text/html",
  ico: "image/x-icon",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  js: "application/javascript",
  json: "application/json",
  png: "image/png",
  svg: "image/svg+xml",
  txt: "text/plain"
}


function get_mime(filename) {
  for (let ext in MIME_TYPES) {
    if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
      return MIME_TYPES[ext]
    }
  }
  return MIME_TYPES["txt"]
}

app.listen(PORT) //start server listening on PORT


function handler(request, response) {
    let urlObj = url.parse(request.url, true, false)

    io.on('connection', function(socket){
      socket.on("roleUpdate" , function(data){ //data { .request  .id  .role }
          let received = JSON.parse(data);
          // if player wants to join check if a spot is availible and that player isnt already playing
          if (received.request == 'join' && (redPlayer == -1 || yellowPlayer == -1) && redPlayer!=received.id && yellowPlayer != received.id){
              if (redPlayer == -1){ // fill red player first
                  redPlayer = received.id;
                  io.emit("roleUpdate" ,JSON.stringify({id: received.id, role: 'red', msg: "You are now the Red Player"}))
              }else { // fill yellow player
                  yellowPlayer = received.id;
                  io.emit("roleUpdate" ,JSON.stringify({id: received.id, role: 'yellow',msg: "You are now the Yellow Player"}))
              }

          }else if (received.request == 'leave'){
              if (received.id == redPlayer){
                  redPlayer = -1;
                  io.emit("roleUpdate" ,JSON.stringify({id: received.id, role: 'spec',msg: "You are now a Spectator"}))
              }else if (received.id == yellowPlayer){
                  yellowPlayer = -1;
                  io.emit("roleUpdate" ,JSON.stringify({id: received.id, role: 'spec',msg: "You are now a Spectator"}))
              }
          } else if (redPlayer!=received.id && yellowPlayer != received.id){
              io.emit("roleUpdate" ,JSON.stringify({id: received.id, role: 'spec',msg: "You are a Spectator (if you tried to join " +
                      "then there are already two players)"}));
          }
      })
      socket.on("aimingLine", function(data){
        io.emit("aimingLine",data)
      });
      socket.on('sendShot',function (data) {
          // console.log("RECEIVED SHOT INFO:"+data);
          io.emit("sendShot",data);
      });
    })
    
    //attached event handlers to collect the message data
    request.on("data", function(chunk) {
      receivedData += chunk
    })

    //event handler for the end of the message
    request.on("end", function() {
      
   

      if (request.method == "GET") {
        //handle GET requests as static file requests
        fs.readFile(ROOT_DIR + urlObj.pathname, function(err, data) {
          if (err) {
            //report error to console
            console.log("ERROR: " + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404)
            response.end(JSON.stringify(err))
            return
          }
          response.writeHead(200, {
            "Content-Type": get_mime(urlObj.pathname)
          })
          response.end(data)
        })
      }
    })
  }  
  

console.log("Server Running at PORT: 3000  CNTL-C to quit")
console.log("To Test:")
console.log("Open several browsers at: http://localhost:3000/canvasWithTimer.html")
