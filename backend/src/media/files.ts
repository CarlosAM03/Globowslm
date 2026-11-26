import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { open } from "node:fs/promises";
import type { Readable } from "node:stream";
import { promisify } from "node:util";
import { HttpException, UnprocessableEntityException } from "@nestjs/common";
import sharp from "sharp";

export const MiB = 1024 * 1024;
const pixelLimit = 40_000_000;
export const formats = {
  "image/jpeg": { extension: "jpeg", limit: 15 * MiB },
  "image/png": { extension: "png", limit: 15 * MiB },
  "image/webp": { extension: "webp", limit: 15 * MiB },
  "video/mp4": { extension: "mp4", limit: 100 * MiB },
  "video/webm": { extension: "webm", limit: 100 * MiB },
} as const;

export type MediaMime = keyof typeof formats;
export const isMime = (value: string): value is MediaMime => Object.hasOwn(formats, value);

export async function saveUpload(source: Readable, path: string, maxBytes: number) {
  const file = await open(path, "wx", 0o600);
  const hash = createHash("sha256");
  let size = 0;
  try {
    for await (const raw of source.iterator({ destroyOnReturn: false })) {
      const chunk = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
      size += chunk.byteLength;
      if (size > maxBytes) throw new HttpException("Carga demasiado grande", 413);
      hash.update(chunk);
      await file.writeFile(chunk);
    }
  } finally {
    await file.close();
  }
  if (size !== maxBytes) throw new UnprocessableEntityException();
  return { size, sha256: hash.digest("hex") };
}

const run = promisify(execFile);
type Probe = {
  format?: { format_name?: string; duration?: string };
  streams?: Array<{ width?: number; height?: number; codec_type?: string }>;
};

export async function validateMedia(path: string, mime: MediaMime) {
  try {
    if (mime.startsWith("image/")) {
      const image = sharp(path, { limitInputPixels: pixelLimit, failOn: "warning" });
      const meta = await image.metadata();
      if (meta.format !== formats[mime].extension || !meta.width || !meta.height || meta.width * meta.height > pixelLimit) {
        throw new Error("Formato de imagen");
      }
      await image.stats();
      return { width: meta.width, height: meta.height, duration: null };
    }

    const file = await open(path, "r");
    const header = Buffer.alloc(4096);
    let bytes = 0;
    try {
      bytes = (await file.read(header, 0, header.length, 0)).bytesRead;
    } finally {
      await file.close();
    }

    const validMp4 = bytes >= 12 && header.toString("ascii", 4, 8) === "ftyp";
    const validWebm = bytes >= 8 && header.readUInt32BE(0) === 0x1a45dfa3 &&
      header.subarray(0, bytes).includes(Buffer.from([0x42, 0x82, 0x84, 0x77, 0x65, 0x62, 0x6d]));
    if (mime === "video/mp4" ? !validMp4 : !validWebm) throw new Error("Firma de video");

    const { stdout } = await run("ffprobe", [
      "-v", "error", "-protocol_whitelist", "file,pipe", "-show_entries",
      "format=format_name,duration:stream=codec_type,width,height", "-of", "json", path,
    ], { timeout: 5000, maxBuffer: 64 * 1024 });

    const media = JSON.parse(stdout) as Probe;
    const format = mime === "video/mp4" ? "mp4" : "webm";
    const stream = media.streams?.find(({ codec_type }) => codec_type === "video");
    if (!media.format?.format_name?.split(",").includes(format) || !stream?.width || !stream.height) {
      throw new Error("Contenedor de video");
    }
    const duration = Number(media.format?.duration);
    return { width: stream.width, height: stream.height, duration: Number.isFinite(duration) && duration > 0 ? duration : null };
  } catch {
    throw new HttpException("Formato multimedia inválido", 415);
  }
}

type ByteRange = { start: number; end: number };
export function rangeFor(value: string | undefined, size: number): ByteRange | null | false {
  if (!value) return null;
  const match = /^bytes=(\d{0,15})-(\d{0,15})$/.exec(value);
  if (!match || (!match[1] && !match[2])) return false;
  if (!match[1]) {
    const length = Number(match[2]);
    return length > 0 ? { start: Math.max(0, size - length), end: size - 1 } : false;
  }
  const start = Number(match[1]);
  const end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  return start <= end && start < size ? { start, end } : false;
}
