import type { Redis } from "ioredis";
import {
  AuthenticationState,
  BufferJSON,
  initAuthCreds,
  SignalDataTypeMap,
  SignalKeyStore
} from "@whiskeysockets/baileys";

type KeyType = keyof SignalDataTypeMap;
const jstr = (v: unknown) => JSON.stringify(v, BufferJSON.replacer);
const jprs = <T>(s: string) => JSON.parse(s, BufferJSON.reviver) as T;

export async function chiakiCustomAuth(
  redis: Redis,
  namespace = "chiaki:auth"
): Promise<{ state: AuthenticationState; saveCreds: () => Promise<void> }> {
  const credsKey = `${namespace}:creds`;
  const rawCreds = await redis.get(credsKey);
  const creds = rawCreds ? jprs<any>(rawCreds) : initAuthCreds();

  const keys: SignalKeyStore = {
    get: async (type: KeyType, ids: string[]) => {
      if (!ids.length) return {};
      const pipe = redis.pipeline();
      const base = `${namespace}:keys:${type}`;

      ids.forEach((id) => pipe.get(`${base}:${id}`));

      const res = await pipe.exec();
      const out: { [id: string]: any } = {};

      ids.forEach((id, i) => {
        const [, val] = res?.[i] || [];
        if (typeof val === "string") out[id] = jprs<any>(val);
      });

      return out;
    },

    set: async (data) => {
      const pipe = redis.pipeline();

      for (const _type of Object.keys(data) as KeyType[]) {
        const entries = Object.entries(data[_type] || {});

        if (!entries.length) continue;

        const base = `${namespace}:keys:${_type}`;

        for (const [id, value] of entries) {
          if (value == null) {
            pipe.del(`${base}:${id}`);
          } else {
            pipe.set(`${base}:${id}`, jstr(value));
          }
        }
      }
      await pipe.exec();
    }
  };

  const state: AuthenticationState = { creds, keys };
  const saveCreds = async () => {
    await redis.set(credsKey, jstr(state.creds));
  };

  return { state, saveCreds };
}
