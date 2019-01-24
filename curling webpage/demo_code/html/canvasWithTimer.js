
//client side socket
// connect to server and retain the socket
let socket = io('http://' + window.document.location.host)
//let socket = io('http://localhost:3000')

//used later for notifications
let wantNotified = false;
//Use javascript array of objects to represent words and their locations

let player = {
  id: Math.floor(Math.random() * 2147483646), // an id is assigned to the player
    //if you are reading this, yes its very bootleg :)
  role: 'spec' //always 'spec', 'red', or 'yellow'
}

let linepoint ={
  endx :0,
  endy : 0,
  startx : 0,
  starty : 0
}

let shotObj = {
  movingRock : {
    xRock:0,
    yRock:0
  },
  xAxisShot : 0,
  yAxisShot : 0
}

let time = 0;

//stone locations
let redStone1 = {
  x: 620,
  y: 550,
  wasShot: false,
  colour: 'red'
} 
let RedStone2 = {
  x: 650,
  y: 550,
  wasShot: false,
  colour: 'red'
} 
let RedStone3 = {
  x: 680,
  y: 550,
  wasShot: false,
  colour: 'red'
} 
let yellowStone1 = {
  x: 720,
  y: 550,
  wasShot: false,
  colour: 'yellow'
} 
let YellowStone2 = {
  x: 750,
  y: 550,
  wasShot: false,
  colour: 'yellow'
}
let YellowStone3 = {
  x: 780,
  y: 550,
  wasShot: false,
  colour: 'yellow'
}

let rocksArray = [redStone1,RedStone2,RedStone3,yellowStone1,YellowStone2,YellowStone3]; // array of all rocks

let pollingTimer //timer to poll server for location updates

let canvas = document.getElementById("canvas1") //our drawing canvas

function rockInBox(rock){
  //checks if it is in the small circles

    if (rock.x >= 600 && rock.x <= 800){
      if (rock.y >= 0 && rock.y <= 200){
        //return true if rock is in box
        return true
      }
    }
}

function drawCanvas() {
  const context = canvas.getContext("2d");
  
  context.fillStyle = "white";
  context.fillRect(0, 0, canvas.width, canvas.height); //erase canvas
  context.strokeStyle = "blue";
  
  //draw big circle circle
  context.fillStyle = "blue";
  context.beginPath()
  context.arc(300, //x co-ord
	300, //y co-ord
	220, //radius
	0, //start angle
	2 * Math.PI //end angle
  )
  context.fill()

  context.fillStyle = "white";
  context.beginPath()
  context.arc(300,300,165,0, 2 * Math.PI)
  context.fill()

  context.fillStyle = "red";
  context.beginPath()
  context.arc(300,300,110,0, 2 * Math.PI)
  context.fill()    

  context.fillStyle = "white";
  context.beginPath()
  context.arc(300,300,55,0, 2 * Math.PI)
  context.fill()

  //draw small circle
  context.fillStyle = "blue";
  context.beginPath()
  context.arc(700,100,74,0, 2 * Math.PI)
  context.fill()

  context.fillStyle = "white";
  context.beginPath()
  context.arc(700,100,56,0, 2 * Math.PI)
  context.fill()

  context.fillStyle = "red";
  context.beginPath()
  context.arc(700,100,38,0, 2 * Math.PI)
  context.fill()    

  context.fillStyle = "white";
  context.beginPath()
  context.arc(700,100,20,0, 2 * Math.PI)
  context.fill()


  
  //draw red rocks
  
  context.fillStyle = "darkred";
  context.beginPath()
  context.arc(redStone1.x,redStone1.y,10,0, 2 * Math.PI)
  //add large red rock
  if (rockInBox(redStone1))
    context.arc((redStone1.x -600)*3, redStone1.y*3, 30,0,  2 * Math.PI)
  context.fill()    
  
  context.beginPath()
  context.arc(RedStone2.x,RedStone2.y,10,0, 2 * Math.PI)
    //add large red rock
    if (rockInBox(RedStone2))
        context.arc((RedStone2.x -600)*3, RedStone2.y*3, 30,0,  2 * Math.PI)
  context.fill()  

  context.beginPath()
  context.arc(RedStone3.x,RedStone3.y,10,0, 2 * Math.PI)
    //add large red rock
    if (rockInBox(RedStone3))
        context.arc((RedStone3.x -600)*3, RedStone3.y*3, 30,0,  2 * Math.PI)
  context.fill()  

  //draw yellow rocks
  context.fillStyle = "yellow";
  context.beginPath()
  context.arc(yellowStone1.x,yellowStone1.y,10,0, 2 * Math.PI)
    //add large red rock
    if (rockInBox(yellowStone1))
        context.arc((yellowStone1.x -600)*3, yellowStone1.y*3, 30,0,  2 * Math.PI)
  context.fill()    
  
  context.beginPath()
  context.arc(YellowStone2.x,YellowStone2.y,10,0, 2 * Math.PI)
    //add large red rock
    if (rockInBox(YellowStone2))
        context.arc((YellowStone2.x -600)*3, YellowStone2.y*3, 30,0,  2 * Math.PI)
  context.fill()  
  
  context.beginPath()
  context.arc(YellowStone3.x,YellowStone3.y,10,0, 2 * Math.PI)
    //add large red rock
    if (rockInBox(YellowStone3))
        context.arc((YellowStone3.x -600)*3, YellowStone3.y*3, 30,0,  2 * Math.PI)
  context.fill()
  
  //draw speration line
  context.strokeStyle = "black";
  context.beginPath()
  context.moveTo(600,0)
  context.lineTo(600,800)
  context.closePath()
  context.stroke()

  //draw aiming line
  context.beginPath()
  context.moveTo(linepoint.startx,linepoint.starty)
  context.lineTo(linepoint.endx, linepoint.endy)
  context.closePath()
  context.stroke()


}
//fucntion to find the rock that is within the click
function findrock(x,y){

  for (let t of rocksArray){ // goes through all rocks and returns rock at givin location
      if((t.x - 20 <= x) && (t.x + 20 >= x) && (t.y - 20 <= y) && (t.y + 20 >= y)){
          //returns the object
          return (t);
      }
  }
  return null;
}

