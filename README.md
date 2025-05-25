# Chiaki Bot

Bot para uso geral no Whatsapp. Por mais que tenha um uso simples e uma configuração igualmente simples, isso não exclui o seu poder.

Chiaki é uma solução simplificada de automação para WhatsApp, composta por três módulos integrados:
- **chiaki-bot**: bot de WhatsApp para automação de gerenciamento, brincadeiras, criação de figurinhas e administração de grupos.
- **chiaki-web-painel**: painel web para consultas, visualização de dados e controle das funcionalidades do bot.
- **ChiakiBot-API**: backend responsável pelo gerenciamento de dados e integração entre o bot e o painel.

## 📦 Estrutura do Projeto
```
/chiaki-bot           → Bot principal do WhatsApp
/chiaki-web-painel    → Painel web para administração
/ChiakiBot-API        → Backend para gerenciamento de dados
/docker-compose.yml   → Orquestração dos serviços
```
## 🚀 Tecnologias Utilizadas
- **Docker**: Contêineres para todos os serviços.
- **Node.js**: Núcleo do bot.
- **WebSockets**: Para o envio do QRCode de conexão para o front-end
- **FFMPEG**: Para a geração de figurinhas
- **Multer**: Para gerenciamento de imagens no backend
- **NestJS**: Backend API.
- **SQLite**: Banco de dados, perfeito para o caso de uso
- **Angular**: Painel web
- **Bootstrap**: Para estilização

## ⚙️ Funcionalidades
- ✅ Gerenciamento de grupos
- ✅ Criação de figurinhas
- ✅ Funcionalidades de entretenimento e brincadeiras
- ✅ Administração completa de grupos via bot
- ✅ Painel web para consultas e relatórios
- ✅ Backend centralizado para armazenamento e gerenciamento

## 🐳 Como executar
1. Clone o repositório: `git clone https://github.com/Rubrical/chiaki-bot-project.git`
2. Configure as variáveis de ambiente do bot em `docker-compose.yml`.
3. Execute-o com `docker compose up --build -d`
> Obs: Do jeito que está o painel web deve funcionar sem nenhum problema. Mas caso hajam problemas com o ambiente do painel web vá até `/chiaki-web-painel/src/environments/environment.ts`.

# Comandos de exemplo:
- `menu`: Mostra todas as funcionalidades do bot
- `s`: Cria uma figurinha ao marcar ou enviar ou uma foto, ou gif ou vídeo curto
-  `msg-status`: Verifica o status das mensagens de boas-vindas e adeus, que são ativadas ao evento de entrada e saída de membros de um grupo
-  `rank`: Mostra o rank dos usuários com mais mensagens em um grupo  

## 📬 Contato
Em caso de dúvidas, sugestões ou problemas, entre em contato:
Filipe – [filipesalviano@proton.me]

## 📄 Licença
Este projeto está licenciado sob os termos da GNU General Public License v3.0. Consulte o arquivo LICENSE para mais informações.
