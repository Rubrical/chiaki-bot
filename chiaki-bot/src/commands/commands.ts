import { ChiakiClient, IChiakiCommand } from "../types/types";
import addAdvertence from "./add-adv";
import addImg from "./add-img";
import atAdeus from "./at-adeus";
import atBv from "./at-bv";
import banUser from "./ban";
import chance from "./chance";
import deleteMessage from "./delete";
import divorce from "./divorce";
import editAdeus from "./edit-adeus";
import editBv from "./edit-bv";
import gay from "./gay";
import help from "./help";
import hottie from "./hottie";
import kiss from "./kiss";
import marry from "./marry";
import mentionAll from "./mention-all";
import menu from "./menu";
import msgStatus from "./msg-status";
import poke from "./poke";
import rank from "./rank";
import removeAdvertence from "./rem-adv";
import remove from "./remove";
import rich from "./rich";
import shipp from "./shipp";
import slap from "./slap";
import steal from "./steal";
import stickerCommand from "./sticker";
import unbanUser from "./unban";

const commands: Array<IChiakiCommand> = [
    help,
    menu,
    remove,
    mentionAll,
    deleteMessage,
    stickerCommand,
    addAdvertence,
    removeAdvertence,
    atBv,
    atAdeus,
    editBv,
    editAdeus,
    banUser,
    unbanUser,
    rank,
    msgStatus,
    addImg,
    kiss,
    slap,
    gay,
    shipp,
    steal,
    rich,
    marry,
    divorce,
    hottie,
    poke,
    chance
];

export const loadCommands = (client: ChiakiClient): ChiakiClient => {
    commands.forEach((x) => {
        client.cmd.set(x.command.name, x);
        client.log.info(`Comando ${x.command.name} carregado com sucesso`);
    });
    return client;
}
