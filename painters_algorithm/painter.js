let gl, camera, shapes = [];

let algorithm = 0, message_alpha = 255;

function setup() {
  createCanvas(640, 480, WEBGL);
  camera = createCamera();

  gl = this._renderer.GL;

  /*
  for (let i = -2; i < 2; i++) {
    for (let j = -2; j < 2; j++) {
      for (let k = -2; k < 2; k++) {
        createPyramid(75 * i, 75 * j, 75 * k);
      }
    }
  }
  */

  createPyramid(0, 0, 0);

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
    shapes.sort(testComparator);
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
  image(messageCanvas, -width / 2, -height / 2 + 40);
  pop();
}

/**
 * Comparator function for the Painter's algorithm
 * @param {PyramidFace} s
 * @param {PyramidFace} p
 * @returns {number}
*/
function testComparator(s, p) {
  // Test case 0: Z_min of S < Z_max of p (no overlap in Z)
  let [s_z_min, s_z_max] = minMax(s);
  let [p_z_min, p_z_max] = minMax(p);

  if (s_z_min > p_z_max) return -1;
  else if (p_z_min > s_z_max) return 1;

  // Overlap in Z, so more tests are needed, all of them must be false to reorder the shapes
  let [s_x_min, s_x_max] = minMax(s, 'x');
  let [s_y_min, s_y_max] = minMax(s, 'y');

  let [p_x_min, p_x_max] = minMax(p, 'x');
  let [p_y_min, p_y_max] = minMax(p, 'y');

  const s_points = [s.p1, s.p2, s.p3];
  const p_points = [p.p1, p.p2, p.p3];

  // Test case 1: The bounding rectangle of the two surfaces do not overlap
  if (!checkPartialOverlap(s_x_min, s_x_max, p_x_min, p_x_max) || 
      !checkPartialOverlap(s_y_min, s_y_max, p_y_min, p_y_max)) {
    return -1;
  }
  else if (!checkPartialOverlap(p_x_min, p_x_max, s_x_min, s_x_max) || !checkPartialOverlap(p_y_min, p_y_max, s_y_min, s_y_max)) {
    return 1;
  }

  // Test case 2: The surface S is completely outside the plane XY of P
  if (checkShapeInPlane(s_points, p_points, 'outside')) {
    return -1;
  }
  else if (checkShapeInPlane(p_points, s_points, 'outside')) {
    return 1;
  }

  // Test case 3: The surface P is completely inside the plane XY of S
  if (checkShapeInPlane(p_points, s_points, 'inside')) {
    return -1;
  }
  else if (checkShapeInPlane(s_points, p_points, 'inside')) {
    return 1;
  }

  // Test case 4: The boundary edge projection over the view plane of both surfaces do not overlap
  if (!doPolygonsIntersect(s_points, p_points)) {
    return -1;
  }
  else if (!doPolygonsIntersect(p_points, s_points)) {
    return 1;
  }

  // If none of the tests determined the order, return 0
  return -1;
}

