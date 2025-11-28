import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1764314105301 implements MigrationInterface {
    name = 'Migration1764314105301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`courses\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`course_modules\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`lessons\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`quizzes\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`course_progress\` ADD \`center_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`media\` CHANGE \`uploaded_by\` \`uploaded_by\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`centers\` ADD CONSTRAINT \`FK_df866b8cb111bce1d7a663df6aa\` FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`media\` ADD CONSTRAINT \`FK_8468de6d91985f53a1a3324741c\` FOREIGN KEY (\`uploaded_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_16fcd8ab8bc042688984d5b3934\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`courses\` ADD CONSTRAINT \`FK_adb80a549fe987e3d7fe070aade\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_modules\` ADD CONSTRAINT \`FK_81644557c2401f37fe9e884e884\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_modules\` ADD CONSTRAINT \`FK_a4c02d14fae0d7ffd113f3c4965\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lessons\` ADD CONSTRAINT \`FK_35fb2307535d90a6ed290af1f4a\` FOREIGN KEY (\`module_id\`) REFERENCES \`course_modules\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lessons\` ADD CONSTRAINT \`FK_f7beb671190b161ed4cb7c961a2\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quizzes\` ADD CONSTRAINT \`FK_2cf4e4b5b533af8dc6b38d4fa9b\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lessons\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quizzes\` ADD CONSTRAINT \`FK_a160ef69397dd47b2f2ab5b7057\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` ADD CONSTRAINT \`FK_a6f98c2786d5147c99b16e4300f\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lessons\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` ADD CONSTRAINT \`FK_f830d3e1eb46d2ff0b1fd7eb5c2\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` ADD CONSTRAINT \`FK_14c6d2b8f5be0bdb406a3895bb4\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` ADD CONSTRAINT \`FK_927744c908bcf4f5a4499146422\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` ADD CONSTRAINT \`FK_cafc5c15d34d65b3a4d48e15c24\` FOREIGN KEY (\`vocabulary_id\`) REFERENCES \`vocabulary\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` ADD CONSTRAINT \`FK_0d9292b3eb40707950eeeba9617\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` ADD CONSTRAINT \`FK_61ac71f4a08a0fe73f34904c803\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` ADD CONSTRAINT \`FK_980e74721039ebe210fee2eeca2\` FOREIGN KEY (\`lesson_id\`) REFERENCES \`lessons\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` ADD CONSTRAINT \`FK_1701aaf48f6a78e96bfe08dd395\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` ADD CONSTRAINT \`FK_a269de861bf7306e4498be856fa\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` ADD CONSTRAINT \`FK_a720e260138b64fcff2fca19b2d\` FOREIGN KEY (\`quiz_id\`) REFERENCES \`quizzes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_progress\` ADD CONSTRAINT \`FK_85392161b4c16580b3a7d937d94\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_progress\` ADD CONSTRAINT \`FK_ac88a92b1394862345e10cf3634\` FOREIGN KEY (\`center_id\`) REFERENCES \`centers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`course_progress\` ADD CONSTRAINT \`FK_468b14b39d8428b77d8630bd5cc\` FOREIGN KEY (\`course_id\`) REFERENCES \`courses\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`course_progress\` DROP FOREIGN KEY \`FK_468b14b39d8428b77d8630bd5cc\``);
        await queryRunner.query(`ALTER TABLE \`course_progress\` DROP FOREIGN KEY \`FK_ac88a92b1394862345e10cf3634\``);
        await queryRunner.query(`ALTER TABLE \`course_progress\` DROP FOREIGN KEY \`FK_85392161b4c16580b3a7d937d94\``);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` DROP FOREIGN KEY \`FK_a720e260138b64fcff2fca19b2d\``);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` DROP FOREIGN KEY \`FK_a269de861bf7306e4498be856fa\``);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` DROP FOREIGN KEY \`FK_1701aaf48f6a78e96bfe08dd395\``);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` DROP FOREIGN KEY \`FK_980e74721039ebe210fee2eeca2\``);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` DROP FOREIGN KEY \`FK_61ac71f4a08a0fe73f34904c803\``);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` DROP FOREIGN KEY \`FK_0d9292b3eb40707950eeeba9617\``);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` DROP FOREIGN KEY \`FK_cafc5c15d34d65b3a4d48e15c24\``);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` DROP FOREIGN KEY \`FK_927744c908bcf4f5a4499146422\``);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` DROP FOREIGN KEY \`FK_14c6d2b8f5be0bdb406a3895bb4\``);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` DROP FOREIGN KEY \`FK_f830d3e1eb46d2ff0b1fd7eb5c2\``);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` DROP FOREIGN KEY \`FK_a6f98c2786d5147c99b16e4300f\``);
        await queryRunner.query(`ALTER TABLE \`quizzes\` DROP FOREIGN KEY \`FK_a160ef69397dd47b2f2ab5b7057\``);
        await queryRunner.query(`ALTER TABLE \`quizzes\` DROP FOREIGN KEY \`FK_2cf4e4b5b533af8dc6b38d4fa9b\``);
        await queryRunner.query(`ALTER TABLE \`lessons\` DROP FOREIGN KEY \`FK_f7beb671190b161ed4cb7c961a2\``);
        await queryRunner.query(`ALTER TABLE \`lessons\` DROP FOREIGN KEY \`FK_35fb2307535d90a6ed290af1f4a\``);
        await queryRunner.query(`ALTER TABLE \`course_modules\` DROP FOREIGN KEY \`FK_a4c02d14fae0d7ffd113f3c4965\``);
        await queryRunner.query(`ALTER TABLE \`course_modules\` DROP FOREIGN KEY \`FK_81644557c2401f37fe9e884e884\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_adb80a549fe987e3d7fe070aade\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP FOREIGN KEY \`FK_16fcd8ab8bc042688984d5b3934\``);
        await queryRunner.query(`ALTER TABLE \`media\` DROP FOREIGN KEY \`FK_8468de6d91985f53a1a3324741c\``);
        await queryRunner.query(`ALTER TABLE \`centers\` DROP FOREIGN KEY \`FK_df866b8cb111bce1d7a663df6aa\``);
        await queryRunner.query(`ALTER TABLE \`media\` CHANGE \`uploaded_by\` \`uploaded_by\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`course_progress\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`quiz_attempts\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`lesson_progress\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`quiz_questions\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`vocabulary\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`quizzes\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`lessons\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`course_modules\` DROP COLUMN \`center_id\``);
        await queryRunner.query(`ALTER TABLE \`courses\` DROP COLUMN \`center_id\``);
    }

}
