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


    navigator.mediaDevices.getUserMedia(hint).then((stream) => {
        chrome.runtime.sendMessage({ youCanAsk: true }, (response) => {
            console.log('risposta', response);
        });
    });
})();
