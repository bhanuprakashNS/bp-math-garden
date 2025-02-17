const BACKGROUND_COLOR = '#000000';
const LINE_COLOR = '#ffffff';
const LINE_WIDTH = 5;

var currentX = 0;
var currentY = 0;
var previousX = 0;
var previousY = 0;
var isDrawing = false;

var canvas;
var context;

function prepareCanvas() {
  // console.log('Preparing Canvas')
  canvas = document.getElementById('my-canvas');
  context = canvas.getContext('2d');

  context.fillStyle = BACKGROUND_COLOR;
  context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  context.strokeStyle = LINE_COLOR;
  context.lineWidth = LINE_WIDTH;
  context.lineJoin = 'round';

  var isDrawing = false;

  canvas.addEventListener('mousedown', function (event) {
    // console.log('Mouse Pressed');
    isDrawing = true;

    previousX = event.clientX - canvas.offsetLeft;
    previousY = event.clientY - canvas.offsetTop;
  });

  canvas.addEventListener('mouseup', function (event) {
    // console.log('Mouse Released');

    isDrawing = false;
  });

  canvas.addEventListener('mousemove', function (event) {
    if (isDrawing) {
      currentX = event.clientX - canvas.offsetLeft;
      currentY = event.clientY - canvas.offsetTop;

      draw();

      previousX = currentX;
      previousY = currentY;
    };
  });

  canvas.addEventListener('mouseleave', function (event) {
    // console.log('Mouse Left');
    isDrawing = false;
  });

  // Touch Events
  canvas.addEventListener('touchstart', function (event) {
    // console.log('Touchdown!');
    isDrawing = true;

    previousX = event.touches[0].clientX - canvas.offsetLeft;
    previousY = event.touches[0].clientY - canvas.offsetTop;
  });

  canvas.addEventListener('touchend', function (event) {
    // console.log('Mouse Left');
    isDrawing = false;
  });

  canvas.addEventListener('touchcancel', function (event) {
    // console.log('Mouse Left');
    isDrawing = false;
  });

  canvas.addEventListener('touchmove', function (event) {
    if (isDrawing) {
      currentX = event.touches[0].clientX - canvas.offsetLeft;
      currentY = event.touches[0].clientY - canvas.offsetTop;

      draw();

      previousX = currentX;
      previousY = currentY;
    };
  });


}

function draw() {
  context.beginPath();
  context.moveTo(previousX, previousY);
  context.lineTo(currentX, currentY);
  context.closePath();
  context.stroke();
}

function clearCanvas() {
    currentX = 0;
    currentY = 0;
    previousX = 0;
    previousY = 0;  

    context.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}