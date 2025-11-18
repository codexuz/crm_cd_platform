import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1763455811389 implements MigrationInterface {
  name = 'Migration1763455811389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add temporary column with new enum values
    await queryRunner.query(
      `ALTER TABLE \`ielts_tests\` ADD \`test_type_new\` enum ('ielts_practice', 'ielts_mock', 'cefr_practice', 'cefr_mock') NOT NULL DEFAULT 'ielts_practice'`,
    );

    // Step 2: Copy data from old column to new column with value mapping
    await queryRunner.query(
      `UPDATE \`ielts_tests\` SET \`test_type_new\` = CASE 
        WHEN \`test_type\` = 'practice' THEN 'ielts_practice'
        WHEN \`test_type\` = 'mock' THEN 'ielts_mock'
        ELSE 'ielts_practice'
      END`,
    );

    // Step 3: Drop old column
    await queryRunner.query(
      `ALTER TABLE \`ielts_tests\` DROP COLUMN \`test_type\``,
    );

    // Step 4: Rename new column to original name
    await queryRunner.query(
      `ALTER TABLE \`ielts_tests\` CHANGE \`test_type_new\` \`test_type\` enum ('ielts_practice', 'ielts_mock', 'cefr_practice', 'cefr_mock') NOT NULL DEFAULT 'ielts_practice'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add temporary column with old enum values
    await queryRunner.query(
      `ALTER TABLE \`ielts_tests\` ADD \`test_type_old\` enum ('practice', 'mock') NOT NULL DEFAULT 'practice'`,
    );

    // Step 2: Copy data from new column to old column with value mapping
    await queryRunner.query(
      `UPDATE \`ielts_tests\` SET \`test_type_old\` = CASE 
        WHEN \`test_type\` = 'ielts_practice' THEN 'practice'
        WHEN \`test_type\` = 'ielts_mock' THEN 'mock'
        WHEN \`test_type\` = 'cefr_practice' THEN 'practice'
        WHEN \`test_type\` = 'cefr_mock' THEN 'mock'
        ELSE 'practice'
      END`,
    );

    // Step 3: Drop new column
    await queryRunner.query(
      `ALTER TABLE \`ielts_tests\` DROP COLUMN \`test_type\``,
    );

    // Step 4: Rename old column to original name
    await queryRunner.query(
      `ALTER TABLE \`ielts_tests\` CHANGE \`test_type_old\` \`test_type\` enum ('practice', 'mock') NOT NULL DEFAULT 'practice'`,
    );
  }
}
