const CANVAS_WIDTH = 700, CANVAS_HEIGHT = 350;
const { Engine, World, Mouse, MouseConstraint, Events, Body } = Matter;

let engine, world, mouseConstraint;

let bird, slingshot;
let borders = [], boxes = [], enemies = [], explosions = [];
let images = new Map();

let show_controls = true;

function preload() {
  // Define the images to load
  let imageList = [
    { name: 'background', path: 'assets/background.png' },
    { name: 'floor', path: 'assets/long-grass.png' },
    { name: 'red', path: 'assets/red.png' },
    { name: 'chuck', path: 'assets/chuck.png' },
    { name: 'bomb', path: 'assets/bomb.png' },
    { name: 'pig', path: 'assets/pig.png' },
    { name: 'armored', path: 'assets/armored-pig.png' },
    { name: 'tnt', path: 'assets/tnt.png' },
    { name: 'stone', path: 'assets/stone.png' },
    { name: 'wood', path: 'assets/wood.png' },
    { name: 'glass', path: 'assets/glass.png' },
    { name: 'slingshot_left', path: 'assets/slingshot-left.png' },
    { name: 'slingshot_right', path: 'assets/slingshot-right.png' },
    { name: 'slingshot_full', path: 'assets/slingshot.png' }
  ];

  // Load the images into the map
  for (let image of imageList) {
    images.set(image.name, loadImage(image.path));
  }
}


function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

  engine = Engine.create();
  world = engine.world;

  const mouse = Mouse.create(canvas.elt);
  mouse.pixelRatio = pixelDensity();

  mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    collisionFilter: { mask: 2 }
  });
  World.add(world, mouseConstraint);

  eventsConfig();
  initEntities();

  if (show_controls) bird.body.collisionFilter.category = 1;
}


