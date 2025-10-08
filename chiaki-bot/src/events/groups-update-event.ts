import { GroupMetadata } from "@whiskeysockets/baileys";
import { ChiakiClient } from "../types/types";
import { GroupsService } from "../services/group-service";
import { CacheManager } from "../adapters/cache";

export async function GroupsUpdate(event: Partial<GroupMetadata>[], client: ChiakiClient) {
    client.log.info("[Group Update Event] Atualização de grupos ----");
    client.log.info("[Group Update Event] "+JSON.stringify(event));

    for (const updateEvent of event) {
        const groupId = updateEvent.id;
        const metadata = await client.groupMetadata(groupId);
        const updatedGroup = await GroupsService.updateGroup(groupId, {
            descricaoGrupo: updateEvent?.desc,
            donoGrupoId: updateEvent?.owner,
            nomeGrupo: updateEvent?.subject,
            whatsappGroupId: groupId,
        });

        await CacheManager.set(`groups:${groupId}`, metadata, 600);
        if (!updatedGroup) client.log.warn(`[Group Update Event] Um erro ocorreu na atualização do grupo ${updateEvent?.subject}`);
    }
}
