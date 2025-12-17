import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class InitialSchema1734468000000 implements MigrationInterface {
  name = 'InitialSchema1734468000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==================== TABLA: users ====================
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "first_name" character varying(100) NOT NULL,
        "last_name" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "role" character varying NOT NULL DEFAULT 'ASISTENTE_VENTANILLA',
        "is_active" boolean NOT NULL DEFAULT true,
        "last_login" TIMESTAMP,
        "refresh_token" text,
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")
    `);

    // ==================== TABLA: trabajadores ====================
    await queryRunner.query(`
      CREATE TYPE "public"."trabajadores_estado_canasta_enum" AS ENUM(
        'PENDIENTE',
        'VENTANILLA_ESCANEADO',
        'AUDITORIO_INGRESADO',
        'CANASTA_ENTREGADA'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."trabajadores_estado_regalos_enum" AS ENUM(
        'PENDIENTE',
        'VENTANILLA_ESCANEADO',
        'AUDITORIO_INGRESADO',
        'JUGUETES_ENTREGADOS'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."trabajadores_auditorio_canasta_enum" AS ENUM(
        'AUDITORIO_2',
        'AUDITORIO_3'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."trabajadores_auditorio_juguetes_enum" AS ENUM(
        'AUDITORIO_1'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "trabajadores" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "dni" character varying(20) NOT NULL,
        "nombres_completos" character varying(255) NOT NULL,
        "fecha_ingreso" date NOT NULL,
        "funcion" character varying(100) NOT NULL,
        "tipo_canasta" character varying(50) NOT NULL,
        "estado_canasta" "public"."trabajadores_estado_canasta_enum" NOT NULL DEFAULT 'PENDIENTE',
        "estado_regalos" "public"."trabajadores_estado_regalos_enum" NOT NULL DEFAULT 'PENDIENTE',
        "auditorio_canasta" "public"."trabajadores_auditorio_canasta_enum" NOT NULL,
        "auditorio_juguetes" "public"."trabajadores_auditorio_juguetes_enum",
        "id_canasta" uuid,
        "fecha_hora_entrega_canasta" TIMESTAMP,
        "fecha_hora_entrega_juguetes" TIMESTAMP,
        CONSTRAINT "UQ_trabajadores_dni" UNIQUE ("dni"),
        CONSTRAINT "PK_trabajadores_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_trabajadores_dni" ON "trabajadores" ("dni")
    `);

    // ==================== TABLA: canastas ====================
    await queryRunner.query(`
      CREATE TABLE "canastas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "codigo_qr" character varying(255) NOT NULL,
        CONSTRAINT "UQ_canastas_codigo_qr" UNIQUE ("codigo_qr"),
        CONSTRAINT "PK_canastas_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_canastas_codigo_qr" ON "canastas" ("codigo_qr")
    `);

    // ==================== TABLA: regalos ====================
    await queryRunner.query(`
      CREATE TABLE "regalos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "codigo_qr" character varying(255) NOT NULL,
        CONSTRAINT "UQ_regalos_codigo_qr" UNIQUE ("codigo_qr"),
        CONSTRAINT "PK_regalos_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_regalos_codigo_qr" ON "regalos" ("codigo_qr")
    `);

    // ==================== TABLA: trabajador_regalos ====================
    await queryRunner.query(`
      CREATE TABLE "trabajador_regalos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "id_trabajador" uuid NOT NULL,
        "id_regalo" uuid NOT NULL,
        CONSTRAINT "PK_trabajador_regalos_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_trabajador_regalos_trabajador" 
          FOREIGN KEY ("id_trabajador") 
          REFERENCES "trabajadores"("id") 
          ON DELETE CASCADE,
        CONSTRAINT "FK_trabajador_regalos_regalo" 
          FOREIGN KEY ("id_regalo") 
          REFERENCES "regalos"("id") 
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_trabajador_regalos_trabajador_regalo" 
      ON "trabajador_regalos" ("id_trabajador", "id_regalo")
    `);

    // ==================== TABLA: logs ====================
    await queryRunner.query(`
      CREATE TABLE "logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "id_trabajador" uuid NOT NULL,
        "id_usuario" uuid NOT NULL,
        "peticion_hecha" character varying(500) NOT NULL,
        "fecha_hora" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_logs_trabajador" 
          FOREIGN KEY ("id_trabajador") 
          REFERENCES "trabajadores"("id") 
          ON DELETE CASCADE,
        CONSTRAINT "FK_logs_usuario" 
          FOREIGN KEY ("id_usuario") 
          REFERENCES "users"("id") 
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_logs_trabajador" ON "logs" ("id_trabajador")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_logs_usuario" ON "logs" ("id_usuario")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_logs_fecha_hora" ON "logs" ("fecha_hora")
    `);

    // ==================== CREAR USUARIO ADMIN ====================
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@elpedregal.com';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await queryRunner.query(`
      INSERT INTO "users" 
        ("first_name", "last_name", "email", "password", "role", "is_active")
      VALUES 
        ('Admin', 'El Pedregal', $1, $2, 'ADMIN', true)
    `, [adminEmail, hashedPassword]);

    console.log('✅ Database schema created successfully');
    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log('⚠️  IMPORTANT: Change the default password after first login');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Eliminar tablas en orden inverso (respetando foreign keys)
    await queryRunner.query(`DROP INDEX "IDX_logs_fecha_hora"`);
    await queryRunner.query(`DROP INDEX "IDX_logs_usuario"`);
    await queryRunner.query(`DROP INDEX "IDX_logs_trabajador"`);
    await queryRunner.query(`DROP TABLE "logs"`);

    await queryRunner.query(`DROP INDEX "IDX_trabajador_regalos_trabajador_regalo"`);
    await queryRunner.query(`DROP TABLE "trabajador_regalos"`);

    await queryRunner.query(`DROP INDEX "IDX_regalos_codigo_qr"`);
    await queryRunner.query(`DROP TABLE "regalos"`);

    await queryRunner.query(`DROP INDEX "IDX_canastas_codigo_qr"`);
    await queryRunner.query(`DROP TABLE "canastas"`);

    await queryRunner.query(`DROP INDEX "IDX_trabajadores_dni"`);
    await queryRunner.query(`DROP TABLE "trabajadores"`);
    await queryRunner.query(`DROP TYPE "public"."trabajadores_auditorio_juguetes_enum"`);
    await queryRunner.query(`DROP TYPE "public"."trabajadores_auditorio_canasta_enum"`);
    await queryRunner.query(`DROP TYPE "public"."trabajadores_estado_regalos_enum"`);
    await queryRunner.query(`DROP TYPE "public"."trabajadores_estado_canasta_enum"`);

    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}