import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import webp from 'node-webpmux';
import fileType from "file-type";
import jimp from 'jimp';
import { StickerError } from '../types/sticker-error';
import logger from '../logger';

export type StickerType = 'resize' | 'contain' | 'circle';

export interface StickerOptions {
  pack?: string;
  author?: string;
  fps?: number;
  type?: StickerType;
}

function getTempPath(ext: string): string {
  const filename = `${Date.now()}_${Math.floor(Math.random() * 10000)}.${ext}`;
  return path.join(__dirname, '../temp', filename);
}

async function getVideoDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 0);
    });
  });
}

export async function createSticker(
  mediaBuffer: Buffer,
  { pack = "", author = '', fps = 9, type = 'resize' }: StickerOptions
): Promise<Buffer> {
  const bufferData = await fileType.fromBuffer(mediaBuffer);
  if (!bufferData) throw new StickerError('Tipo de mídia não identificado');

  const mime = bufferData.mime;
  const isAnimated = mime.startsWith('video') || mime.includes('gif');

  if (isAnimated && mediaBuffer.length > 5 * 1024 * 1024) {
    throw new StickerError('❌ O vídeo excede 5MB, não é possível criar a figurinha.');
  }

  if (mime === 'image/webp') {
    mediaBuffer = await pngConvertion(mediaBuffer);
  }

  const webpBuffer = await webpConvertion(mediaBuffer, isAnimated, fps, type);
  const stickerBuffer = await addExif(webpBuffer, pack, author);
  return stickerBuffer;
}

async function webpConvertion(
  mediaBuffer: Buffer,
  isAnimated: boolean,
  fps: number,
  type: StickerType
): Promise<Buffer> {
  const inputPath = getTempPath(isAnimated ? 'mp4' : 'png');
  const outputPath = getTempPath('webp');

  if (!isAnimated && type !== 'resize') {
    mediaBuffer = await editImage(mediaBuffer, type);
  }

  await fs.writeFile(inputPath, mediaBuffer);

  if (isAnimated) {
    const duration = await getVideoDuration(inputPath);
    if (duration > 10) {
      await fs.unlink(inputPath);
      throw new StickerError('❌ O vídeo tem mais de 10 segundos. Use um vídeo mais curto.');
    }
  }

  try {
    const options = isAnimated
      ? [
          '-vcodec', 'libwebp',
          '-filter:v', `fps=${fps}`,
          '-lossless', '1',
          '-compression_level', '6',
          '-q:v', '50',
          '-loop', '0',
          '-preset', 'default',
          '-an', '-vsync', '0',
          '-s', '512:512',
          '-t', '6'
        ]
      : [
          '-vcodec', 'libwebp',
          '-loop', '0',
          '-lossless', '1',
          '-q:v', '100',
          '-preset', 'picture',,
          '-pix_fmt', 'yuva420p',
          '-vf', 'scale=512:512:force_original_aspect_ratio=decrease:eval=frame,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000'
        ];

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions(options)
        .save(outputPath)
        .on('end', resolve)
        .on('error', reject);
    });

    const buffer = await fs.readFile(outputPath);
    return buffer;
  } finally {
    if (await fs.pathExists(outputPath)) await fs.unlink(outputPath);
    if (await fs.pathExists(inputPath)) await fs.unlink(inputPath);
  }
}

async function pngConvertion(mediaBuffer: Buffer): Promise<Buffer> {
  const input = getTempPath('webp');
  const output = getTempPath('png');
  await fs.writeFile(input, mediaBuffer);

  await new Promise<void>((resolve, reject) => {
    ffmpeg(input)
      .save(output)
      .on('end', resolve)
      .on('error', reject);
  });

  const buffer = await fs.readFile(output);
  await fs.unlink(input);
  await fs.unlink(output);
  return buffer;
}

async function editImage(buffer: Buffer, type: StickerType): Promise<Buffer> {
  logger.error(`${JSON.stringify(buffer)}`);
  logger.error(`${JSON.stringify(type)}`);

  const image = await jimp.read(buffer);
  if (type === 'contain') image.contain(512, 512);
  else if (type === 'circle') {
    image.resize(512, 512);
    image.circle();
  } else {
    return buffer; // preserve original for 'resize'
  }
  return image.getBufferAsync('image/png');
}

async function addExif(buffer: Buffer, pack: string, author: string): Promise<Buffer> {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString('hex');
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00
  ]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);

  await img.load(buffer);
  img.exif = exif;
  return img.save(null);
}
