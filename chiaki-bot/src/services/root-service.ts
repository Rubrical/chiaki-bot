import logger from "../logger";
import { api } from "../config/env-config";
import { ChiakiError } from "../types/ChiakiError";

const url = "root";
export const RootService = {
    getRootName: async (): Promise<string> => {
        return await api.get<string>(`${url}/get-root-name`)
            .then((data) => data)
            .catch((err: ChiakiError) => {
                logger.error("[Root Service] "+err.message);
                if (err.code === 404) return "";
            });
    }
};
