"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic"; // To prevent SSR issues
import "cropperjs/dist/cropper.css"; // Import Cropper.js CSS

// Dynamically import Cropper to prevent server-side rendering issues
const Cropper = dynamic(() => import("react-cropper"), { ssr: false });

export const ImageCropper = () => {
  const [image, setImage] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [cropper, setCropper] = useState<any>(null);
  const [downloadFormat, setDownloadFormat] = useState<string>("image/png"); // Default to PNG
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const originalImageRef = useRef<File | null>(null); // To store the original image

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      originalImageRef.current = file; // Store the original image
      setImage(file);
      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        setCroppedImage(result); // Set the image preview for cropping
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrop = () => {
    if (cropper) {
      const croppedCanvas = cropper.getCroppedCanvas();
      const croppedDataURL = croppedCanvas.toDataURL(downloadFormat); // Use the selected format
      setCroppedImage(croppedDataURL);
    }
  };

  const handleReset = () => {
    if (cropper) {
      cropper.reset(); // Reset the cropper to the original image state
    }
  };

  const handleStartOver = () => {
    if (originalImageRef.current) {
      // Trigger file input change to reload the original image
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCroppedImage(result); // Set the original image to cropper
      };
      reader.readAsDataURL(originalImageRef.current);
    }

    // Optionally reset the file input (visual reset)
    if (imageInputRef.current) {
      imageInputRef.current.value = ""; // Clear the input to allow re-upload if needed
    }
  };

  useEffect(() => {
    if (cropper && croppedImage) {
      cropper.replace(croppedImage || "");
    }
  }, [croppedImage, cropper]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h2>Crop Image</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        ref={imageInputRef}
        style={{ marginBottom: "20px" }}
      />

      {croppedImage && (
        <div>
          <h3>Image Preview</h3>
          <div style={{ marginBottom: "20px" }}>
            <Cropper
              src={croppedImage}
              style={{ height: 400, width: "100%" }}
              aspectRatio={NaN} // No fixed aspect ratio (free crop)
              guides={true}
              viewMode={1}
              background={false}
              rotatable={true}
              scalable={true}
              zoomable={true}
              ref={(instance: any) => {
                if (instance) {
                  setCropper(instance.cropper); // Set cropper instance when initialized
                }
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <button
              onClick={handleCrop}
              style={{
                padding: "10px 20px",
                margin: "10px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              Crop Image
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: "10px 20px",
                margin: "10px",
                backgroundColor: "#f44336",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              Reset Crop
            </button>
            <button
              onClick={handleStartOver}
              style={{
                padding: "10px 20px",
                margin: "10px",
                backgroundColor: "#2196F3",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderRadius: "5px",
              }}
            >
              Start Over
            </button>
          </div>

          <h3>Cropped Image</h3>
          {croppedImage && (
            <div>
              <img
                src={croppedImage}
                alt="Cropped Image"
                style={{
                  maxWidth: "100%",
                  border: "2px solid #ddd",
                  marginBottom: "20px",
                }}
              />
              <div style={{ marginBottom: "20px" }}>
                <label
                  htmlFor="download-format"
                  style={{ fontWeight: "bold", marginRight: "10px" }}
                >
                  Download Format:
                </label>
                <select
                  id="download-format"
                  value={downloadFormat}
                  onChange={(e) => setDownloadFormat(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              <a
                href={croppedImage}
                download={`cropped-image.${downloadFormat.split("/")[1]}`}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "5px",
                }}
              >
                Download Cropped Image
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


