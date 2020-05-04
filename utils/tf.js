(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log('no fotocamera');
        return;
    }

    const hint = {
        audio: false,
        video: {
            facingMode: 'environment',
        },
    };

    const video = document.querySelector('video');

    navigator.getUserMedia(hint, async (stream) => {
        // Load the MediaPipe facemesh model assets.
        const model = await facemesh.load();

        // Pass in a video stream to the model to obtain
        // an array of detected faces from the MediaPipe graph.
        video.srcObject = stream;

        // const track = stream.getTracks()[0];
        // const settings = track.getSettings();
        // const imageCapture = new ImageCapture(track);
        // const canvas = new OffscreenCanvas(settings.width, settings.height);

        requestAnimationFrame(nextFrame.bind(null, model));
    }, (err) => { console.error(err) });

    const nextFrame = async (model) => {
        // const imageBitmap = await imageCapture.grabFrame();
        // const context = canvas.getContext('2d');
        // context.drawImage(imageBitmap, 0, 0);
        // const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        // console.log('imageData', imageData)
        const faces = await model.estimateFaces(video);

        // Each face object contains a `scaledMesh` property,
        // which is an array of 468 landmarks.
        faces.forEach(face => console.log(face.scaledMesh));
        requestAnimationFrame(nextFrame.bind(null, model));
    };

})();
