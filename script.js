import { CLOUDINARY_URL, UPLOAD_PRESET } from "./cloudinary.js";

const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

const home = document.getElementById("home");
const thankYou = document.getElementById("thankYou");

const progressContainer = document.querySelector(".progress-container");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");

// Compress images before upload
async function compressImage(file) {

    return new Promise((resolve) => {

        const reader = new FileReader();

        reader.readAsDataURL(file);

        reader.onload = (event) => {

            const img = new Image();

            img.src = event.target.result;

            img.onload = () => {

                const canvas = document.createElement("canvas");

                const MAX_WIDTH = 1600;
                const MAX_HEIGHT = 1600;

                let width = img.width;
                let height = img.height;

                if (width > height) {

                    if (width > MAX_WIDTH) {

                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;

                    }

                } else {

                    if (height > MAX_HEIGHT) {

                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;

                    }

                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(

                    (blob) => {

                        resolve(

                            new File(
                                [blob],
                                file.name.replace(/\.[^.]+$/, ".jpg"),
                                {
                                    type: "image/jpeg"
                                }
                            )

                        );

                    },

                    "image/jpeg",

                    0.82

                );

            };

        };

    });

}

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

    progressContainer.style.display = "block";
    progressText.style.display = "block";

    progressBar.style.width = "0%";

    const totalFiles = allowedFiles.length;
    let uploaded = 0;

    uploadBtn.textContent = "Uploading...";

    try {

        for (let file of allowedFiles) {

            // Compress only images
            if (file.type.startsWith("image/")) {

                file = await compressImage(file);

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

            progressText.textContent =
                `${uploaded} of ${totalFiles} uploaded`;

        }

        progressBar.style.width = "100%";
        progressText.textContent = "Upload complete!";

        setTimeout(() => {

            home.style.display = "none";
            thankYou.style.display = "block";

        }, 700);

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