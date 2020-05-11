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
let previousHeadBox = {};
let previousHandBox = {};
let delta = 0;
let found = false;

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
    if (!previousHeadBox.topLeft) {
        feedback.querySelector('.loading').innerText = "Prova a navigare questa pagina usando i movimenti della testa."

        const loadingFunc = () => {
            feedback.querySelector('.loading').remove();
            clearTimeout(loadingFunc);
        };

        setTimeout(loadingFunc, 3000);
    }

    // if hand is found...
    if (hands && hands[0] && hands[0].boundingBox) {
        let handsBox = hands[0].boundingBox;
        let fingerBox = hands[0].annotations.indexFinger
        // console.log(fingerBox)
    }

    // if a face is found...
    if (predictions && predictions[0] && predictions[0].boundingBox) {
        const box = predictions[0].boundingBox;
        directions.forEach((a) => a.style.display = 'none');

        // calculate delta according to headHeight every frame, because user may move and height can change
        const headHeight = Math.round(box.bottomRight[0][1] - box.topLeft[0][1]);
        const delta = headHeight / 10;

        console.log(previousHeadBox && previousHeadBox.topLeft && (box.topLeft[0][1] - previousHeadBox.topLeft[0][1]))
        if (previousHeadBox.topLeft && ((box.topLeft[0][1] - previousHeadBox.topLeft[0][1]) >= delta)) {
            scrollByWebPage(0, 300);
            directions.find((a) => a.classList.contains('down')).style.display = 'block';
            found = true;
        } else if (previousHeadBox.topLeft && ((previousHeadBox.topLeft[0][1] - box.topLeft[0][1]) >= delta)) {
            scrollByWebPage(0, -300);
            directions.find((a) => a.classList.contains('up')).style.display = 'block';
            found = true;
        } else {
            // update position of the head only if not gesture is not found,
            // otherwise we have conflict between up and down positions
            previousHeadBox = box;
            found = false;
        }
    }

    // next tick, baby
    const timeoutFunc = () => {
        requestAnimationFrame(handleVideoFrame.bind(null, video, faceModel, handModel, feedback));
        clearTimeout(timeoutFunc);
    };

    // we have to use a low refresh rate if found, otherwise moving back the head to original position
    // will be counted as another gesture...
    const timeout = found ? 2000 : 300;
    setTimeout(timeoutFunc, timeout);
};

function scrollByWebPage(x = 0, y = 0) {
    chrome.tabs.executeScript({ code: `window.scrollBy({top: ${y}, left: ${x}, behavior: 'smooth'});` });
}
