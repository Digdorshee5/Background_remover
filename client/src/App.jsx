import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [outputImage, setOutputImage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setOutputImage("");
        setSuccessMessage("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert("Please upload an image first!");
            return;
        }

        const formData = new FormData();
        formData.append("image", selectedFile);

        setIsLoading(true);
        setSuccessMessage("");

        try {
            const response = await axios.post("http://localhost:5000/remove-bg", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setOutputImage(`data:image/png;base64,${response.data.image}`);
            setSuccessMessage("Congrats! Your image has been processed.");
        } catch (error) {
            console.error("Error removing background:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = outputImage;
        link.download = "background-removed.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="app" style={{flex:"center"}}>
            <header className="header">
                <h1>Background Removal Tool</h1>
                <p>Remove the background of your images easily and download the result!</p>
            </header>

            <form className="upload-form" onSubmit={handleSubmit}>
                <label className="file-label">
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
                <button className="btn-primary" type="submit">
                    Remove Background
                </button>
            </form>

            {isLoading && (
                <div className="popup">
                    <p>Processing your image... Please wait.</p>
                </div>
            )}

            {successMessage && <p className="success">{successMessage}</p>}

            {outputImage && (
                <div className="output-section">
                    <h2>Result:</h2>
                    <img className="output-image" src={outputImage} alt="Background Removed" />
                    <br />
                    <br />
                    <button className="btn-secondary" onClick={handleDownload}>
                        Download Image
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;