function handleMouseDown(e) {
  //get mouse location relative to canvas top left
  let rect = canvas.getBoundingClientRect()

  let canvasX = e.pageX - rect.left //use  event object pageX and pageY
  let canvasY = e.pageY - rect.top
  // console.log("mouse down: x- " + canvasX + ", y- " + canvasY) // Used for testing
  let rockBeingDrawn = findrock(canvasX,canvasY)

  if (rockBeingDrawn != null && !rockBeingDrawn.wasShot && player.role == rockBeingDrawn.colour) { // checks if user can throw found rock
	linepoint.startx = rockBeingDrawn.x
	linepoint.starty = rockBeingDrawn.y
	linepoint.endx = rockBeingDrawn.x
	linepoint.endy = rockBeingDrawn.y
	//attache mouse move and mouse up handlers
	$("#canvas1").mousemove(handleMouseMove)
	$("#canvas1").mouseup(handleMouseUp)
  }

  // Stop propagation of the event and stop any default
  //  browser action
  e.stopPropagation()
  e.preventDefault()

  drawCanvas()
}

function handleMouseMove(e) {

  //get mouse location relative to canvas top left
  let rect = canvas.getBoundingClientRect()
  let canvasX = e.pageX - rect.left
  let canvasY = e.pageY - rect.top

  //get distance from start point
  let xmove = canvasX  - linepoint.startx
  let ymove =  canvasY - linepoint.starty 
  
  linepoint.endx = linepoint.startx - xmove
  linepoint.endy = linepoint.starty - ymove
  
  let jsonString = JSON.stringify(linepoint)
  socket.emit('aimingLine', jsonString)

  e.stopPropagation()

  drawCanvas()
}

function handleMouseUp(e) {
    console.log("mouse up")

    shotObj.movingRock.xRock = linepoint.startx; // ensures rock is on desired path
    shotObj.movingRock.yRock = linepoint.starty; // ^
    shotObj.xAxisShot = linepoint.endx - linepoint.startx; // finds and sets power for both x and y
    shotObj.yAxisShot = linepoint.endy - linepoint.starty; // ^


    //clear aiming line
    linepoint.endx = 0
    linepoint.endy = 0
    linepoint.startx = 0
    linepoint.starty = 0

    let jsonString = JSON.stringify(linepoint) // send line to display (gone now that user has shot)

    //update the server with a new location of the moving box
    socket.emit('aimingLine', jsonString); // sends line update
    jsonString = JSON.stringify(shotObj);
    socket.emit('sendShot', jsonString);//sends shot made to server

    e.stopPropagation()

    //remove mouse move and mouse up handlers but leave mouse down handler
    $("#canvas1").off("mousemove", handleMouseMove); //remove mouse move handler
    $("#canvas1").off("mouseup", handleMouseUp);//remove mouse up handler


    drawCanvas() //redraw the canvas
}

