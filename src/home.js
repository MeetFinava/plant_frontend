import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { CircularProgress, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import BugReportIcon from "@mui/icons-material/BugReport";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const classes = {
  wrapper: styled("div")({
    padding: "2rem",
    textAlign: "center",
    maxWidth: 600,
    margin: "auto",
  }),
  dropzone: styled("div")(({ isdragactive }) => ({
    border: "2px dashed #4caf50",
    borderRadius: "8px",
    padding: "2rem",
    backgroundColor: isdragactive ? "#e8f5e9" : "#fafafa",
    cursor: "pointer",
    marginBottom: "1rem",
  })),
  previewImg: styled("img")({
    maxWidth: "100%",
    maxHeight: 300,
    marginTop: "1rem",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  }),
  resultSection: styled("div")({
    marginTop: "2rem",
    textAlign: "left",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  }),
  infoCard: styled("div")({
    padding: "1rem 0",
  }),
  infoHeader: styled("div")({
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    color: "#388e3c",
  }),
  confidenceChip: styled("span")({
    backgroundColor: "#4caf50",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    marginLeft: "1rem",
  }),
  loaderContainer: styled("div")({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "2rem",
  }),
  loader: styled(CircularProgress)({
    color: "#4caf50",
    marginBottom: "1rem",
  }),
};

export default function PlantClassifier() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [image, setImage] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
  });

  const sendFile = async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("lang", "en"); // You can change this dynamically

    try {
      const response = await axios.post(
        "https://plant-backend-one.vercel.app/predict",
        formData
      );
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setSelectedFile(null);
    setImage(null);
    setData(null);
  };

  const confidence = data?.confidence
    ? (data.confidence * 100).toFixed(2)
    : null;

  return (
    <div className={classes.wrapper}>
      <Typography variant="h4" gutterBottom>
        🌿 Plant Disease Classifier
      </Typography>

      {!image ? (
        <div {...getRootProps()} className={classes.dropzone({ isdragactive: isDragActive })}>
          <input {...getInputProps()} />
          <Typography>
            {isDragActive
              ? "Drop the image here..."
              : "Drag & drop a plant leaf image here, or click to select"}
          </Typography>
        </div>
      ) : (
        <>
          <img src={image} alt="Preview" className={classes.previewImg} />
          <Button
            variant="contained"
            color="success"
            onClick={sendFile}
            disabled={isLoading}
            sx={{ mt: 2, mr: 2 }}
          >
            Detect Disease
          </Button>
          <Button variant="outlined" color="error" onClick={clearData} sx={{ mt: 2 }}>
            Clear
          </Button>
        </>
      )}

      {isLoading && (
        <div className={classes.loaderContainer}>
          <CircularProgress className={classes.loader} />
          <Typography>Detecting disease...</Typography>
        </div>
      )}

      {data && (
        <div className={classes.resultSection}>
          <div className={classes.infoCard}>
            <div className={classes.infoHeader}>
              <BugReportIcon /> Predicted Disease
            </div>
            <Typography variant="body1">
              {data.class_name}
              <span className={classes.confidenceChip}>{confidence}%</span>
            </Typography>
          </div>

          <div className={classes.infoCard}>
            <div className={classes.infoHeader}>
              <LocalHospitalIcon /> Suggested Medicine
            </div>
            <Typography variant="body2">{data.medicine}</Typography>
          </div>
        </div>
      )}
    </div>
  );
}
