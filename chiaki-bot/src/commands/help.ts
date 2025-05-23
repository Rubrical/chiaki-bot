import { IChiakiCommand, SerializedMessage } from "../types/types";


const help: IChiakiCommand = {
    command: {
        name: "help",
        aliases: ["help", "ajuda", "?"],
        category: "geral",
        usage: "help {comando}",
        description: "Mostra informações detalhadas sobre um comando específico"
    },

    async execute(client, flag, arg, M, rawMessage) {
        if (!arg) {
            client.sendMessage(
                M.from,
                {
                    text: `⚠️ Uso correto: ${client.config.prefix}help [comando]\nExemplo: ${client.config.prefix}help sticker`,
                },
                { quoted: M }
            );
            return;
        }

        const commandName = arg.toLowerCase().trim();
        let command: IChiakiCommand | undefined = client.cmd.get(commandName);

        if (!command) {
            for (const [, cmd] of client.cmd.entries()) {
                if (
                    cmd.command.aliases?.includes(commandName)
                ) {
                    command = cmd;
                    break;
                }
            }
            return;
        }

        if (!command) {
            client.sendMessage(
                M.from,
                {
                    text: `❌ Comando "${commandName}" não encontrado. Use ${client.config.prefix}menu para ver todos os comandos disponíveis.`,
                },
                { quoted: M }
            );
            return;
        }

        const { prefix } = client.config;
        const { name, description, aliases, category, usage } = command.command;

        let helpText = `*📚 AJUDA: ${name}*\n\n`;
        helpText += `📝 *Descrição*: ${description || 'Sem descrição'}\n\n`;

        if (aliases?.length) {
            helpText += `🔄 *Aliases*: ${aliases.map(a => `${prefix}${a}`).join(', ')}\n\n`;
        }

        if (category) {
            helpText += `🏷️ *Categoria*: ${category}\n\n`;
        }

        if (usage) {
            helpText += `💻 *Uso*: ${prefix}${name} ${usage}\n\n`;
        }

        await client.sendMessage(M.from, { text: helpText }, { quoted: M });
    }
}


export default help;