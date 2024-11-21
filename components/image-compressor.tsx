"use client";

import React, { useState } from "react";
import imageCompression from "browser-image-compression";

export const ImageCompressor = () => {
  const [image, setImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80); // Default compression quality

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      try {
        const options = {
          maxSizeMB: 1, // Maximum file size (in MB)
          maxWidthOrHeight: 1920, // Maximum dimensions for resizing
          useWebWorker: true,
          initialQuality: quality / 100, // Compression quality
        };

        const compressedFile = await imageCompression(file, options);
        const compressedBlobUrl = URL.createObjectURL(compressedFile);
        setCompressedImage(compressedBlobUrl);
      } catch (error) {
        console.error("Compression failed:", error);
      }
    }
  };

  return (
    <div>
      <h2>Compress Photo</h2>
      <label>
        Compression Quality (%):
        <input
          type="number"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          min="1"
          max="100"
        />
      </label>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {compressedImage && (
        <div>
          <h3>Compressed Image</h3>
          <img src={compressedImage} alt="Compressed" style={{ maxWidth: "100%" }} />
          <a href={compressedImage} download="compressed-image.webp">
            Download
          </a>
        </div>
      )}
    </div>
  );
};


