/*
Case 2 key
n = 4
#define lengthFactor 0.6 
#define angle1 25 
#define angle2 30 

ω : F(100)
p1 : F(l) : * → F(l * lengthFactor) [+(angle1)F(l * lengthFactor)] [-(angle2)F(l * lengthFactor)]
*/

/*
Case 3 key
n = 5
#define lengthFactor 0.7 
#define angle1 25 
#define angle2 30 
#define wr 0.707 

ω : F(100)
p1 : F(l,w) : * → !(w)F(l * lengthFactor) [&(angle1)B(l,w)]/(180)[&(angle2)B(l,w)]
p2 : B(l,w) : * → !(w)F(l * lengthFactor) [+(angle1)$B(l,w)][-(angle2)$B(l,w)]
*/
let message;
let angle;
let lengthFactor; 
let angle1_cf3;
let angle2_cf3;
let wr;
let caseKey;
let n ;
let w = 20

function keyPressed() {
  // Check which key was pressed
  switch (key) {
    case '1':
      // Code to execute for key 1
      angle = 40
      lengthFactor = 0.7
      n = 3
      caseKey= 1;
      console.log('Key 1 pressed');
      break;
    case '2':
      angle = 30
      lengthFactor = 0.7
      n = 1
      caseKey= 2;
      console.log('Key 2 pressed');
      break;
    case '3':
      angle = random(10,50)
      lengthFactor = 0.7
      n = 1
      caseKey= 3;
      console.log('Key 3 pressed');
      break;
    default:
      // Code for other keys if needed
      break;
  }
}
function setup() {

//rules for tree 2
createCanvas(windowWidth, windowHeight, WEBGL)
angleMode(DEGREES)

box(100, 0, 100, 100);
  message = createP('Press keys 1, 2 or Press 3 several times and watch some changes)');
  
    message.style('font-size', '90px');  // Set the font size
  message.style('text-align', 'center');  // Center the text
  message.position(windowWidth / 2 - message.width / 2, 10);
   message.style('color', 'white');  // Set the text color to blue
  
}
 //noLoop()

function draw() { 
  background (200)

  translate(0, 200, 0)
  //orbitControl()
  //axes()
  rotateY(frameCount)

  createBranch(150)



}

function createBranch (len) {
strokeWeight(map(len,10,100,0.5,10))
stroke(70,40,20)
line(0, 0, 0, 0, -len, 0)

translate(0, -len, 0)

if (len >= 10 ) {

  for (var i =0; i < n; i++) {
    
    if (caseKey ===1){
    
    rotateY(angle+80)

    push()

    rotateZ(angle-10)

    createBranch(len * 0.7)
    pop()
    w = 20
    }
    
    else if(caseKey===2){
    rotateY(angle)
    push()
    rotateZ(angle)
    createBranch(len*lengthFactor)
    pop()
    rotateY(angle)
    push()
    rotateZ(angle)
    createBranch(len*lengthFactor)
    pop()
    rotateZ(-angle)
    push()
    rotateY(-angle)
    createBranch(len*lengthFactor)
    pop()
    w = 20
    }
    else if (caseKey ===3){
    
    
    push();
    rotateY(angle);
    rotateZ(angle);
    createBranch(len * 0.78)
    pop();

    push();
    rotateZ(-angle);
    rotateX(-angle);
    createBranch(len * 0.78)
    
    pop();

    
    
    }

  
    
  }
    
    len = len-13
  }
  else if (len<10){
  fill(80+random(-20,20),120+random(-20,20),random(-20,20))
  noStroke()
  translate(5,0,0)
  rotateZ(90)
  beginShape()
  for (var i = 45; i<135;i++){
  var rad = 7
  var x = rad*cos(i)
  var y = rad*sin(i)
  vertex(x,y)
  }
  for (var i = 135; i>45;i--){
  var rad = 7
  var x = rad*cos(i)
  var y = rad*sin(-i)+10
  vertex(x,y)
  }
  endShape(CLOSE)
  }
}
function axes() {
  push();

  // X-Axis
  //strokeWeight(4);
  stroke(255, 0, 0);
  fill(255, 0, 0);
  line(0, 0, 0, 100, 0, 0);//horizontal red X-axis line

  // Y-Axis
  stroke(255, 255, 0);
  fill(0, 255, 255);
  line(0, 0, 0, 0, 100, 0);//vertical blue Y-axis line

  // Z-Axis
  stroke(0, 0, 255);
  fill(0, 0, 255);
  line(0, 0, 0, 0, 0, 100);//vertical blue Y-axis line
  
  pop();
}
