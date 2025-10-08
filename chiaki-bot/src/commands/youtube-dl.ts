import { IChiakiCommand } from "../types/types";
import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import os from "os";
import yts from "yt-search";
import logger from "../logger";

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
const MAX_MB = 100;

async function runYtDlp(url: string, audio = false): Promise<{ filePath: string; title: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "yt-"));
  const outTpl = path.join(tmpDir, "%(title).80s.%(ext)s");

  const args = [
    "--no-playlist",
    "--force-overwrites",
    "--restrict-filenames",
    "--max-filesize", `${MAX_MB}M`,
    "-o", outTpl,
    "--print", "before_dl:TITLE=%(title)s",
    "--print", "after_move:FILE=%(filepath)s",

    "--extractor-args", "youtube:player_client=android",
    "--concurrent-fragments", "1",
    "--http-chunk-size", "10M",
    "--force-ipv4",
    "--retries", "infinite",
    "--fragment-retries", "infinite",
    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  if (audio) {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", "0");
  } else {
    args.push(
      "-f",
      `mp4[filesize<${MAX_MB}M]/mp4[height<=360][ext=mp4]/bv*[height<=360][ext=mp4]+ba[ext=m4a]`,
      "--merge-output-format", "mp4"
    );
  }

  args.push(url);

  const child = spawn("yt-dlp", args, { stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "", stderr = "";
  child.stdout.on("data", d => (stdout += d.toString()));
  child.stderr.on("data", d => (stderr += d.toString()));

  await new Promise<void>((resolve, reject) => {
    child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`yt-dlp exit ${code}: ${stderr || stdout}`)));
  });

  const lines = stdout.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  let title = "YouTube";
  let filePath: string | undefined;

  for (const line of lines) {
    if (line.startsWith("TITLE=")) title = line.substring(6);
    else if (line.startsWith("FILE=")) filePath = line.substring(5);
  }

  if (!filePath || !(await exists(filePath))) {
    const files = await fs.readdir(tmpDir);
    const targetExt = audio ? ".mp3" : ".mp4";
    const found = files.find(f => f.toLowerCase().endsWith(targetExt));
    if (found) filePath = path.join(tmpDir, found);
  }

  if (!filePath || !(await exists(filePath))) {
    throw new Error(`Falha ao localizar o arquivo baixado.\nSaída:\n${stdout}\nErros:\n${stderr}`);
  }

  const stat = await fs.stat(filePath);
  if (stat.size > MAX_MB * 1024 * 1024) {
    throw new Error(`Arquivo final ${(stat.size / 1024 / 1024).toFixed(2)}MB excede ${MAX_MB}MB`);
  }

  return { filePath, title };
}

async function exists(p: string) {
  try { await fs.access(p); return true; } catch { return false; }
}

function toMp3FileName(title: string) {
  const base = title.replace(/[^\w\s.-]+/g, "_").trim().slice(0, 80) || "audio";
  return base.endsWith(".mp3") ? base : `${base}.mp3`;
}

const youtubeDlCommand: IChiakiCommand = {
  command: {
    name: "youtube",
    aliases: ["yt", "play"],
    category: "utilidades",
    usage: "youtube <link ou termo> [--mp3|--audio]",
    description: "Baixa um vídeo (mp4) ou áudio (mp3) do YouTube de até 100MB.",
  },

  async execute(client, flag, arg, M) {
    if (!arg) {
      return M.reply("❌ Forneça a URL de um vídeo do YouTube ou um termo para busca.");
    }

    const audio = Array.isArray(flag) && flag.some(f => /^(--)?(mp3|audio)$/i.test(f));

    await M.reply(audio ? "🎵 Baixando áudio em MP3, aguarde..." : "🎬 Baixando vídeo em MP4, aguarde...");

    try {
      let videoUrl = arg;
      if (!YOUTUBE_URL_REGEX.test(arg)) {
        const searchResult = await yts(arg);
        const video = searchResult.videos?.[0];
        if (!video) return M.reply("❌ Nenhum vídeo encontrado para sua busca.");
        videoUrl = video.url;
      }

      const result = await runYtDlp(videoUrl, audio);
      if (!result) throw new Error("Falha ao baixar!");

      const { filePath, title } = result;
      const buffer = await fs.readFile(filePath);

      if (!buffer || buffer.length === 0) {
        throw new Error("Buffer de arquivo vazio (nada para enviar).");
      }

      if (audio) {
        await client.sendMessage(
          M.from,
          {
            audio: buffer,
            mimetype: "audio/mpeg",
            fileName: toMp3FileName(title),
          },
          { quoted: M }
        );
      } else {
        await client.sendMessage(
          M.from,
          { video: buffer, caption: `🎬 *Título:* ${title}` },
          { quoted: M }
        );
      }

      const dir = path.dirname(filePath);
      await fs.unlink(filePath).catch(() => {});
      await (fs as any).rm?.(dir, { recursive: true, force: true }).catch(async () => {
        try { await fs.rmdir(dir); } catch {}
      });
    } catch (error: any) {
      logger.error("[Comandos] Erro no comando YouTube:", error);

      await M.reply("❌ Erro ao baixar e enviar. Consulte o administrador.");
    }
  },
};

export default youtubeDlCommand;
