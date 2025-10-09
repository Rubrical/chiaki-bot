import * as linkify from 'linkifyjs'
import { spawn } from 'node:child_process'
import { JidInfo, JidType } from '../types/domain.d';

export const extractNumbers = (content: string): string[] => {
  const numbers = content.match(/-?\d+/g);
  return numbers ?? [];
}

export const extractUrls = (content: string): string[] =>
  linkify.find(content).map((url) => url.value)

export const removeDuplicates = <T>(arr: T[]): T[] => [...new Set(arr)]

function withTimeout<T>(p: Promise<T>, ms = 3000): Promise<T> {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error("timeout")), ms);

    p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); });
  });
}

export function verifyIfFFMPEGisInstalled(): Promise<boolean> {
  return withTimeout(new Promise<boolean>((resolve) => {
    let settled = false;
    const done = (v: boolean) => { if (!settled) { settled = true; resolve(v); proc.kill(); } };
    const proc = spawn(process.env.FFMPEG_BIN || "ffmpeg", ["-version"]);

    proc.on("error", () => done(false));
    proc.on("close", code => done(code === 0));
  }), 3000).catch(() => false);
}

export function verifyIfYtDlpIsInstalled(): Promise<boolean> {
  return withTimeout(new Promise<boolean>((resolve) => {
    let settled = false;
    const done = (v: boolean) => { if (!settled) { settled = true; resolve(v); proc.kill(); } };
    const bin = process.env.YT_DLP_BIN || "/usr/local/bin/yt-dlp";
    const proc = spawn(bin, ["--version"], { env: { ...process.env, YT_DLP_NO_UPDATE: "1" } });

    proc.on("error", () => done(false));
    proc.on("close", code => done(code === 0));
  }), 3000).catch(() => false);
}

export const validateRemoteJid = (remoteJid: string): JidInfo => {
  const fromPrivate = '@s.whatsapp.net';
  const fromGroup = '@g.us';
  const phoneNumber = remoteJid.split("@")[0];

  if (remoteJid.endsWith(fromGroup)) return { phoneNumber: phoneNumber, type: JidType.GROUP }
  if (remoteJid.endsWith(fromPrivate)) return { phoneNumber: phoneNumber, type: JidType.PRIVATE }

  return { phoneNumber: phoneNumber, type: JidType.UNKNOWN };
}

export const getExtensionFromUrl = (url: string): string => url.split(".").pop()?.toLowerCase() || "";

export const runningTime = (startDate: Date) => {
  const uptimeMs = new Date().getTime() - startDate.getTime();
  let seconds = Math.floor(uptimeMs / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  return `Running for: ${days}d ${hours}h ${minutes}m ${seconds}s`;
}
