// Teachable Machine model URL
const URL = "https://teachablemachine.withgoogle.com/models/x3L-4To3E/";

let model;

// Load the AI model
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);

    console.log("Teachable Machine model loaded!");
}

// Preview the selected image
document.getElementById("imageUpload").addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (file) {
        const image = document.getElementById("imagePreview");

        image.src = URL.createObjectURL(file);
        image.style.display = "block";
    }
});


// Analyze crop image
async function analyzeImage() {

    if (!model) {
        document.getElementById("result").innerHTML =
        "AI model is loading, please wait...";
        return;
    }

    const image = document.getElementById("imagePreview");

    const predictions = await model.predict(image);

    let highest = predictions[0];

    for (let i = 1; i < predictions.length; i++) {
        if (predictions[i].probability > highest.probability) {
            highest = predictions[i];
        }
    }

    document.getElementById("result").innerHTML =
    "🌱 Crop Status: " + highest.className +
    "<br>Accuracy: " +
    (highest.probability * 100).toFixed(1) + "%";
}


// Start AI
loadModel();
