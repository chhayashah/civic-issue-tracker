import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "Koi file nahi mili" },
        { status: 400 }
      );
    }

    // File ko buffer mein convert karo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Cloudinary pe upload karo
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "civic-issues" }, // Cloudinary mein isi naam ka folder banega
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const uploadResult = result as { secure_url: string };

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Image upload nahi ho payi" },
      { status: 500 }
    );
  }
}