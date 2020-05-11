(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Errore fotocamera');
        return;
    }

    const hint = {
        audio: false,
        video: {
            facingMode: 'environment',
        },
    };

    navigator.mediaDevices.getUserMedia(hint)
        .then((stream) => {
            const video = document.getElementById('video-stream');
            video.style.display = 'block';
            video.srcObject = stream;
            const feedback = document.querySelector('.feedback');
            feedback.querySelector('.loading').style.display = 'block';

            video.addEventListener('loadeddata', () => {
                video.play();
                handleVideo();
            })
        })
        .catch((error) => {
            console.log(error);
            const ask = document.getElementById('ask');
            ask.style.display = 'block';
        });
})();

const handleVideo = async () => {
    const video = document.getElementById('video-stream');
    const feedback = document.querySelector('.feedback');
    const faceModel = await facemesh.load();
    const handModel = await handpose.load();
    handleVideoFrame(video, faceModel, handModel, feedback);
};

// box data 'cache'
let previousBox = {};

const handleVideoFrame = async (video, faceModel, handModel, feedback) => {
    /*
    `predictions` is an array of objects describing each detected face, for example:
    [
      {
        faceInViewConfidence: 1, // The probability of a face being present.
        boundingBox: { // The bounding box surrounding the face.
          topLeft: [232.28, 145.26],
          bottomRight: [449.75, 308.36],
        },
        mesh: [ // The 3D coordinates of each facial landmark.
          [92.07, 119.49, -17.54],
          [91.97, 102.52, -30.54],
          ...
        ],
        scaledMesh: [ // The 3D coordinates of each facial landmark, normalized.
          [322.32, 297.58, -17.54],
          [322.18, 263.95, -30.54]
        ],
        annotations: { // Semantic groupings of the `scaledMesh` coordinates.
          silhouette: [
            [326.19, 124.72, -3.82],
            [351.06, 126.30, -3.00],
            ...
          ],
          ...
        }
      }
    ]
    */

    // 'heavy' computation, requires a bit of time
    const predictions = await faceModel.estimateFaces(video);
    const hands = await handModel.estimateHands(video);



    const directions = [...feedback.querySelectorAll('.direction')];

    // first computation => remove 'loader'
    if (!previousBox.topLeft) {
        feedback.querySelector('.loading').innerText = "Prova a navigare questa pagina usando i movimenti della testa."

        const loadingFunc = () => {
            feedback.querySelector('.loading').remove();
            clearTimeout(loadingFunc);
        };

        setTimeout(loadingFunc, 4000);
    }

    // if hand is found...
    if (hands && hands[0] && hands[0].boundingBox) {
        let handsBox = hands[0].boundingBox;
        let fingerBox =  hands[0].annotations.indexFinger
        // console.log(fingerBox)
    }

    // if a face is found...
    if (predictions && predictions[0] && predictions[0].boundingBox) {
        const box = predictions[0].boundingBox;

        // console.log(previousBox && previousBox.topLeft && (box.topLeft[0][1] - previousBox.topLeft[0][1]))
        if (previousBox.topLeft && ((box.topLeft[0][1] - previousBox.topLeft[0][1]) >= 40)) {
            scrollByWebPage(0, 300);
            directions.forEach((a) => a.style.display = 'none');
            directions.find((a) => a.classList.contains('down')).style.display = 'block';
        } else {
            directions.forEach((a) => a.style.display = 'none');
        }

        previousBox = box;
    }

    // next tick, baby
    const timeoutFunc = () => {
        requestAnimationFrame(handleVideoFrame.bind(null, video, faceModel, handModel, feedback));
        clearTimeout(timeoutFunc);
    };

    setTimeout(timeoutFunc, 300);
};

function scrollByWebPage(x = 0, y = 0) {
    chrome.tabs.executeScript({ code: `window.scrollBy({top: ${y}, left: ${x}, behavior: 'smooth'});` });
}
