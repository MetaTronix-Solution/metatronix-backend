import fs from "node:fs/promises";
import path from "node:path";

export async function deleteUpload(fileUrl: string): Promise<void> {
  if (!fileUrl) return;

  try {
    const filePath = path.join(process.cwd(), fileUrl.replace(/^\/+/, ""));

    await fs.unlink(filePath);
  } catch (error: any) {
    // Ignore if the file doesn't exist
    if (error.code !== "ENOENT") {
      console.error("Failed to delete uploaded file:", error);
    }
  }
}
