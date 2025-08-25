import { valkeyHost } from "../config/env-config";

export const valkeyConnectionOpts = {
  host: valkeyHost,
  port: 6379,
  db: 0,
};
