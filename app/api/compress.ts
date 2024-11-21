import type { NextApiRequest, NextApiResponse } from "next";
import sharp from "sharp";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  try {
    const buffer = Buffer.from(file, "base64");
    const compressedBuffer = await sharp(buffer).webp({ quality: 50 }).toBuffer();
    res.status(200).json({ compressed: compressedBuffer.toString("base64") });
  } catch (error) {
    res.status(500).json({ error: "Compression failed", details: (error as any)?.message });
  }
}
