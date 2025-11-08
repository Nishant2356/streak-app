import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "user_profiles",
      transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
    });

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (err: any) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: "Image upload failed", details: err.message },
      { status: 500 }
    );
  }
}
