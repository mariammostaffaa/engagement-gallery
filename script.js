import { CLOUDINARY_URL, UPLOAD_PRESET } from "./cloudinary.js";
import imageCompression from "https://cdn.jsdelivr.net/npm/browser-image-compression@2.0.2/+esm";

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const home = document.getElementById("home");
const thankYou = document.getElementById("thankYou");

const progressContainer = document.querySelector(".progress-container");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

uploadBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", async () => {

    if (fileInput.files.length === 0) return;

    const files = [...fileInput.files];

    const allowedFiles = files.filter(file =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
    );

    if (allowedFiles.length !== files.length) {
        alert("Only images and videos are allowed.");
        return;
    }

    if (allowedFiles.length > 20) {
        alert("You can upload up to 20 files at a time.");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.style.pointerEvents = "none";

    progressContainer.style.display = "block";
    progressText.style.display = "block";

    progressBar.style.width = "0%";
    progressText.textContent = "Preparing files...";
    uploadBtn.textContent = "Uploading...";

    const totalFiles = allowedFiles.length;
    let uploaded = 0;

    async function uploadFile(file) {

        if (file.type.startsWith("image/")) {

            file = await imageCompression(file, {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                initialQuality: 0.6
            });

        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(CLOUDINARY_URL, {
            method: "POST",
            body: formData,
            signal: controller.signal,
            cache: "no-store"
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error("Upload failed");
        }

        uploaded++;

        const percentage = Math.round((uploaded / totalFiles) * 100);

        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${uploaded} of ${totalFiles} uploaded`;
    }

    try {

        const CONCURRENT_UPLOADS = 4;

        for (let i = 0; i < allowedFiles.length; i += CONCURRENT_UPLOADS) {

            const batch = allowedFiles.slice(i, i + CONCURRENT_UPLOADS);

            await Promise.all(
                batch.map(file => uploadFile(file))
            );

        }

        progressBar.style.width = "100%";
        progressText.textContent = "Upload complete!";

        fileInput.value = "";

        setTimeout(() => {

            home.style.display = "none";
            thankYou.style.display = "block";

        }, 700);

    }

    catch (error) {

        console.error(error);

        alert("Upload failed. Please try again.");

        uploadBtn.disabled = false;
        uploadBtn.style.pointerEvents = "auto";
        uploadBtn.textContent = "Upload Your Memories";

        progressContainer.style.display = "none";
        progressText.style.display = "none";
        progressBar.style.width = "0%";

    }

});