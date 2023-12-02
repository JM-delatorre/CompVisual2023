// Defining the kernels to apply to the set of images
let masks = [
  ['Original', [
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 1, 0, 0,
    0, 0, 0, 0, 0,
    0, 0, 0, 0, 0]],
  ['Desenfoque Gausiano', [
    0, 0, 0, 0, 0,
    0, 1 / 16, 1 / 8, 1 / 16, 0,
    0, 1 / 8, 1 / 4, 1 / 8, 0,
    0, 1 / 16, 1 / 8, 1 / 16, 0,
    0, 0, 0, 0, 0]],
  ['Detección de bordes', [
    0, 0, 0, 0, 0,
    0, -1, -1, -1, 0,
    0, -1, 8, -1, 0,
    0, -1, -1, -1, 0,
    0, 0, 0, 0, 0]],
  ['Desenfoque de caja', [
    0, 0, 0, 0, 0,
    0, 1 / 9, 1 / 9, 1 / 9, 0,
    0, 1 / 9, 1 / 9, 1 / 9, 0,
    0, 1 / 9, 1 / 9, 1 / 9, 0,
    0, 0, 0, 0, 0]],
  ['Detección horizontal', [
    0, 0, 0, 0, 0,
    0, -3, 0, 3, 0,
    0, -10, 0, 10, 0,
    0, -3, 0, 3, 0,
    0, 0, 0, 0, 0]],
  ['Agudeza', [
    0, 0, 0, 0, 0,
    0, 0, -1, 0, 0,
    0, -1, 5, -1, 0,
    0, 0, -1, 0, 0,
    0, 0, 0, 0, 0]],
  ['Detección vertical', [
    0, 0, 0, 0, 0,
    0, -3, -10, -3, 0,
    0, 0, 0, 0, 0,
    0, 3, 10, 3, 0,
    0, 0, 0, 0, 0]],
  ['Operador de Sobel', [
    0, 0, 0, 0, 0,
    0, -1, -2, -1, 0,
    0, 0, 0, 0, 0,
    0, 1, 2, 1, 0,
    0, 0, 0, 0, 0]]
  //['Personalizado', [
  //  0, 0, 0, 0, 0,
  //  0, 0, 0, 0, 0,
  //  0, 0, 1, 0, 0,
  //  0, 0, 0, 0, 0,
  //  0, 0, 0, 0, 0]]
];

// Adding an array of images so new ones can be added in excecution time
const ORIGINAL_IMAGES = [
  './assets/images/hero.jpeg',
  './assets/images/cave.jpeg',
  './assets/images/figth.jpeg',
  './assets/images/rain.jpeg',
  './assets/images/sword.jpeg',
];
let loaded_images = [];
let current_image;

// Defining the required global variables for selected image, kernel and histogram
let show_histogram = true;
let histogram_changed = true;
let mask_changed = true;
let local_mode = false;
let selected_mask = 0;
let selected_image = 0;
let selected_histogram = 4;
let kernel_shader;
let brightness_shader;
let brightness = 1;

// Defining other global variables
const CANVAS_SIZE = 400;
const HISTOGRAM_HEIGHT = 200;
const FILES_ZONES_HEIGHT = 100;
let FONT;
let mask_title;
let histogram_title;
let masking_canvas;
let histogram_canvas;
let histograms = [];

/**
 * Used to initialize the relevant variables before the setup function
 * The mask title is the first mask in the map
*/
function preload() {
  FONT = loadFont("./assets/fonts/Lato-Regular.ttf");

  for (let i = 0; i < ORIGINAL_IMAGES.length; i++) {
    // Load each image path, resize it to a square of the CANVAS_SIZE and add it to the loaded_images array
    loaded_images.push(loadImage(ORIGINAL_IMAGES[i]));
  }
}

