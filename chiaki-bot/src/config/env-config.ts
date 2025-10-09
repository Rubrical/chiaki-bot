import { config } from "dotenv";
import { createHttpClient } from "../adapters/http";

config();

const { BACKEND_URL } = process.env;
const { PREFIX } = process.env;
const { VALKEY_HOST } = process.env;
const { VALKEY_PASSWORD } = process.env;
const { BOT_NAME } = process.env;

console.log(BACKEND_URL);
console.log(PREFIX);
console.log(VALKEY_HOST);

if (!BACKEND_URL || BACKEND_URL.length === 0)
    throw new Error("Url do backend não definida");

export const api = createHttpClient(BACKEND_URL);
export const prefix = PREFIX || "/";
export const valkeyHost = VALKEY_HOST;
export const valkeyPassword = VALKEY_PASSWORD;
