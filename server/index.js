const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            "default-src": ["'self'"],
            "font-src": ["'self'", "https://fonts.gstatic.com"],
            "style-src": ["'self'", "https://fonts.googleapis.com"],
        },
    })
);

app.post("/remove-bg", upload.single("image"), async (req, res) => {
    const { imageUrl } = req.body; // Accept image URL from the request body

    let inputPath;
    let outputPath = `output-${Date.now()}.png`;

    try {
        if (imageUrl) {
            // Handle image URL
            const response = await axios({
                url: imageUrl,
                method: "GET",
                responseType: "arraybuffer",
            });
            const ext = path.extname(imageUrl).split("?")[0] || ".jpg"; // Extract extension or use default
            inputPath = `uploads/input-${Date.now()}${ext}`;
            fs.writeFileSync(inputPath, response.data); // Save the image to the uploads folder
        } else if (req.file) {
            // Handle uploaded image
            inputPath = req.file.path;
        } else {
            return res.status(400).send("No image provided.");
        }

        // Call the Python script
        const pythonProcess = spawn("python", ["./remove_bg.py", inputPath, outputPath]);

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                const image = fs.readFileSync(outputPath, { encoding: "base64" });
                res.json({ image });
                setTimeout(() => {
                    fs.unlinkSync(inputPath); // Clean up
                    fs.unlinkSync(outputPath);
                }, 60000);
            } else {
                res.status(500).send("Error processing image.");
            }
        });
    } catch (error) {
        console.error("Error processing request:", error);
        res.status(500).send("Error processing request.");
        if (inputPath && fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
