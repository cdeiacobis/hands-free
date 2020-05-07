(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => {
            track.stop();
        });
        window.postMessage('granted');
    } catch (error) {
        window.postMessage('denied');
    }
})();