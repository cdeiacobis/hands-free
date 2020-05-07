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

    navigator.mediaDevices.getUserMedia(hint)
        .then((stream) => {
            const video = document.getElementById('video-stream');
            video.style.display = 'block';
            video.srcObject = stream;
            video.play();
        })
        .catch((error) => {
            console.log(error);
            const ask = document.getElementById('ask');
            ask.style.display = 'block';
        });
})();
