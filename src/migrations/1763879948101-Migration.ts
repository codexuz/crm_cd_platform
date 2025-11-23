import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763879948101 implements MigrationInterface {
    name = 'Migration1763879948101'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` ADD \`listening_final\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` ADD \`reading_final\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` ADD \`writing_final\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`media\` CHANGE \`uploaded_by\` \`uploaded_by\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`centers\` ADD CONSTRAINT \`FK_df866b8cb111bce1d7a663df6aa\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`media\` ADD CONSTRAINT \`FK_8468de6d91985f53a1a3324741c\` FOREIGN KEY (\`uploaded_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`media\` DROP FOREIGN KEY \`FK_8468de6d91985f53a1a3324741c\``);
        await queryRunner.query(`ALTER TABLE \`centers\` DROP FOREIGN KEY \`FK_df866b8cb111bce1d7a663df6aa\``);
        await queryRunner.query(`ALTER TABLE \`media\` CHANGE \`uploaded_by\` \`uploaded_by\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` DROP COLUMN \`writing_final\``);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` DROP COLUMN \`reading_final\``);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` DROP COLUMN \`listening_final\``);
    }

}
