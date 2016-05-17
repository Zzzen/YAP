import electron = require("electron");
import main = require("../app/main");

const dialog = electron.remote.dialog;


const playerElement = document.getElementById("player") as HTMLVideoElement;


function selectVideo() {
    dialog.showOpenDialog({ title: "select video" }, filenames => {
        if (filenames) {
            let file = filenames[0];
            file = "file://" + file.replace(/\\/g, "/");
            playerElement.src = file;
            playerElement.play();
        }
    });
}

selectVideo();

playerElement.addEventListener('error', event => {
    console.log(event);
});

playerElement.addEventListener("mousewheel", event => {
    console.log(event.wheelDeltaY);
});
