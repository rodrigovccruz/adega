import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "labels");

function extensionFor(contentType: string): string {
  switch (contentType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

/**
 * Usa Vercel Blob quando BLOB_READ_WRITE_TOKEN está configurado; caso
 * contrário, grava em public/uploads/labels para desenvolvimento local.
 */
export async function saveLabelPhoto(buffer: Buffer, contentType: string): Promise<string> {
  const filename = `${randomUUID()}.${extensionFor(contentType)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`labels/${filename}`, buffer, {
      access: "public",
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  await mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(LOCAL_UPLOAD_DIR, filename), buffer);
  return `/uploads/labels/${filename}`;
}
