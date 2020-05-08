(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => {
            track.stop();
        });
        window.postMessage('granted');
        const disclaimer = document.querySelector('.disclaimer');
        disclaimer.innerText = "Ora puoi tornare alla pagina precedente e aprire di nuovo l'estensione.";
    } catch (error) {
        window.postMessage('denied');
    }
})();
