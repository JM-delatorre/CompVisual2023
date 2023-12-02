let kernel_shader, brightness_shader, image, kernel, brightness;

function preload() {
  image = loadImage('./assets/images/cave.jpeg');
  kernel_shader = loadShader('./assets/shaders/kernel.vert', './assets/shaders/kernel.frag');
  brightness_shader = loadShader('./assets/shaders/kernel.vert', './assets/shaders/brightness.frag');
}

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();

  image.resize(600, 600);
  image.loadPixels();

  brightness = 1;
  kernel = [
    0, 0, 0, 0, 0,
    0, -2, 0, -2, 0,
    0, 0, 9, 0, 0,
    0, -2, 0, -2, 0,
    0, 0, 0, 0, 0
  ];
}

function draw() {
  // kernel_shader.setUniform('uTexture', image);
  // kernel_shader.setUniform('uKernel', kernel);
  // kernel_shader.setUniform('uStepSize', [1 / width, 1 / height]);
  // kernel_shader.setUniform('uDistance', 1);
  // shader(kernel_shader);

  brightness_shader.setUniform('uTexture', image);
  brightness_shader.setUniform('uBrightness', brightness);
  shader(brightness_shader);

  push();
  translate(-width / 2, -height / 2);
  rect(0, 0, width, height);
  pop();
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) {
    brightness -= 0.1;
    console.log(brightness);
  }
  if (keyCode === RIGHT_ARROW) {
    brightness += 0.1;
    console.log(brightness);
  }
}
