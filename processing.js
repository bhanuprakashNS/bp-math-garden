var model;

async function loadModel() {
    try {
        
        model = await tf.loadGraphModel('TFJS/model.json');
        
    } catch (error) {
        console.error("Error loading model:", error);
    }

}

function predictImage() {
    // console.log('processing...');

    let canvas = document.getElementById('my-canvas');

    let image = cv.imread(canvas);
    cv.cvtColor(image, image, cv.COLOR_RGBA2GRAY, 0);
    cv.threshold(image, image, 175, 255, cv.THRESH_BINARY);

    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();
    // You can try more different parameters
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);

    if (contours.size() > 0) {
        let cnt = contours.get(0);
        let rect = cv.boundingRect(cnt);
        image = image.roi(rect);
    
        // Cleanup
        cnt.delete();
      } else {
        console.warn('No contours found!');
      }

    var height = image.rows;
    var width = image.cols;

    if (height > width) {   
        height = 20;
        const scaleFactor = image.rows / height;
        width = Math.round(image.cols / scaleFactor);

    } else {
        width = 20;
        const scaleFactor = image.cols / width;
        height = Math.round(image.rows / scaleFactor);
    }

    let newSize = new cv.Size(width, height);
    cv.resize(image, image, newSize, 0, 0, cv.INTER_AREA);
    
    const LEFT = Math.ceil(4 + (20-width)/2);
    const RIGHT = Math.floor(4 + (20-width)/2);
    const TOP = Math.ceil(4 + (20-height)/2);
    const BOTTOM = Math.floor(4 + (20-height)/2);
    // console.log(`top: ${TOP}, bottom: ${BOTTOM}, left: ${LEFT}, right: ${RIGHT}`);

    const BLACK = new cv.Scalar(0, 0, 0);
    cv.copyMakeBorder(image, image, TOP, BOTTOM, LEFT, RIGHT, cv.BORDER_CONSTANT, BLACK);

    // Center of Mass
    cv.findContours(image, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
    cnt = contours.get(0);
    const Moments = cv.moments(cnt, false);
    const cx = Moments.m10 / Moments.m00;
    const cy = Moments.m01 / Moments.m00;
    // console.log(`M00: ${Moments.m00}, cx: ${cx}, cy: ${cy}`);

    const X_SHIFT = Math.round(image.cols/2.0 - cx);
    const Y_SHIFT = Math.round(image.rows/2.0 - cy);

    newSize = new cv.Size(image.cols, image.rows);
    const M = cv.matFromArray(2, 3, cv.CV_64F, [1, 0, X_SHIFT, 0, 1, Y_SHIFT]);
    cv.warpAffine(image, image, M, newSize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, BLACK);

    let pixelValues = image.data;
    // console.log(`pixelValues: ${pixelValues}`);

    pixelValues = Float32Array.from(pixelValues);

    pixelValues = pixelValues.map(function(item){
        return item / 255.0;

    });
    // console.log(`scaled array: ${pixelValues}`);

    const X = tf.tensor([pixelValues]);
    // console.log(`Shape of tensor: ${X.shape}`);
    // console.log(`dtype of tensor: ${X.dtype}`);

    const result = model.predict(X);
    result.print();

    // console.log(tf.memory());

    const output = result.dataSync()[0];

    // Testing Only (delete later)
    // const outputCanvas = document.createElement('CANVAS');
    // cv.imshow(outputCanvas, image);
    // document.body.appendChild(outputCanvas);

    // Cleanup
    image.delete();
    contours.delete();
    M.delete();
    hierarchy.delete();

    X.dispose();
    result.dispose();

    return output;

}

// function predictImage() {
//     console.log('processing...');

//     // Ensure OpenCV.js is loaded
//     if (typeof cv === 'undefined') {
//         console.error('OpenCV.js is not loaded');
//         return;
//     }

//     // Get the canvas element
//     let canvas = document.getElementById('my-canvas');

//     // Read the image from the canvas using OpenCV.js
//     let src = cv.imread(canvas);

//     // Create a new canvas element
//     const outputCanvas = document.createElement('CANVAS');
//     outputCanvas.width = canvas.width;
//     outputCanvas.height = canvas.height;

//     // Display the image on the new canvas
//     cv.imshow(outputCanvas, src);

//     // Append the new canvas to the document body
//     document.body.appendChild(outputCanvas);

//     // Clean up
//     src.delete();
// }

