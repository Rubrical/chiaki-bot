import { GroupMetadata } from "@whiskeysockets/baileys";
import { ChiakiClient } from "../types/types";
import { GroupsService } from "../services/group-service";

export async function GroupsUpdate(event: Partial<GroupMetadata>[], client: ChiakiClient) {
    client.log.info("---- Atualização de grupos ----");
    client.log.info(JSON.stringify(event));

    for (const updateEvent of event) {
        const groupId = updateEvent.id;
        const updatedGroup = await GroupsService.updateGroup(groupId, {
            descricaoGrupo: updateEvent?.desc,
            donoGrupoId: updateEvent?.owner,
            nomeGrupo: updateEvent?.subject,
            whatsappGroupId: groupId,
        });

        if (!updatedGroup) client.log.warn(`Um erro ocorreu na atualização do grupo ${updateEvent?.subject}`);
    }
}