function draw() {
  background(128);
  Engine.update(engine);

  image(images.get('background'), 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  slingshot.show();
  bird.show();
  slingshot.show_upper();
  
  borders.forEach((border) => border.show());
  boxes.forEach((box) => box.show());
  enemies.forEach((enemy) => enemy.show());

  if (show_controls) {
    showControls();
    return;
  }
}

/**
 * Select a random bird from the available birds
*/
function selectBird() {
  availableBirds = ['red', 'chuck', 'bomb'];
  selectedBird = availableBirds[Math.floor(Math.random() * availableBirds.length)];
  return selectedBird;
}

/**
 * Initialize the game entities
*/
function initEntities() {
  bird = new Bird(width / 5, height - 120, 25, 5, { texture: images.get(selectBird()) });
  slingshot = new SlingShot(bird, {
    upper_texture: images.get('slingshot_left'),
    lower_texture: images.get('slingshot_right')
  });

  // Create the ground and borders to avoid objects flying away
  const borders_properties = [
    { x: width / 2, y: height + 2, width: width, height: 40, options: { texture: images.get('floor') } }, // Floor
    { x: -20, y: height / 2 - 100, width: 40, height: height + 200 }, // Left wall
    { x: width + 20, y: height / 2 - 100, width: 40, height: height + 200 }, // Right wall
    { x: width / 2, y: -220, width: width, height: 40, options: { texture: images.get('floor') } }, // Ceiling
  ];

  borders_properties.forEach((border) => {
    borders.push(new Ground(border.x, border.y, border.width, border.height, border.options));
  });

  // Set the default map
  defaultMap();
}

function defaultMap() {
  const center = createVector(width / 5 * 4, height - 41);
  const enemies_properties = [
    { x: center.x, y: center.y, rad: 20, mass: 5, health: 2, options: { texture: images.get('pig') } },
    { x: center.x, y: center.y - 60, rad: 15, mass: 3, health: 10, options: { texture: images.get('armored') } },
    { x: center.x - 140, y: center.y - 40, rad: 15, mass: 3, health: 10, options: { texture: images.get('armored') } },
  ];
  const boxes_properties = [
    { x: center.x - 110, y: center.y, width: 40, height: 40, health: 80, options: { border_texture: images.get('stone') } },
    { x: center.x + 110, y: center.y, width: 40, height: 40, health: 80, options: { border_texture: images.get('stone') } },
    { x: center.x - 70, y: center.y, width: 40, height: 40, health: 45, options: { border_texture: images.get('wood') } },
    { x: center.x + 70, y: center.y, width: 40, height: 40, health: 45, options: { border_texture: images.get('wood'), internal_texture: images.get('tnt'), can_explode: true } },
    { x: center.x - 40, y: center.y, width: 20, height: 60, health: 15, options: { border_texture: images.get('glass') } },
    { x: center.x + 40, y: center.y, width: 20, height: 60, health: 15, options: { border_texture: images.get('glass') } },
    { x: center.x, y: center.y - 42, width: 120, height: 20, health: 80, options: { border_texture: images.get('stone') } },
    { x: center.x - 40, y: center.y - 61, width: 40, height: 40, health: 45, options: { border_texture: images.get('wood') }, internal_texture: images.get('pig') },
    { x: center.x + 40, y: center.y - 61, width: 40, height: 40, health: 45, options: { border_texture: images.get('wood') } },
    { x: center.x - 150, y: center.y, width: 40, height: 40, health: 15, options: { border_texture: images.get('glass'), internal_texture: images.get('tnt'), can_explode: true } },
  ];

  enemies_properties.forEach((enemy) => {
    enemies.push(new Enemy(enemy.x, enemy.y, enemy.rad, enemy.mass, enemy.health, enemy.options));
  });

  boxes_properties.forEach((box) => {
    boxes.push(new Block(box.x, box.y, box.width, box.height, box.health, box.options));
  });
}

function clearMap() {
  enemies.forEach((enemy) => {
    World.remove(world, enemy.body);
  });
  enemies = [];

  boxes.forEach((box) => {
    World.remove(world, box.body);
  });
  boxes = [];

  explosions = [];
}

function restart() {
  World.remove(world, bird.body);
  bird = new Bird(width / 5, height - 120, 25, 5, { texture: images.get(selectBird()) });
  slingshot.attach(bird);

  clearMap();
  defaultMap();
}

function switchBuildMode() {
  build_mode = !build_mode;

  build_mode && slingshot.hasBird() ? bird.body.collisionFilter.category = 1 : bird.body.collisionFilter.category = 2;
}

/**
 * Used to show the controls of the game
 */
function showControls() {
  fill(0, 0, 0, 200);
  rect(CANVAS_WIDTH * 0.1, CANVAS_HEIGHT * 0.1, CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.8);

  fill(255);
  textAlign(CENTER, CENTER);

  // Title
  textSize(CANVAS_HEIGHT * 0.06);
  text("Controls", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - CANVAS_HEIGHT * 0.3);

  // Rules
  textSize(CANVAS_HEIGHT * 0.04);
  text("1. Use the mouse to move the bird", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - CANVAS_HEIGHT * 0.1);
  text("2. Press space to start the game", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - CANVAS_HEIGHT * 0.05);
  text("3. Use the key 'R' to restart", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 );
  text("4. Use the key 'C' to pclear the map", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + CANVAS_HEIGHT * 0.05);

  // Call to action
  textSize(CANVAS_HEIGHT * 0.06);
  text("Angry Birds", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + CANVAS_HEIGHT * 0.3);
}

/**
 * Set the MatterJS required events configuration
*/
function eventsConfig() {
  Events.on(engine, 'collisionStart', function (event) {
    var pairs = event.pairs;

    pairs.forEach(function (pair) {
      const { bodyA, bodyB } = pair;

      if (bodyA.label === 'damageable') {
        bodyA.entity.hit(bodyB.entity);
      }

      if (bodyB.label === 'damageable') {
        bodyB.entity.hit(bodyA.entity);
      }
    });
  });

  Events.on(engine, 'beforeUpdate', function (event) {
    explosions.forEach(function (explosion) {
      boxes.forEach(function (box) {
        explosion.applyForce(box);
      });
      enemies.forEach(function (enemy) {
        explosion.applyForce(enemy);
      });

      explosion.applyForce(bird);
      explosion.update();
    });

    boxes.forEach(function (box) {
      if (box.damage_delay > 0) {
        box.damage_delay -= event.delta;
      }
    });

    enemies.forEach(function (enemy) {
      if (enemy.damage_delay > 0) {
        enemy.damage_delay -= event.delta;
      }
    });
  });

  Events.on(engine, 'afterUpdate', function () {
    slingshot.fly(mouseConstraint);
  });
}

function keyPressed() {
  if (keyCode === 82) restart(); // R
  else if (keyCode === 32) { // SPACE
    show_controls = false; 
    bird.body.collisionFilter.category = 2;
  }
  else if (keyCode === 67) clearMap(); // C
}