function handleJoin(){
    socket.emit("roleUpdate",JSON.stringify({id: player.id, role: player.role, request: 'join'}))
    wantNotified = true;

}
function handleLeave(){
    socket.emit("roleUpdate",JSON.stringify({id: player.id, role: player.role, request: 'leave'}))
    wantNotified = true;
}

socket.on('aimingLine', function(data) {
  let locationData = JSON.parse(data) //simply get data and make linepoint = to data
  linepoint.endx = locationData.endx
  linepoint.endy = locationData.endy
  linepoint.startx = locationData.startx
  linepoint.starty = locationData.starty
  drawCanvas()
})

socket.on('roleUpdate', function(data) {
  player.id = (player.id == -1) ? data.id : player.id; //
  player.role = (player.id == data.id) ? data.role : player.role;
})

socket.on("sendShot",function (data) {
    // console.log("SHOT RECIVED: "+data);
    let recivedData = JSON.parse(data);
    let toMove = findrock(recivedData.movingRock.xRock,recivedData.movingRock.yRock);
    let prevRock = toMove;
    if (toMove != null && !toMove.wasShot) {
        toMove.wasShot = true;
        count = 0;
        for (let i = 0;i<102;i++){
          setTimeout(function () {
              toMove.x += recivedData.xAxisShot*7/102;
              toMove.y += recivedData.yAxisShot*7/102;
              /**  COLISION WITH WALLS  */
              if (toMove.x <= 613 || toMove.x >= 790){ // x axis boundries
                toMove.x = (toMove.x <= 613) ? 613 : 790; // set x to coorisponding boundry
                recivedData.xAxisShot *= (-1); // flip x direction
              }
              if (toMove.y <= 10 || toMove.y >= 640){ // y axis boundry
                toMove.y = (toMove.y <= 10) ? 10 : 640; // set y to corrisponding boundry
                recivedData.yAxisShot *= (-1); // flip y direction
              }
              /**  COLISION WITH ROCKS  */
              for (let t of rocksArray){ // loops through rocks
                let xDif = Math.abs(toMove.x-t.x); // finds difference in x
                let yDif = Math.abs(toMove.y-t.y); // finds difference in y
                //  if rock is not its-self, and is not the rock that hit it, and centers are within 20 pixles then colide
                if (toMove !== t  && prevRock !== t && (Math.pow(xDif,2) + Math.pow(yDif,2)) <= Math.pow(20,2)){
                  recivedData.xAxisShot = (t.x-toMove.x)*((102-i)/i); // velocity for new rock (speed rock is hit at affects new speed)
                  recivedData.yAxisShot = (t.y-toMove.y)*((102-i)/i); // ^
                  prevRock = toMove; // set rock that made collision
                  toMove = t; // set rock that has been hit as the new rock to move
                  // console.log(toMove); // for testing
                  break; // no need to continue search
                }
              }
              /**  Movement  */
              recivedData.xAxisShot *= 0.9975;
              recivedData.yAxisShot *= 0.9975;
              drawCanvas();
          },time);
          time += 10; //this will create a delay between frames to make an annimation

        }
        time = 0;
    }
    drawCanvas();
})

socket.on('roleUpdate', function(data) {
  let recivedData = JSON.parse(data);
  console.log("Testing old id: " + player.id)
  if (player.id === -1) { player.id = recivedData.id; player.role = recivedData.role; }//if first time connecting
  else if (player.id === recivedData.id){ player.role = recivedData.role; }//gets new role
  console.log(player.id +' '+player.role);

  if (wantNotified && recivedData.msg ) // player is notified only if they need to bw
      window.confirm(recivedData.msg);
  wantNotified = false;

  $("#joinG").prop('disabled', !(player.role == 'spec'));
  $("#leaveG").prop('disabled', (player.role == 'spec'));
})

$(document).ready(function() {
  //add mouse down listener to our canvas object
  $("#canvas1").mousedown(handleMouseDown)

  //timer = setInterval(handleTimer, 100) //tenth of second
 // pollingTimer = setInterval(pollingTimerHandler, 100) //quarter of a second
  //clearTimeout(timer) //to stop
  $("#leaveG").prop('disabled', true);
  drawCanvas()
})
