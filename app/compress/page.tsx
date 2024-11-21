"use client";

import React, { useState } from "react";
import sharp from "sharp";

const CompressImage = () => {
  const [image, setImage] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string>("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      const buffer = await file.arrayBuffer();
      const compressedBuffer = await sharp(Buffer.from(buffer))
        .webp({ quality: 50 })
        .toBuffer();
      setCompressedImage(URL.createObjectURL(new Blob([compressedBuffer])));
    }
  };

  return (
    <div>
      <h2>Compress Image</h2>
      <input type="file" accept="image/*" onChange={handleFileUpload} />
      {compressedImage && (
        <div>
          <h3>Compressed Image</h3>
          <img src={compressedImage} alt="Compressed" style={{ maxWidth: "100%" }} />
          <a href={compressedImage} download="compressed.webp">Download</a>
        </div>
      )}
    </div>
  );
};

export default CompressImage;
