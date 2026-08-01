import { CLOUDINARY_URL, UPLOAD_PRESET } from "./cloudinary.js";

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

    // Allow only images and videos
    const allowedFiles = files.filter(file =>
        file.type.startsWith("image/") ||
        file.type.startsWith("video/")
    );

    if (allowedFiles.length !== files.length) {
        alert("Only images and videos are allowed.");
        return;
    }

    // Maximum 20 files
    if (allowedFiles.length > 20) {
        alert("You can upload up to 20 files at a time.");
        return;
    }


    uploadBtn.disabled = true;

    progressContainer.style.display = "block";
    progressText.style.display = "block";

    progressBar.style.width = "0%";

    const totalFiles = allowedFiles.length;
    let uploaded = 0;

    uploadBtn.textContent = `Uploading 0 of ${totalFiles}...`;

    try {

        for (const file of allowedFiles) {

            const formData = new FormData();

            formData.append("file", file);
            formData.append("upload_preset", UPLOAD_PRESET);

            const response = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || "Upload failed");
            }

            uploaded++;

            const percentage = (uploaded / totalFiles) * 100;

            progressBar.style.width = `${percentage}%`;

            progressText.textContent =
                `${uploaded} of ${totalFiles} uploaded`;

            uploadBtn.textContent =
                `Uploading ${uploaded} of ${totalFiles}...`;
        }

        progressBar.style.width = "100%";

        setTimeout(() => {

            home.style.display = "none";
            thankYou.style.display = "block";

        }, 500);

    } catch (error) {

        console.error(error);

        alert("Upload failed. Please try again.");

        uploadBtn.disabled = false;
        uploadBtn.textContent = "Upload Your Memories";

        progressContainer.style.display = "none";
        progressText.style.display = "none";
        progressBar.style.width = "0%";
    }

});