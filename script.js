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

    const result = document.getElementById("result");
    const image = document.getElementById("imagePreview");

    imageReady = false;

    if (!file.type.startsWith("image/")) {
        result.innerText = "Please choose a valid image.";
        return;
    }

    if (file.size < 10000) {
        result.innerText = "Image may be too small. Please choose a clearer photo.";
        return;
    }

    if (file.size > 15000000) {
        result.innerText = "Image is too large. Please choose a smaller photo.";
        return;
    }

    image.style.display = "block";

    image.onload = function() {

        if (image.naturalWidth < 200 || image.naturalHeight < 200) {
            imageReady = false;
            result.innerText =
                "Image quality may be low. Try a clearer crop photo.";
            return;
        }

        imageReady = true;

        result.innerText =
            "Image ready! Tap Analyze Crop.";
    };

    image.onerror = function() {
        result.innerText =
            "Could not read this image. Please choose another photo.";
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

        let healthy = 0;
        let early = 0;
        let infected = 0;

        for (let i = 0; i < predictions.length; i++) {

            const name = predictions[i].className.toLowerCase();
            const percentage = predictions[i].probability * 100;

            if (name.includes("healthy")) {
                healthy = percentage;
            }

            else if (name.includes("early")) {
                early = percentage;
            }

            else if (name.includes("infected")) {
                infected = percentage;
            }
        }

        let message = "";
        let background = "";
        let textColor = "";

        if (status.includes("healthy")) {

            message =
                "Your crop appears healthy. Continue monitoring it regularly.";

            background = "#d4edda";
            textColor = "#155724";

        }

        else if (status.includes("early")) {

            message =
                "Early signs of stress detected. Inspect the affected leaves and monitor the crop closely.";

            background = "#fff3cd";
            textColor = "#856404";

        }

        else if (status.includes("infected")) {

            message =
                "Possible infection detected. Inspect affected plants and take appropriate crop-management action.";

            background = "#f8d7da";
            textColor = "#721c24";

        }

        else {

            message =
                "Continue monitoring the crop and inspect any unusual changes.";

            background = "#e2e3e5";
            textColor = "#383d41";
        }

        let warning = "";

        if (confidence < 60) {

            warning =
                "<br><br>⚠️ <strong>Low confidence:</strong> " +
                "The AI is uncertain about this result. " +
                "Try taking another clear photo in good lighting.";
        }

        // Save scan to history
        const scan = {
            status: highest.className,
            confidence: confidence.toFixed(1),
            healthy: healthy.toFixed(1),
            early: early.toFixed(1),
            infected: infected.toFixed(1),
            date: new Date().toLocaleString()
        };

        let history = JSON.parse(localStorage.getItem("scanHistory")) || [];

        history.unshift(scan);

        if (history.length > 10) {
            history = history.slice(0, 10);
        }

        localStorage.setItem("scanHistory", JSON.stringify(history));

        result.style.backgroundColor = background;
        result.style.color = textColor;
        result.style.padding = "20px";
        result.style.borderRadius = "15px";
        result.style.marginTop = "20px";

        result.innerHTML =

            "<strong>🌱 Crop Status: " +
            highest.className +
            "</strong>" +

            "<br><br>" +

            "Confidence: " +
            confidence.toFixed(1) +
            "%" +

            "<br><br>" +

            "<strong>AI Confidence Breakdown:</strong>" +

            "<br>🟢 Healthy: " +
            healthy.toFixed(1) +
            "%" +

            "<br>🟡 Early Stage: " +
            early.toFixed(1) +
            "%" +

            "<br>🔴 Infected: " +
            infected.toFixed(1) +
            "%" +

            "<br><br>" +

            "<strong>💡 Tip:</strong><br>" +
            message +

            warning;

        displayHistory();

    }

    catch (error) {

        console.error(error);

        result.innerText =
            "Something went wrong analysing the image.";
    }
}

// Create Scan History section
function displayHistory() {

    let history = JSON.parse(localStorage.getItem("scanHistory")) || [];

    let historyBox = document.getElementById("history");

    if (!historyBox) {

        historyBox = document.createElement("div");

        historyBox.id = "history";

        historyBox.style.marginTop = "30px";
        historyBox.style.padding = "20px";
        historyBox.style.backgroundColor = "#ffffff";
        historyBox.style.borderRadius = "15px";

        document.body.appendChild(historyBox);
    }

    if (history.length === 0) {

        historyBox.innerHTML =
            "<h2>📋 Scan History</h2>" +
            "<p>No scans yet.</p>";

        return;
    }

    let html =
        "<h2>📋 Scan History</h2>";

    for (let i = 0; i < history.length; i++) {

        html +=

            "<div style='padding:15px; margin:10px 0; background:#f2f8f2; border-radius:10px;'>" +

            "<strong>🌱 " +
            history[i].status +
            "</strong>" +

            "<br>" +

            "Confidence: " +
            history[i].confidence +
            "%" +

            "<br>" +

            "🟢 Healthy: " +
            history[i].healthy +
            "% | " +

            "🟡 Early: " +
            history[i].early +
            "% | " +

            "🔴 Infected: " +
            history[i].infected +
            "%" +

            "<br>" +

            "<small>🕒 " +
            history[i].date +
            "</small>" +

            "</div>";
    }

    html +=
        "<button onclick='clearHistory()'>" +
        "Clear Scan History" +
        "</button>";

    historyBox.innerHTML = html;
}

// Clear scan history
function clearHistory() {

    localStorage.removeItem("scanHistory");

    displayHistory();
}

loadModel();
displayHistory();
