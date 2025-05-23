import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1745020942348 implements MigrationInterface {
  name = 'InitialSchema1745020942348';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "mensagens" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "chaveMensagem" varchar NOT NULL, "mensagem" varchar NOT NULL, "midia" varchar)`,
    );
    await queryRunner.query(
      `CREATE TABLE "grupos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "whatsappGroupId" varchar NOT NULL, "nomeGrupo" varchar NOT NULL, "donoGrupoId" varchar, "descricaoGrupo" varchar, "msgEntradaAtiva" boolean NOT NULL DEFAULT (1), "msgSaidaAtiva" boolean NOT NULL DEFAULT (1), "mensagemEntradaId" integer, "mensagemSaidaId" integer, CONSTRAINT "REL_d5c2a0cfab83449d90617c74c4" UNIQUE ("mensagemEntradaId"), CONSTRAINT "REL_99c6ef617410c1a378c8b9550a" UNIQUE ("mensagemSaidaId"))`,
    );
    await queryRunner.query(`CREATE INDEX "whatsapp_id_group" ON "grupos" ("whatsappGroupId") `);
    await queryRunner.query(
      `CREATE TABLE "advertencias" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "motivoAdvertencia" varchar NOT NULL, "id_grupo_usuario" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "grupo_usuario" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "comandosExecutados" integer NOT NULL DEFAULT (0), "quantidadeMensagens" integer NOT NULL DEFAULT (0), "id_grupo" integer, "id_usuario" integer)`,
    );
    await queryRunner.query(
      `CREATE TABLE "usuários" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "remoteJid" varchar NOT NULL, "nome" varchar NOT NULL, "tipoUsuario" integer NOT NULL, CONSTRAINT "UQ_868fd58d411e989b302aa72c9f1" UNIQUE ("remoteJid"))`,
    );
    await queryRunner.query(`CREATE INDEX "remoteJid" ON "usuários" ("remoteJid") `);
    await queryRunner.query(
      `CREATE TABLE "banidos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "remoteJid" varchar NOT NULL, "motivoBan" varchar, "id_grupo" integer, CONSTRAINT "UQ_d5e2c261116affd560b9210d38f" UNIQUE ("remoteJid"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "root" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "login" varchar NOT NULL, "senha" varchar NOT NULL)`,
    );
    await queryRunner.query(`DROP INDEX "whatsapp_id_group"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_grupos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "whatsappGroupId" varchar NOT NULL, "nomeGrupo" varchar NOT NULL, "donoGrupoId" varchar, "descricaoGrupo" varchar, "msgEntradaAtiva" boolean NOT NULL DEFAULT (1), "msgSaidaAtiva" boolean NOT NULL DEFAULT (1), "mensagemEntradaId" integer, "mensagemSaidaId" integer, CONSTRAINT "REL_d5c2a0cfab83449d90617c74c4" UNIQUE ("mensagemEntradaId"), CONSTRAINT "REL_99c6ef617410c1a378c8b9550a" UNIQUE ("mensagemSaidaId"), CONSTRAINT "FK_d5c2a0cfab83449d90617c74c42" FOREIGN KEY ("mensagemEntradaId") REFERENCES "mensagens" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_99c6ef617410c1a378c8b9550a4" FOREIGN KEY ("mensagemSaidaId") REFERENCES "mensagens" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_grupos"("id", "dataCadastro", "dataInativo", "whatsappGroupId", "nomeGrupo", "donoGrupoId", "descricaoGrupo", "msgEntradaAtiva", "msgSaidaAtiva", "mensagemEntradaId", "mensagemSaidaId") SELECT "id", "dataCadastro", "dataInativo", "whatsappGroupId", "nomeGrupo", "donoGrupoId", "descricaoGrupo", "msgEntradaAtiva", "msgSaidaAtiva", "mensagemEntradaId", "mensagemSaidaId" FROM "grupos"`,
    );
    await queryRunner.query(`DROP TABLE "grupos"`);
    await queryRunner.query(`ALTER TABLE "temporary_grupos" RENAME TO "grupos"`);
    await queryRunner.query(`CREATE INDEX "whatsapp_id_group" ON "grupos" ("whatsappGroupId") `);
    await queryRunner.query(
      `CREATE TABLE "temporary_advertencias" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "motivoAdvertencia" varchar NOT NULL, "id_grupo_usuario" integer, CONSTRAINT "FK_d04c2fa7e18172de2db08abb7cb" FOREIGN KEY ("id_grupo_usuario") REFERENCES "grupo_usuario" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_advertencias"("id", "dataCadastro", "dataInativo", "motivoAdvertencia", "id_grupo_usuario") SELECT "id", "dataCadastro", "dataInativo", "motivoAdvertencia", "id_grupo_usuario" FROM "advertencias"`,
    );
    await queryRunner.query(`DROP TABLE "advertencias"`);
    await queryRunner.query(`ALTER TABLE "temporary_advertencias" RENAME TO "advertencias"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_grupo_usuario" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "comandosExecutados" integer NOT NULL DEFAULT (0), "quantidadeMensagens" integer NOT NULL DEFAULT (0), "id_grupo" integer, "id_usuario" integer, CONSTRAINT "FK_e42a84102f55e1be84bfb5753f7" FOREIGN KEY ("id_grupo") REFERENCES "grupos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_36c252893b71123339082c8b7a1" FOREIGN KEY ("id_usuario") REFERENCES "usuários" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_grupo_usuario"("id", "dataCadastro", "dataInativo", "comandosExecutados", "quantidadeMensagens", "id_grupo", "id_usuario") SELECT "id", "dataCadastro", "dataInativo", "comandosExecutados", "quantidadeMensagens", "id_grupo", "id_usuario" FROM "grupo_usuario"`,
    );
    await queryRunner.query(`DROP TABLE "grupo_usuario"`);
    await queryRunner.query(`ALTER TABLE "temporary_grupo_usuario" RENAME TO "grupo_usuario"`);
    await queryRunner.query(
      `CREATE TABLE "temporary_banidos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "remoteJid" varchar NOT NULL, "motivoBan" varchar, "id_grupo" integer, CONSTRAINT "UQ_d5e2c261116affd560b9210d38f" UNIQUE ("remoteJid"), CONSTRAINT "FK_30b37f6d5bc62e99a477dec255f" FOREIGN KEY ("id_grupo") REFERENCES "grupos" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`,
    );
    await queryRunner.query(
      `INSERT INTO "temporary_banidos"("id", "dataCadastro", "dataInativo", "remoteJid", "motivoBan", "id_grupo") SELECT "id", "dataCadastro", "dataInativo", "remoteJid", "motivoBan", "id_grupo" FROM "banidos"`,
    );
    await queryRunner.query(`DROP TABLE "banidos"`);
    await queryRunner.query(`ALTER TABLE "temporary_banidos" RENAME TO "banidos"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "banidos" RENAME TO "temporary_banidos"`);
    await queryRunner.query(
      `CREATE TABLE "banidos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "remoteJid" varchar NOT NULL, "motivoBan" varchar, "id_grupo" integer, CONSTRAINT "UQ_d5e2c261116affd560b9210d38f" UNIQUE ("remoteJid"))`,
    );
    await queryRunner.query(
      `INSERT INTO "banidos"("id", "dataCadastro", "dataInativo", "remoteJid", "motivoBan", "id_grupo") SELECT "id", "dataCadastro", "dataInativo", "remoteJid", "motivoBan", "id_grupo" FROM "temporary_banidos"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_banidos"`);
    await queryRunner.query(`ALTER TABLE "grupo_usuario" RENAME TO "temporary_grupo_usuario"`);
    await queryRunner.query(
      `CREATE TABLE "grupo_usuario" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "comandosExecutados" integer NOT NULL DEFAULT (0), "quantidadeMensagens" integer NOT NULL DEFAULT (0), "id_grupo" integer, "id_usuario" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "grupo_usuario"("id", "dataCadastro", "dataInativo", "comandosExecutados", "quantidadeMensagens", "id_grupo", "id_usuario") SELECT "id", "dataCadastro", "dataInativo", "comandosExecutados", "quantidadeMensagens", "id_grupo", "id_usuario" FROM "temporary_grupo_usuario"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_grupo_usuario"`);
    await queryRunner.query(`ALTER TABLE "advertencias" RENAME TO "temporary_advertencias"`);
    await queryRunner.query(
      `CREATE TABLE "advertencias" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "motivoAdvertencia" varchar NOT NULL, "id_grupo_usuario" integer)`,
    );
    await queryRunner.query(
      `INSERT INTO "advertencias"("id", "dataCadastro", "dataInativo", "motivoAdvertencia", "id_grupo_usuario") SELECT "id", "dataCadastro", "dataInativo", "motivoAdvertencia", "id_grupo_usuario" FROM "temporary_advertencias"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_advertencias"`);
    await queryRunner.query(`DROP INDEX "whatsapp_id_group"`);
    await queryRunner.query(`ALTER TABLE "grupos" RENAME TO "temporary_grupos"`);
    await queryRunner.query(
      `CREATE TABLE "grupos" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "dataCadastro" datetime NOT NULL DEFAULT (datetime('now')), "dataInativo" datetime, "whatsappGroupId" varchar NOT NULL, "nomeGrupo" varchar NOT NULL, "donoGrupoId" varchar, "descricaoGrupo" varchar, "msgEntradaAtiva" boolean NOT NULL DEFAULT (1), "msgSaidaAtiva" boolean NOT NULL DEFAULT (1), "mensagemEntradaId" integer, "mensagemSaidaId" integer, CONSTRAINT "REL_d5c2a0cfab83449d90617c74c4" UNIQUE ("mensagemEntradaId"), CONSTRAINT "REL_99c6ef617410c1a378c8b9550a" UNIQUE ("mensagemSaidaId"))`,
    );
    await queryRunner.query(
      `INSERT INTO "grupos"("id", "dataCadastro", "dataInativo", "whatsappGroupId", "nomeGrupo", "donoGrupoId", "descricaoGrupo", "msgEntradaAtiva", "msgSaidaAtiva", "mensagemEntradaId", "mensagemSaidaId") SELECT "id", "dataCadastro", "dataInativo", "whatsappGroupId", "nomeGrupo", "donoGrupoId", "descricaoGrupo", "msgEntradaAtiva", "msgSaidaAtiva", "mensagemEntradaId", "mensagemSaidaId" FROM "temporary_grupos"`,
    );
    await queryRunner.query(`DROP TABLE "temporary_grupos"`);
    await queryRunner.query(`CREATE INDEX "whatsapp_id_group" ON "grupos" ("whatsappGroupId") `);
    await queryRunner.query(`DROP TABLE "root"`);
    await queryRunner.query(`DROP TABLE "banidos"`);
    await queryRunner.query(`DROP INDEX "remoteJid"`);
    await queryRunner.query(`DROP TABLE "usuários"`);
    await queryRunner.query(`DROP TABLE "grupo_usuario"`);
    await queryRunner.query(`DROP TABLE "advertencias"`);
    await queryRunner.query(`DROP INDEX "whatsapp_id_group"`);
    await queryRunner.query(`DROP TABLE "grupos"`);
    await queryRunner.query(`DROP TABLE "mensagens"`);
  }
}
