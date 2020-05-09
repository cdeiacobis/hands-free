(async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => {
            track.stop();
        });

        console.debug('Permission granted');
        const disclaimer = document.querySelector('.disclaimer');
        disclaimer.innerText = "Ora puoi tornare alla pagina precedente e aprire di nuovo l'estensione.";
    } catch (error) {
       console.error(error);
    }
})();
