const MODEL_URL = "https://teachablemachine.withgoogle.com/models/qx6ir4Ivu/";

let model = null;
let imageReady = false;

async function loadModel() {
    const result = document.getElementById("result");

    try {
        result.innerText = "Starting AI...";

        if (typeof tmImage === "undefined") {
            result.innerText = "AI library did not load.";
            return;
        }

        result.innerText = "Loading AI model...";

        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await Promise.race([
            tmImage.load(modelURL, metadataURL),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Model timeout")), 15000)
            )
        ]);

        result.innerText = "AI ready! Choose a crop image.";

    } catch (error) {
        console.error(error);
        result.innerText = "AI could not load. Please refresh.";
    }
}

document.getElementById("imageUpload").addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) return;

    const image = document.getElementById("imagePreview");

    imageReady = false;
    image.style.display = "block";

    image.onload = function() {
        imageReady = true;
        document.getElementById("result").innerText =
            "Image ready! Tap Analyze Crop.";
    };

    image.src = URL.createObjectURL(file);
});

async function analyzeImage() {

    const result = document.getElementById("result");

    if (!model) {
        result.innerText = "AI is still loading. Please wait.";
        return;
    }

    if (!imageReady) {
        result.innerText = "Please choose an image first.";
        return;
    }

    try {
        result.innerText = "Analysing crop image...";

        const image = document.getElementById("imagePreview");

        const predictions = await model.predict(image);

        let highest = predictions[0];

        for (let i = 1; i < predictions.length; i++) {
            if (predictions[i].probability > highest.probability) {
                highest = predictions[i];
            }
        }

        const confidence = highest.probability * 100;

        result.innerHTML =
            "🌱 Crop Status: " + highest.className +
            "<br>Confidence: " + confidence.toFixed(1) + "%";

    } catch (error) {
        console.error(error);
        result.innerText = "Something went wrong analysing the image.";
    }
}

loadModel();
