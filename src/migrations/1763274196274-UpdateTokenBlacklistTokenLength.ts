import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTokenBlacklistTokenLength1763274196274 implements MigrationInterface {
    name = 'UpdateTokenBlacklistTokenLength1763274196274'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_8c2ca80e62a4a178870aa9e7a0\` ON \`token_blacklist\``);
        await queryRunner.query(`ALTER TABLE \`token_blacklist\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`token_blacklist\` ADD \`token\` text NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_8c2ca80e62a4a178870aa9e7a0\` ON \`token_blacklist\` (\`token\`)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX \`IDX_8c2ca80e62a4a178870aa9e7a0\` ON \`token_blacklist\``);
        await queryRunner.query(`ALTER TABLE \`token_blacklist\` DROP COLUMN \`token\``);
        await queryRunner.query(`ALTER TABLE \`token_blacklist\` ADD \`token\` varchar(512) NOT NULL`);
        await queryRunner.query(`CREATE INDEX \`IDX_8c2ca80e62a4a178870aa9e7a0\` ON \`token_blacklist\` (\`token\`)`);
    }

}
