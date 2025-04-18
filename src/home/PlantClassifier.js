import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  CircularProgress,
  Typography,
  Button,
  Box,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";
import BugReportIcon from "@mui/icons-material/BugReport";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import axios from "axios"; // ✅ Correct import

// ✅ Styled components
const Wrapper = styled(Box)({
  padding: "2rem",
  textAlign: "center",
  maxWidth: 600,
  margin: "auto",
});

const Dropzone = styled("div")(({ theme, isdragactive }) => ({
  border: "2px dashed #4caf50",
  borderRadius: "8px",
  padding: "2rem",
  backgroundColor: isdragactive ? "#e8f5e9" : "#fafafa",
  cursor: "pointer",
  marginBottom: "1rem",
}));

const PreviewImg = styled("img")({
  maxWidth: "100%",
  maxHeight: 300,
  marginTop: "1rem",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
});

const ResultSection = styled(Paper)({
  marginTop: "2rem",
  textAlign: "left",
  padding: "1rem",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
});

const InfoCard = styled("div")({
  padding: "1rem 0",
});

const InfoHeader = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  fontWeight: "bold",
  marginBottom: "0.5rem",
  color: "#388e3c",
});

const ConfidenceChip = styled("span")({
  backgroundColor: "#4caf50",
  color: "white",
  padding: "2px 8px",
  borderRadius: "12px",
  marginLeft: "1rem",
});

const LoaderContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: "2rem",
});

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
    formData.append("lang", "en"); // Optional: language support

    try {
      const response = await axios.post(
        "https://plant-backend-one.vercel.app/predict",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setData(response.data);
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
    <Wrapper>
      <Typography variant="h4" gutterBottom>
        🌿 Plant Disease Classifier
      </Typography>

      {!image ? (
        <Dropzone {...getRootProps()} isdragactive={isDragActive ? 1 : 0}>
          <input {...getInputProps()} />
          <Typography>
            {isDragActive
              ? "Drop the image here..."
              : "Drag & drop a plant leaf image here, or click to select"}
          </Typography>
        </Dropzone>
      ) : (
        <>
          <PreviewImg src={image} alt="Preview" />
          <Button
            variant="contained"
            color="success"
            onClick={sendFile}
            disabled={isLoading}
            sx={{ mt: 2, mr: 2 }}
          >
            Detect Disease
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={clearData}
            sx={{ mt: 2 }}
          >
            Clear
          </Button>
        </>
      )}

      {isLoading && (
        <LoaderContainer>
          <CircularProgress color="success" />
          <Typography>Detecting disease...</Typography>
        </LoaderContainer>
      )}

      {data && (
        <ResultSection elevation={2}>
          <InfoCard>
            <InfoHeader>
              <BugReportIcon /> Predicted Disease
            </InfoHeader>
            <Typography variant="body1">
              {data.class_name}
              <ConfidenceChip>{confidence}%</ConfidenceChip>
            </Typography>
          </InfoCard>

          <InfoCard>
            <InfoHeader>
              <LocalHospitalIcon /> Suggested Medicine
            </InfoHeader>
            <Typography variant="body2">{data.medicine}</Typography>
          </InfoCard>
        </ResultSection>
      )}
    </Wrapper>
  );
}
