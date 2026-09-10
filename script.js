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
        const status = highest.className.toLowerCase();

        let message = "";
        let background = "";
        let textColor = "";

        if (status.includes("healthy")) {
            message = "Your crop appears healthy. Continue monitoring it regularly.";
            background = "#d4edda";
            textColor = "#155724";

        } else if (status.includes("early")) {
            message = "Early signs of stress detected. Inspect the affected leaves and monitor the crop closely.";
            background = "#fff3cd";
            textColor = "#856404";

        } else if (status.includes("infected")) {
            message = "Possible infection detected. Inspect affected plants and take appropriate crop-management action.";
            background = "#f8d7da";
            textColor = "#721c24";

        } else {
            message = "Continue monitoring the crop and inspect any unusual changes.";
            background = "#e2e3e5";
            textColor = "#383d41";
        }

        result.style.backgroundColor = background;
        result.style.color = textColor;
        result.style.padding = "20px";
        result.style.borderRadius = "15px";
        result.style.marginTop = "20px";

        result.innerHTML =
            "<strong>🌱 Crop Status: " + highest.className + "</strong>" +
            "<br><br>" +
            "Confidence: " + confidence.toFixed(1) + "%" +
            "<br><br>" +
            "<strong>💡 Tip:</strong><br>" +
            message;

    } catch (error) {
        console.error(error);
        result.innerText = "Something went wrong analysing the image.";
    }
}

loadModel();
