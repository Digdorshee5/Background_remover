const express = require("express");
const multer = require("multer");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const { execSync } = require("child_process");

try {
    console.log("Installing Python dependencies...");
    execSync("pip install -r requirements.txt", { stdio: "inherit" });
} catch (err) {
    console.error("Failed to install Python dependencies:", err);
}


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

app.post("/remove-bg", upload.single("image"), (req, res) => {
    const inputPath = req.file.path;
    console.log(inputPath);
    const outputPath = `output-${Date.now()}.png`;

    const pythonProcess = spawn("python", ["./remove_bg.py", inputPath, outputPath]);
                console.log(outputPath);
    pythonProcess.on("close", (code) => {
        if (code === 0) {
            const image = fs.readFileSync(outputPath, { encoding: "base64" });
            res.json({ image });
            console.log(res.json({ image }));
            setTimeout(() => {
                fs.unlinkSync(inputPath); // Clean up
                fs.unlinkSync(outputPath);
                console.log("both files are deleted");
            }, 60000);

        } else {
            res.status(500).send("Error processing image.");
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
