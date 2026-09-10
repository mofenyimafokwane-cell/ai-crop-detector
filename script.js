// Teachable Machine model URL
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/x3L-4To3E/";

let model = null;
let imageReady = false;


// Load the AI model
async function loadModel() {

    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    try {

        document.getElementById("result").innerText =
            "Loading AI model...";

        model = await tmImage.load(modelURL, metadataURL);

        document.getElementById("result").innerText =
            "AI ready! Choose a crop image.";

        console.log("Teachable Machine model loaded!");

    } catch (error) {

        console.error("Model loading error:", error);

        document.getElementById("result").innerText =
            "Could not load the AI model. Please refresh the page.";
    }
}


// Preview selected image
document.getElementById("imageUpload").addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    const image = document.getElementById("imagePreview");

    imageReady = false;

    image.onload = function() {

        imageReady = true;

        document.getElementById("result").innerText =
            "Image ready! Tap Analyze Crop.";
    };

    image.src = window.URL.createObjectURL(file);
    image.style.display = "block";

    console.log("Image uploaded!");
});


// Analyze crop image
async function analyzeImage() {

    if (!model) {

        document.getElementById("result").innerText =
            "AI model is still loading. Please wait...";

        return;
    }

    if (!imageReady) {

        document.getElementById("result").innerText =
            "Please choose an image first.";

        return;
    }

    const image = document.getElementById("imagePreview");

    try {

        document.getElementById("result").innerText =
            "Analysing crop image...";

        const predictions = await model.predict(image);

        let highest = predictions[0];

        for (let i = 1; i < predictions.length; i++) {

            if (predictions[i].probability > highest.probability) {
                highest = predictions[i];
            }
        }

        const confidence = highest.probability * 100;

        document.getElementById("result").innerHTML =
            "🌱 Crop Status: " + highest.className +
            "<br>Confidence: " +
            confidence.toFixed(1) + "%";

        console.log("Prediction:", highest.className);
        console.log("Confidence:", confidence);

    } catch (error) {

        console.error("Analysis error:", error);

        document.getElementById("result").innerText =
            "Something went wrong while analysing the image.";
    }
}


// Start the AI
loadModel();
