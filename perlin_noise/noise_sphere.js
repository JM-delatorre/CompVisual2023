// Set the canvas width and height
const CANVAS_WIDTH = 500, CANVAS_HEIGHT = 500;

// Declare global variables
let cols, rows, terrain, font;
let scale = 12, fly = 0;
let print_lines = false, show_controls = true, pause = false;

// Load the font file before setup
function preload() {
  font = loadFont('monserrat.ttf');
}

function setup() {
  // Create a canvas with WEBGL renderer
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT, WEBGL);

  // Calculate the number of columns and rows based on the canvas size and scale
  cols = floor(width / scale);
  rows = floor(height / scale);
}

function draw() {
  // Set the background color
  background(0, 0, 128);
  
  // If the controls are being shown, show the controls and return
  if (show_controls) {
    showControls();
    return;
  }
  // Otherwise, show the sphere
  else {
    showSphere(150);
  }
}

/**
 * Used to show the sphere
 * @param {number} radius - The radius of the sphere
 */
function showSphere(radius) {
  // Enable orbit control for the camera
  orbitControl();

  // Calculate closest point on sphere to mouse
  let closestPoint = getClosestPointOnSphere(mouseX - width / 2, mouseY - height / 2, radius + 20);

  // Set the ambient and point lights
  ambientLight(255);
  pointLight(255, 0, 0, closestPoint.x, closestPoint.y, closestPoint.z);

  // If the game is not paused, update the fly value
  if (!pause) {
    fly -= 0.02;
  }

  // Construct the sphere
  constructSphere(radius);

  // Draw the terrain
  drawTerrain(0, 0);
}

/**
 * Used to construct the sphere
 * @param {number} radius - The radius of the sphere
 */
function constructSphere(radius) {
  // Initialize the terrain array
  terrain = [];

  // Loop through each row and column
  for (let y = 0; y <= rows; y++) {
    let vertices = [];
    let lat = map(y, 0, rows, -HALF_PI, HALF_PI);
    for (let x = 0; x <= cols; x++) {
      let lon = map(x, 0, cols, -PI, PI);

      // Calculate the x, y, and z coordinates of the vertex
      let xCoord = radius * sin(lon) * cos(lat);
      let yCoord = radius * sin(lon) * sin(lat);
      let zCoord = radius * cos(lon);
      let v = createVector(xCoord, yCoord, zCoord);

      // Add noise to the vertex
      let noise_val = noise(xCoord + fly, yCoord + fly, zCoord + fly);
      v.mult(0.8 + noise_val);

      // Add the vertex to the vertices array
      vertices.push(v);
    }
    // Add the vertices array to the terrain array
    terrain.push(vertices);
  }
}

/**
 * Used to draw the terrain
 * @param {number} x - The x position of the terrain
 * @param {number} y - The y position of the terrain
 */
function drawTerrain(x, y) {
  // Push the current transformation matrix onto the stack
  push();

  // Set the stroke and fill colors
  if (!print_lines)  noStroke();
  translate(x, y);
  fill(128, 0, 128);
  ambientMaterial(128, 0, 128);
  
  // Loop through each row and draw the triangle strip
  for (let y = 0; y < rows; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x <= cols; x++) {
      let v1 = terrain[y][x];
      let v2 = terrain[y + 1][x];
      vertex(v1.x, v1.y, v1.z);
      vertex(v2.x, v2.y, v2.z);
    }
    endShape();
  }

  // Pop the transformation matrix from the stack
  pop();
}

/**
 * Used to show the controls of the game
 */
function showControls() {
  // Calculate the position and size of the rectangle
  let margin = 50;
  let rectWidth = CANVAS_WIDTH - margin * 2;
  let rectHeight = CANVAS_HEIGHT - margin * 2;
  let x = -rectWidth / 2;
  let y = -rectHeight / 2;
  
  // Push the current transformation matrix onto the stack
  push();

  // Set the fill color and draw the rectangle
  fill(0, 0, 0, 200);
  rect(x, y, rectWidth, rectHeight);
  
  // Set the text color and alignment
  fill(255);
  textAlign(CENTER, CENTER);

  // Draw the title
  textSize(rectHeight * 0.1);
  textFont(font);
  text("Controls", 0, y + rectHeight * 0.1);

  // Draw the rules
  textSize(rectHeight * 0.05);
  text("1. Use the mouse to place new cells", 0, y + rectHeight * 0.25);
  text("2. Press space to start the game", 0, y + rectHeight * 0.35);
  text("3. Use the key 'R' or ENTER to restart", 0, y + rectHeight * 0.45);
  text("4. Use the key 'F' to show/hide strips lines", 0, y + rectHeight * 0.55);
  text("5. Use the key 'P' to pause the game", 0, y + rectHeight * 0.65);

  // Draw the call to action
  textSize(rectHeight * 0.1);
  text("Game of Life", 0, y + rectHeight * 0.9);

  // Pop the transformation matrix from the stack
  pop();
}

/**
 * Used to get the closest point on a sphere to a given point
 * @param {number} x - The x position of the point
 * @param {number} y - The y position of the point
 * @param {number} radius - The radius of the sphere
 * @returns {p5.Vector} - The closest point on the sphere as a vector
 */
function getClosestPointOnSphere(x, y, radius) {
  // Calculate the distance and angle from the mouse to the center of the sphere
  let distance = sqrt(x * x + y * y);
  let angle = atan2(y, x);

  // Calculate the closest point on the sphere
  let closestX = radius * cos(angle + radians(rotationY));
  let closestY = radius * sin(angle + radians(rotationY));
  let closestZ = sqrt(radius * radius - distance * distance);

  // Return the closest point as a vector
  return createVector(closestX, closestY, closestZ);
}

function keyPressed() {
  // If the space key is pressed and the controls are being shown, hide the controls
  if (keyCode == 32 && show_controls) show_controls = false;

  // If the 'P' key is pressed, toggle the pause state
  if (keyCode == 'P'.charCodeAt(0)) pause = !pause;

  // If the 'F' key is pressed, toggle the print_lines state
  if (keyCode == 'F'.charCodeAt(0)) print_lines = !print_lines;
}