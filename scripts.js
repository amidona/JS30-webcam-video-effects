const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

// Takes the video from your webcam and puts it in the corner video player
function getVideo() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(localMediaStream => {
            //console.log(localMediaStream);
            video.srcObject = localMediaStream;
            video.play();
        })
        .catch(err => {
            console.error(`OH NO!!`, err);
        });
}

// Takes a picture of the video stream every X milliseconds and "paints" it to the canvas, essentially creating a very smooth stop-motion video that allows you to then manipulate the pixels to create various video effects
function paintToCanvas() {
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        //take the pixels out
        let pixels = ctx.getImageData(0, 0, width, height);
       //mess with them (all off, remove commenting to turn on. I don't believe they can run syncronously)
       
       //pixels = redEffect(pixels);

        // pixels = rgbSplit(pixels);
        // ctx.globalAlpha = 0.1;

        //pixels = greenScreen(pixels);

        //put them back
        ctx.putImageData(pixels, 0, 0);
    }, 16); // The 16 is how many milliseconds it takes a pic from the video and puts it on the canvas
}

// Works with the button to save a frame of the canvas that can be downloaded to your computer
function takePhoto() {
    //played the sound
    snap.currentTime = 0;
    snap.play();

    //take the data out of the canvas
    const data = canvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    link.href = data;
    link.setAttribute("download", "handsome");
    link.innerHTML= `<img src="${data}" alt="Handsome Person" />`
    strip.insertBefore(link, strip.firstChild);
}

// Gives the whole video a red tint, updata the +100 in the first row higher for a stronger effect
function redEffect(pixels) {
    for(let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i + 0] = pixels.data[i + 0] + 100; //red
        pixels.data[i + 1] = pixels.data[i + 1] - 50; //green
        pixels.data[i + 2] = pixels.data[i + 2] * 0.5; //blue
    }
    return pixels;
}

// Splits the colors and offsets them, so there's a red, a green, and a blue version of you. Change the numbers in the first bracket to change the offset, the higher the number, the further offset they'll be
function rgbSplit(pixels) {
    for(let i = 0; i < pixels.data.length; i += 4) {
        pixels.data[i - 150] = pixels.data[i + 0]; //red
        pixels.data[i + 500] = pixels.data[i + 1]; //green
        pixels.data[i - 550] = pixels.data[i + 2]; //blue
    }
    return pixels;
}

// Works in conjunction with the sliders to create a "green screen" effect, but you aren't limited to green. Use the sliders to zero out other color combinations
function greenScreen(pixels) {
    const levels = {}; //holds our min and max green

    document.querySelectorAll(".rgb input").forEach((input) => {
        levels[input.name] = input.ariaValueMax;
    });

    for (i = 0; i < pixels.data.length; i = i + 4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (red >= levels.rmin
            && green >= levels.gmin
            && blue >= levels.bmin
            && red <= levels.rmax
            && green <= levels.gmax
            && blue <= levels.bmax) {
            // take it out!
                pixels.data[i + 3] = 0;
            }
    }
    return pixels;
}

getVideo();

video.addEventListener("canplay", paintToCanvas);