function doPolygonsIntersect(a, b) {
  var polygons = [a, b];
  var projectedA, projectedB, i, i1, j;

  for (i = 0; i < polygons.length; i++) {

    // for each polygon, look at each edge of the polygon, and determine if it separates
    // the two shapes
    var polygon = polygons[i];
    for (i1 = 0; i1 < polygon.length; i1++) {

      // grab 2 vertices to create an edge
      var i2 = (i1 + 1) % polygon.length;
      var p1 = polygon[i1];
      var p2 = polygon[i2];

      // find the line perpendicular to this edge
      var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

      // for each vertex in the first shape, project it onto the line perpendicular to the edge
      // and keep track of the min and max of these values
      projectedA = a.map(function(point) {
        return normal.x * point.x + normal.y * point.y;
      });
      var [minA, maxA] = minMax(projectedA);

      // for each vertex in the second shape, project it onto the line perpendicular to the edge
      // and keep track of the min and max of these values
      projectedB = b.map(function(point) {
        return normal.x * point.x + normal.y * point.y;
      });
      var [minB, maxB] = minMax(projectedB);

      // if there is no overlap between the projects, the edge we are looking at separates the two
      // polygons, and we know there is no overlap
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Check if two rects are partially obscured by each other
 * @param {number} min1
 * @param {number} max1
 * @param {number} min2
 * @param {number} max2
 * @returns {boolean}
*/
function checkPartialOverlap(min1, max1, min2, max2) {
  return max1 > min2 && max1 < max2 || min1 > min2 && min1 < max2;
}

/**
 * Check if a shape is inside a plane with the Nomral vector pointing away from the camera
 * @param {p5.Vector[]} shape
 * @param {p5.Vector[3]} plane
 * @param {string} position - 'outside' or 'inside'
 * @returns {boolean}
*/ 
function checkShapeInPlane(shape, plane, position = 'outside') {
  let [a, b, c, d] = getPlaneEquation(plane);

  // Get normal vector of the plane
  let normal = getNormalVector(a, b, c, plane[0]);

  // Check if all points of the shape are inside the plane
  for (let i = 0; i < shape.length; i++) {
    let point = shape[i];
    
    if (position === 'inside') {
      // Check if the point is inside the plane
      if (p5.Vector.dot(normal, point) + d < 0) {
        return false;
      }
    } else {
      // Check if the point is outside the plane
      if (p5.Vector.dot(normal, point) + d > 0) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Obtains the normal vector of a plane that points away from the camera
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {p5.Vector} point
 * @returns {p5.Vector}
*/
function getNormalVector(a, b, c, point) {
  let normal = createVector(a, b, c);
  const cameraPosition = createVector(camera.eyeX, camera.eyeY, camera.eyeZ);

  // Create vector from a point on the plane to the camera
  let vecToCam = createVector(cameraPosition.x - point.x, cameraPosition.y - point.y, cameraPosition.z - point.z);

  // Check if normal is pointing towards the camera
  if (p5.Vector.dot(normal, vecToCam) > 0) {
    // Flip normal
    normal.mult(-1);
  }

  return normal;
}

/**
 * Obtains the equation of a plane from three points
 * @param {p5.Vector[]} points
 * @returns {number[]}
*/
function getPlaneEquation(points) {
  if (typeof points === 'undefined' || points.length < 3) {
    console.log(points);
    throw new Error('Invalid number of points');
  }

  let p1 = points[0];
  let p2 = points[1];
  let p3 = points[2];

  let a = (p2.y - p1.y) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.y - p1.y);
  let b = (p2.z - p1.z) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.z - p1.z);
  let c = (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  let d = -a * p1.x - b * p1.y - c * p1.z;

  return [a, b, c, d];
}

/**
 * Auxiliar function to calculate the min value of three numbers
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
*/
function min(a, b, c) {
  return Math.min(a, Math.min(b, c));
}

/**
 * Auxiliar function to calculate the max value of three numbers
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
*/
function max(a, b, c) {
  return Math.max(a, Math.max(b, c));
}

/**
 * Auxiliar function to calculate the min and max values of a triangle
 * User can define the axis to calculate the values
 * @param {PyramidFace} triangle
 * @param {string} axis
 * @returns {number[]}
*/
function minMax(triangle, axis = 'z') {
  let min_value, max_value;

  // Translate from global coordinates to camara coordinates
  let p1 = worldToCamara(triangle.p1, camera);
  let p2 = worldToCamara(triangle.p2, camera);
  let p3 = worldToCamara(triangle.p3, camera);

  switch (axis) {
    case 'x':
      min_value = min(p1.x, p2.x, p3.x);
      max_value = max(p1.x, p2.x, p3.x);
      break;
    case 'y':
      min_value = min(p1.y, p2.y, p3.y);
      max_value = max(p1.y, p2.y, p3.y);
      break;
    case 'z':
      min_value = min(p1.z, p2.z, p3.z);
      max_value = max(p1.z, p2.z, p3.z);
      break;
  }

  return [min_value, max_value];
}

/**
 * Translates a vector from world coordinates to camera coordinates
 * @param {p5.Vector} vector
 * @param {p5.Camera} camera
 * @returns {p5.Vector}
*/
function worldToCamara(vector, camera) {
  let x = vector[0] - camera.eyeX;
  let y = vector[1] - camera.eyeY;
  let z = vector[2] - camera.eyeZ;

  return createVector(x, y, z);
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