import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1763444641564 implements MigrationInterface {
    name = 'Migration1763444641564'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`student_assigned_tests\` (\`id\` varchar(36) NOT NULL, \`candidate_id\` varchar(10) NOT NULL, \`student_id\` varchar(255) NOT NULL, \`test_id\` varchar(255) NOT NULL, \`center_id\` varchar(255) NOT NULL, \`assigned_by\` varchar(255) NOT NULL, \`test_start_time\` datetime NULL, \`test_end_time\` datetime NULL, \`status\` enum ('pending', 'in_progress', 'completed', 'expired') NOT NULL DEFAULT 'pending', \`completed_at\` datetime NULL, \`test_results\` json NULL, \`notes\` text NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_a5dbeea637b7fcf95ed9294ce3\` (\`candidate_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` ADD CONSTRAINT \`FK_db90b079e1904037259cf60bb59\` FOREIGN KEY (\`student_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` ADD CONSTRAINT \`FK_7c263c3918faef5792e5db70500\` FOREIGN KEY (\`test_id\`) REFERENCES \`ielts_tests\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` ADD CONSTRAINT \`FK_ef21d4261ce4e67d2d6a4a75155\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` ADD CONSTRAINT \`FK_a8bfb3d44c2ac96b085af5a693a\` FOREIGN KEY (\`assigned_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` DROP FOREIGN KEY \`FK_a8bfb3d44c2ac96b085af5a693a\``);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` DROP FOREIGN KEY \`FK_ef21d4261ce4e67d2d6a4a75155\``);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` DROP FOREIGN KEY \`FK_7c263c3918faef5792e5db70500\``);
        await queryRunner.query(`ALTER TABLE \`student_assigned_tests\` DROP FOREIGN KEY \`FK_db90b079e1904037259cf60bb59\``);
        await queryRunner.query(`DROP INDEX \`IDX_a5dbeea637b7fcf95ed9294ce3\` ON \`student_assigned_tests\``);
        await queryRunner.query(`DROP TABLE \`student_assigned_tests\``);
    }

}
