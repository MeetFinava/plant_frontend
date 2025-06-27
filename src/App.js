import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setResult(null); // Reset previous result
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:8000/predict", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
      setResult({ error: "Prediction failed." });
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>🌿 Plant Disease Classifier</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button type="submit">Predict</button>
      </form>

      {loading && <p>🔄 Predicting...</p>}

      {result && result.error && <p style={{ color: "red" }}>{result.error}</p>}
{result && result.english_label && (
  <div>
    <h3>🩺 English Prediction: {result.english_label}</h3>
    <h3>🌐 Translated Prediction: {result.translated_label}</h3>
    <p>📊 Confidence: {(result.confidence * 100).toFixed(2)}%</p>
    <p>💊 Treatment: {result.treatment}</p>
  </div>
)}
</div>
  );
}
export default App;