/**
 * Used to create the canvas for the mask and the canvas for the histogram below the fist one,
 * then load the selected image to the masking canvas
*/
function setup() {
  createCanvas(CANVAS_SIZE, CANVAS_SIZE + HISTOGRAM_HEIGHT);
  pixelDensity(1);

  // Create the masking canvas
  masking_canvas = createGraphics(CANVAS_SIZE, CANVAS_SIZE);
  masking_canvas.position(0, 0);
  masking_canvas.pixelDensity(1);
  let input_file = createFileInput(handleFile);
  input_file.position(10, CANVAS_SIZE + HISTOGRAM_HEIGHT + 30);


  // Create the histogram canvas
  histogram_canvas = createGraphics(CANVAS_SIZE, HISTOGRAM_HEIGHT);
  histogram_canvas.position(0, CANVAS_SIZE);

  // Resizing the images
  for (let i = 0; i < loaded_images.length; i++) {
    // Resize the image to the CANVAS_SIZE
    loaded_images[i].resize(CANVAS_SIZE, CANVAS_SIZE);
    loaded_images[i].loadPixels();
  }

  // Setting the kernel shader and the brightness shader
  kernel_shader = loadShader('./assets/shaders/kernel.vert', './assets/shaders/kernel.frag');
  brightness_shader = loadShader('./assets/shaders/kernel.vert', './assets/shaders/brightness.frag');

  // Set the current image to the first one in the loaded_images array
  resetImage();

  mask_title = local_mode ? masks[selected_mask][0] + ' - local' : masks[selected_mask][0] + ' - global';
}

