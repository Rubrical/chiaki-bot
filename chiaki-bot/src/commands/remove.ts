import { IChiakiCommand } from "../types/types";

const remove: IChiakiCommand = {
  command: {
    name: "remove",
    aliases: ["rem"],
    category: "moderação",
    usage: "rem @usuário",
    description: "Remove o(s) usuário(s) mencionado(s). Máximo de 5 por vez.",
  },

  async execute(client, flag, arg, M) {
    if (!M.mentions.length) {
      await M.reply("🟥 *Mencione para remover*");
      return;
    }

    const mentions = client.utils.removeDuplicates(M.mentions);
    if (mentions.length > 5) {
      await M.reply("🟥 *Você só pode remover até 5 usuários por vez!*");
      return;
    }
    client.log.info(`Administrador ${M.from} está removendo os seguintes usuários: ${mentions}`);

    await client.groupParticipantsUpdate(M.from, mentions, "remove");
    await M.reply(`🟩 *Pronto! Removendo ${mentions.length} usuários*`);
  },
};

export default remove;
