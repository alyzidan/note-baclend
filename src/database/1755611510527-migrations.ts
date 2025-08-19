import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1755611510527 implements MigrationInterface {
  name = 'Migrations1755611510527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "age" integer NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "age"`);
  }
}