/**
 * Loop function that make the software interactive.
 * check the flags after doing anything for optimization
*/
function draw() {
  background(52, 58, 64);

  if (mask_changed) {
    // Check to apply the mask locally or globally
    local_mode ? applyLocalMask() : applyGlobalMask();

    // Reset the flags
    mask_changed = false;
    histogram_changed = true;
  }

  // Histogram has a change, calculate the new histograms
  if (histogram_changed && show_histogram) {
    calculateHistograms();
    histogram_changed = false;
  }

  // load the selected image to the masking canvas
  masking_canvas.image(current_image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  displayName(mask_title, masking_canvas);
  image(masking_canvas, 0, 0);

  // Display the histogram if the flag is true
  if (show_histogram) drawHistogram();
}

/**
 * Used to reload the original selected image, if the mask is not applied locally, then return the selected mask to the original one
*/
function clearMask() {
  resetImage();

  // If global mode, reset the mask to the original one
  if (!local_mode) {
    selected_mask = 0;
  }

  mask_title = local_mode ? masks[selected_mask][0] + ' - local' : masks[selected_mask][0] + ' - global';
}

/**
 * Used to copy the selected image to the current image as a ImageData object
*/
function resetImage() {
  current_image = createImage(CANVAS_SIZE, CANVAS_SIZE);
  current_image.copy(loaded_images[selected_image], 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
  current_image.loadPixels();

  histogram_changed = true;
}

/**
 * Used to display a text in a given canvas with a box just barely containing the whole text
 * @param {string} title - The title to be displayed
 * @param {object} canvas - The canvas to display the text on
*/
function displayName(title, canvas) {
  canvas.push();

  // Calculate the width of the text
  canvas.textFont(FONT);
  canvas.textSize(20);
  let text_width = canvas.textWidth(title) + 10;

  // Translate the figure to the top middle of the canvas
  canvas.translate(canvas.width / 2 - text_width / 2, 30);

  // Draw the box
  canvas.fill(255);
  canvas.rect(0, 0, text_width, 25);

  // Draw the text
  canvas.fill(0);
  canvas.text(title, 5, 20);

  canvas.pop();
}

/**
 * Used to generate and display a histogram of the current image.
 * The histogram is generated by counting the number of pixels with a specific value for each color channel
 * The histogram is displayed by drawing a line for each color channel with the number of pixels with a specific value below the masking canvas
 * The posssible histograms are:
 *     - Averrage of the three color channels
 *     - Red channel
 *     - Green channel
 *     - Blue channel
 *     - All of the last 4 histograms in one
*/
function calculateHistograms() {
  histograms = [];

  // Init the histograms array
  for (let i = 0; i < 4; i++) {
    histograms.push(new Array(256).fill(0));
  }

  // Calculate the histogram for the three color channels and the average
  for (let i = 0; i < masking_canvas.width; i++) {
    for (let j = 0; j < masking_canvas.height; j++) {
      // Get the color channels
      let channels = getPixel(i, j);

      // Calculate the average
      let avg = (channels[0] + channels[1] + channels[2]) / 3;

      histograms[0][avg]++;
      histograms[1][channels[0]]++;
      histograms[2][channels[1]]++;
      histograms[3][channels[2]]++;
    }
  }

  // Scale down the histograms to fit the histogram canvas
  scaleDownHistograms();
}

/**
 * Used to scale down the histograms to fit the histogram canvas width and height
*/
function scaleDownHistograms() {
  // Iterate over the histograms and scale them down
  for (let i = 0; i < histograms.length; i++) {
    let scale_factor = histogram_canvas.height / max(...histograms[i]);

    for (let j = 0; j < histograms[i].length; j++) {
      histograms[i][j] *= scale_factor;
    }
  }
}

/**
 * Used to draw the histogram on the histogram canvas
 * The histogram is drawn by drawing a line for each color channel with the number of pixels with a specific value below the masking canvas
 * The posssible histograms are:
 *     - Averrage of the three color channels (gray transparent color)
 *     - Red channel (red transparent color)
 *     - Green channel (green transparent color)
 *     - Blue channel (blue transparent color)
 *     - All of the last 4 histograms
*/
function drawHistogram() {
  histogram_canvas.background(220);
  histogram_canvas.stroke(255);
  histogram_canvas.strokeWeight(1);
  let name;

  // Draw the histogram for the average of the three color channels
  if (selected_histogram == 0 || selected_histogram == 4) {
    printHistogramArray(histograms[0], color(90, 90, 90, 70));
    selected_histogram != 4 ? name = "Average" : name = "Mixed";
  }
  // Draw the histogram for the red channel
  if (selected_histogram == 1 || selected_histogram == 4) {
    printHistogramArray(histograms[1], color(255, 0, 0, 70));
    selected_histogram != 4 ? name = "Red" : name;
  }
  // Draw the histogram for the green channel
  if (selected_histogram == 2 || selected_histogram == 4) {
    printHistogramArray(histograms[2], color(0, 255, 0, 70));
    selected_histogram != 4 ? name = "Green" : name;
  }
  // Draw the histogram for the blue channel
  if (selected_histogram == 3 || selected_histogram == 4) {
    printHistogramArray(histograms[3], color(0, 0, 255, 70));
    selected_histogram != 4 ? name = "Blue" : name;
  }

  // Display the histogram
  displayName(name, histogram_canvas);
  image(histogram_canvas, 0, CANVAS_SIZE);
}

/**
 * Used to draw the histogram on the histogram canvas using all the  available histogram canvas width
 * The histogram must appear as a continuous line, so when separation i required between the histogram lines, new bars with the average length of the two columns are drawn
 * @param {Array} histogram - The histogram to be drawn
 * @param {string} color - The color of the histogram
 */
function printHistogramArray(histogram, color) {
  histogram_canvas.push();
  histogram_canvas.stroke(color);
  histogram_canvas.strokeWeight(1);

  // Draw the histogram in the complete histogram canvas size getting the average of the two columns
  for (let i = 0; i < histogram_canvas.width; i++) {
    let index = Math.floor(i * histogram.length / histogram_canvas.width);
    let height = histogram[index];

    histogram_canvas.line(i, histogram_canvas.height, i, histogram_canvas.height - height);
  }
}

/**
 * Used to get the pixel value of the current image at a given location
 * @param {number} pixelX - The column where the pixel is located
 * @param {number} pixelY - The row where the pixel is located
 * @returns {object} - The pixel value at the given location in [r, g, b] format
*/
function getPixel(pixelX, pixelY) {
  let index = (pixelX + pixelY * masking_canvas.width) * 4;

  return [
    current_image.pixels[index],
    current_image.pixels[index + 1],
    current_image.pixels[index + 2]
  ];
}

/**
 * Used to apply a mask globally to the current image
*/
function applyGlobalMask() {
  if (selected_mask > 0) {
    current_image = convolveImage(current_image);
    current_image.loadPixels();
  }
}

/**
 * Used to apply a mask locally to the current image
 * The local mask is applied to the area around the mouse cursor
 * The size of the local mask is defined by the LOCAL_ZONE_SIZE constant
*/
function applyLocalMask() {
  if (selected_mask == 0) return;

  let posX = mouseX - FILES_ZONES_HEIGHT / 2;
  let posY = mouseY - FILES_ZONES_HEIGHT / 2;

  let small_image = createImage(FILES_ZONES_HEIGHT, FILES_ZONES_HEIGHT);
  small_image.copy(current_image, posX, posY, FILES_ZONES_HEIGHT, FILES_ZONES_HEIGHT, 0, 0, FILES_ZONES_HEIGHT, FILES_ZONES_HEIGHT);
  small_image.loadPixels();

  small_image = convolveImage(small_image);

  current_image.copy(small_image, 0, 0, FILES_ZONES_HEIGHT, FILES_ZONES_HEIGHT, posX, posY, FILES_ZONES_HEIGHT, FILES_ZONES_HEIGHT);
  current_image.loadPixels();
}

/**
 * Used to apply a convolution mask to an image
 * @param {object} image - The image to which the convolution mask is applied
*/
function convolveImage(image) {
  let buffer = createGraphics(image.width, image.height, WEBGL);

  // Copy the shader to the buffer's context
  let copiedShader = kernel_shader.copyToContext(buffer);

  // Passing the shader uniforms
  copiedShader.setUniform('uTexture', image);
  copiedShader.setUniform('uKernel', masks[selected_mask][1]);
  copiedShader.setUniform('uStepSize', [1 / image.width, 1 / image.height]);
  copiedShader.setUniform('uDistance', 1);
  
  buffer.shader(copiedShader);

  // Draw a rectangle that covers the whole canvas
  push();
  buffer.translate(-image.width / 2, -image.height / 2);
  buffer.rect(0, 0, image.width, image.height);
  pop();

  // Get the processed image of the buffer
  let modified_image = buffer.get();

  // Close the buffer
  buffer.remove();

  return modified_image;
}

function applyBrightness() {
  let buffer = createGraphics(masking_canvas.width, masking_canvas.height, WEBGL);

  // Copy the shader to the buffer's context
  let copiedShader = brightness_shader.copyToContext(buffer);

  // Passing the shader uniforms
  copiedShader.setUniform('uTexture', current_image);
  copiedShader.setUniform('uBrightness', brightness);
  
  buffer.shader(copiedShader);

  // Draw a rectangle that covers the whole canvas
  push();
  buffer.translate(-current_image.width / 2, -current_image.height / 2);
  buffer.rect(0, 0, current_image.width, current_image.height);
  pop();

  // Get the processed image of the buffer
  current_image = buffer.get();
  current_image.loadPixels();

  // Close the buffer
  buffer.remove();

  histogram_changed = true;
  brightness = 1;
}

/**
 * Used to generate a dropzone in the masking canvas to upload and rezise only images
*/
function handleFile(file) {
  if (file.type === 'image') {
    // get the new image, resize to the masking canvas size and push front to the ORIGINAL_IMAGES array
    let img = loadImage(file.data, () => {
      img.resize(width, height); // resize the image to the size of the canvas
      loaded_images.unshift(img);
      selected_image = 0;

      resetImage();
    });
  }
  else {
    alert('Solo se permiten imágenes');
  }
}

/**
 * Used to switch the mask to be applied to the image
 */
function switchMask() {
  selected_mask++;

  if (selected_mask >= masks.length) {
    selected_mask = 0;
  }

  if (!local_mode) {
    mask_changed = true;
    resetImage();
  }

  mask_title = local_mode ? masks[selected_mask][0] + ' - local' : masks[selected_mask][0] + ' - global';
}

/**
 * Used to switch between images in the image array
*/
function switchImage() {
  selected_image++;

  if (selected_image >= loaded_images.length) {
    selected_image = 0;
  }

  clearMask();
}

/**
 * Used to activate or deactivate the histogram from the canvas
*/
function showHistogram() {
  show_histogram = !show_histogram;
}

/**
 * Used to switch between histograms
 * 0 - RGB
 * 1 - Red
 * 2 - Green
 * 3 - Blue
 * 4 - All
*/
function switchHistogram() {
  selected_histogram++;

  if (selected_histogram >= 5) {
    selected_histogram = 0;
  }

  histogram_changed = true;
}

/**
 * Used to clear the mask from the canvas
*/
function mousePressed() {
  if (local_mode) {
    mask_changed = true;
  }
}

/**
 * Used to control multiple function in the program
*/
function keyPressed() {
  switch (key) {
    case 'f':
      switchMask();
      break;
    case 'g':
      show_histogram = !show_histogram;
      histogram_changed = true;
      break;
    case 'h':
      switchImage();
      histogram_changed = true;
      break;
    case 'j':
      switchHistogram();
      break;
    case 'k':
      local_mode = !local_mode;
      clearMask();
      break;
    case 'v':
      brightness -= 0.1;
      applyBrightness();
      break;
    case 'b':
      brightness += 0.1;
      applyBrightness();
      break;
    case 'r':
      clearMask();
      break;
  }
}