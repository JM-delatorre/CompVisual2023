let gl, camera, testComparator, shapes = [];

let algorithm = 0, message_alpha = 255;

function setup() {
  createCanvas(640, 480, WEBGL);
  camera = createCamera();

  gl = this._renderer.GL;

  for (let i = -2; i < 2; i++) {
    for (let j = -2; j < 2; j++) {
      for (let k = -2; k < 2; k++) {
        createPyramid(75 * i, 75 * j, 75 * k);
      }
    }
  }

  // Comparator function for Painter's algorithm
  testComparator = (a, b) => {
    let aMaxDepth = max(dist(camera.eyeX, camera.eyeY, camera.eyeZ, a.p1.x, a.p1.y, a.p1.z),
                        dist(camera.eyeX, camera.eyeY, camera.eyeZ, a.p2.x, a.p2.y, a.p2.z),
                        dist(camera.eyeX, camera.eyeY, camera.eyeZ, a.p3.x, a.p3.y, a.p3.z)); // Calculate maximum depth of shape a

    let bMaxDepth = max(dist(camera.eyeX, camera.eyeY, camera.eyeZ, b.p1.x, b.p1.y, b.p1.z),
                        dist(camera.eyeX, camera.eyeY, camera.eyeZ, b.p2.x, b.p2.y, b.p2.z),
                        dist(camera.eyeX, camera.eyeY, camera.eyeZ, b.p3.x, b.p3.y, b.p3.z)); // Calculate maximum depth of shape b

    return bMaxDepth - aMaxDepth; // Return the difference in maximum depths
  };

  noStroke();

  // Create a separate 2D canvas for the message
  messageCanvas = createGraphics(640, 480);
  messageCanvas.position(0, 0);  
  messageCtx = messageCanvas.drawingContext;
}

function draw() {
  background(0);
  orbitControl();

  if (algorithm === 1) {
    shapes.sort(testComparator); // Sort shapes based on depth if Painter's algorithm is enabled
  }

  shapes.forEach(s => s.show());

  // Display message
  messageCanvas.clear();
  messageCtx.fillStyle = `rgba(255, 255, 255, ${message_alpha / 255})`;
  messageCtx.font = '20px sans-serif';
  messageCtx.textAlign = 'center';
  let message = algorithm === 0 ? "Z-buffer algorithm" : algorithm === 1 ? "Painter's algorithm" : "No sorting";
  messageCtx.fillText(message, width / 2, 30);

  // Fade out message
  if (message_alpha > 0) {
    message_alpha -= 1.5;
  }

  // Draw the message canvas on top of the 3D canvas
  push();
  rotateY(atan2(camera.eyeX, camera.eyeZ)); // Rotate message canvas to face the camera
  image(messageCanvas, -width/2, -height/2 + 40);
  pop();
}

function keyPressed() {
  if (key === ' ') {
    algorithm = (algorithm + 1) % 3;
    if (algorithm === 0) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    // Reset message alpha
    message_alpha = 255;
  }
}

function createPyramid(x, y, z) {
  let p1 = createVector(x + random(75), y + random(75), z);
  let p2 = createVector(x + 10 + random(75), y + 10 + random(75), z);
  let p3 = createVector(x + random(75), y + 10 + random(75), z);
  let p4 = createVector(x + random(75), y + random(75), z + 1 + random(75));

  let face1 = new PyramidFace(p1, p2, p3);
  let face2 = new PyramidFace(p1, p2, p4);
  let face3 = new PyramidFace(p1, p3, p4);
  let face4 = new PyramidFace(p2, p4, p3);

  shapes.push(face1, face2, face3, face4);
}

class PyramidFace {
  constructor(p1, p2, p3) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.col = color(random(255), random(255), random(255))
  }

  show() {
    fill(this.col);
    beginShape();
    vertex(this.p1.x, this.p1.y, this.p1.z);
    vertex(this.p2.x, this.p2.y, this.p2.z);
    vertex(this.p3.x, this.p3.y, this.p3.z);
    endShape(CLOSE);
  }
}