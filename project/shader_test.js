let kernel_shader, image, kernel;

function preload() {
  image = loadImage('./assets/images/cave.jpeg');
  kernel_shader = loadShader('./assets/shaders/kernel.vert', './assets/shaders/kernel.frag');
}

function setup() {
  createCanvas(600, 600, WEBGL);
  noStroke();

  image.resize(600, 600);
  image.loadPixels();

  kernel = [
    0, 0, 0, 0, 0,
    0, -2, 0, -2, 0,
    0, 0, 9, 0, 0,
    0, -2, 0, -2, 0,
    0, 0, 0, 0, 0
  ];
}

function draw() {
  kernel_shader.setUniform('uTexture', image);
  kernel_shader.setUniform('uKernel', kernel);
  kernel_shader.setUniform('uStepSize', [1 / width, 1 / height]);
  kernel_shader.setUniform('uDistance', 1);
  shader(kernel_shader);

  push();
  translate(-width / 2, -height / 2);
  rect(0, 0, width, height);
  pop();
}
