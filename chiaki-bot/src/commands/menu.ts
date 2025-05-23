import { ChiakiCommandCategory, IChiakiCommand } from '../types/types';

const menu: IChiakiCommand = {
  command: {
    name: 'menu',
    aliases: ['menu'],
    category: 'geral',
    usage: '| [cmd]',
    description: 'Mostra lista de comandos'
  },

  async execute(client, flag, arg, M, rawMessage) {
    if (!client.cmd) return;

    const prefix = client.config.prefix;
    const categories: Record<ChiakiCommandCategory, string[]> = {
      geral: [],
      moderação: [],
      utilidades: [],
      brincadeiras: [],
    };

    for (const item of client.cmd.values()) {
      const cat = item.command.category;
      if (!categories[cat]) continue;

      const usage = `${prefix}${item.command.aliases[0]}`;
      categories[cat].push(`🔹 *${usage}* — ${item.command.description}`);
    }

    const categoriaSelecionada = arg.trim().toLowerCase() as ChiakiCommandCategory;

    if (categoriaSelecionada && categories[categoriaSelecionada]) {
      const lista = categories[categoriaSelecionada];

      if (!lista.length) {
        await client.sendMessage(M.from, { text: `⚠️ Nenhum comando encontrado na categoria *${categoriaSelecionada}*.` }, { quoted: M });
        return;
      }

      const titulo = categoriaSelecionada[0].toUpperCase() + categoriaSelecionada.slice(1);
      const mensagem = `📂 *Categoria: ${titulo}*\n\n${lista.join('\n')}`;
      await client.sendMessage(M.from, { text: mensagem }, { quoted: M });
      return;
    }

    const textoCategorias = Object.keys(categories)
      .map(cat => `📂 *${cat[0].toUpperCase() + cat.slice(1)}* → use \`${prefix}menu ${cat}\``)
      .join('\n');

    const mensagem = `*📋 CATEGORIAS DISPONÍVEIS:*\n\n${textoCategorias}\n\nUse o comando acima para ver os comandos da categoria.`;
    await client.sendMessage(M.from, { text: mensagem }, { quoted: M });
  }
};

export default menu;
