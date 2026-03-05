-- CreateTable
CREATE TABLE "personal_militar" (
    "id_personal_militar" SERIAL NOT NULL,
    "matricula" TEXT NOT NULL,
    "curp" TEXT,
    "rfc" TEXT,
    "nombre" TEXT NOT NULL,
    "apellido_paterno" TEXT NOT NULL,
    "apellido_materno" TEXT,
    "fecha_nacimiento" TIMESTAMP(3),
    "sexo" TEXT,
    "estado_civil" TEXT,
    "foto_url" TEXT,
    "id_grado" INTEGER,
    "id_arma_servicio" INTEGER,
    "id_organismo" INTEGER,
    "id_zona_militar" INTEGER,
    "id_region_militar" INTEGER,
    "fecha_ingreso" TIMESTAMP(3),
    "fecha_empleo" TIMESTAMP(3),
    "fecha_grado" TIMESTAMP(3),
    "situacion" TEXT,
    "lugar_nacimiento" TEXT,
    "estado_nacimiento" TEXT,
    "domicilio" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "especialidad" TEXT,
    "profesion" TEXT,

    CONSTRAINT "personal_militar_pkey" PRIMARY KEY ("id_personal_militar")
);

-- CreateTable
CREATE TABLE "cat_grado" (
    "id_grado" SERIAL NOT NULL,
    "nombre_grado" TEXT NOT NULL,
    "abreviatura" TEXT,

    CONSTRAINT "cat_grado_pkey" PRIMARY KEY ("id_grado")
);

-- CreateTable
CREATE TABLE "cat_arma_servicio" (
    "id_arma_servicio" SERIAL NOT NULL,
    "nombre_servicio" TEXT NOT NULL,

    CONSTRAINT "cat_arma_servicio_pkey" PRIMARY KEY ("id_arma_servicio")
);

-- CreateTable
CREATE TABLE "cat_region_militar" (
    "id_region_militar" SERIAL NOT NULL,
    "nombre_region_militar" TEXT NOT NULL,
    "numero_region_militar" TEXT,

    CONSTRAINT "cat_region_militar_pkey" PRIMARY KEY ("id_region_militar")
);

-- CreateTable
CREATE TABLE "cat_zona_militar" (
    "id_zona_militar" SERIAL NOT NULL,
    "nombre_zona_militar" TEXT NOT NULL,
    "numero_zona_militar" TEXT,

    CONSTRAINT "cat_zona_militar_pkey" PRIMARY KEY ("id_zona_militar")
);

-- CreateTable
CREATE TABLE "cat_organismo" (
    "id_organismo" SERIAL NOT NULL,
    "nombre_organismo" TEXT NOT NULL,
    "tipo_organismo" TEXT,
    "campo_militar" TEXT,
    "id_region_militar" INTEGER,

    CONSTRAINT "cat_organismo_pkey" PRIMARY KEY ("id_organismo")
);

-- CreateTable
CREATE TABLE "historial_ascensos" (
    "id_historial_ascenso" SERIAL NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "id_grado" INTEGER NOT NULL,
    "fecha_ascenso" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "historial_ascensos_pkey" PRIMARY KEY ("id_historial_ascenso")
);

-- CreateTable
CREATE TABLE "historial_adscripcion" (
    "id_adscripcion" SERIAL NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "id_organismo" INTEGER NOT NULL,
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),

    CONSTRAINT "historial_adscripcion_pkey" PRIMARY KEY ("id_adscripcion")
);

-- CreateTable
CREATE TABLE "cargo" (
    "id_cargo" SERIAL NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "grado" TEXT NOT NULL,
    "fecha_cargo" TIMESTAMP(3) NOT NULL,
    "cargo" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "ubicacion" TEXT,

    CONSTRAINT "cargo_pkey" PRIMARY KEY ("id_cargo")
);

-- CreateTable
CREATE TABLE "movimiento" (
    "id_movimiento" SERIAL NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "fecha_mov" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "grado" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "situacion" TEXT,
    "motivo_movimiento" TEXT,
    "cargo" TEXT,
    "zm" TEXT,
    "rm" TEXT,
    "no_documento" TEXT,
    "fecha_documento" TIMESTAMP(3),
    "no_acuerdo" TEXT,
    "motivo_detallado" TEXT,

    CONSTRAINT "movimiento_pkey" PRIMARY KEY ("id_movimiento")
);

-- CreateTable
CREATE TABLE "familiar" (
    "id_familiar" SERIAL NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3),
    "edad" INTEGER,
    "militar" BOOLEAN NOT NULL DEFAULT false,
    "grado" TEXT,
    "curp" TEXT,
    "matricula" TEXT,

    CONSTRAINT "familiar_pkey" PRIMARY KEY ("id_familiar")
);

-- CreateTable
CREATE TABLE "familiar_militar" (
    "id_familiar_militar" SERIAL NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "id_familiar" INTEGER NOT NULL,
    "parentesco" TEXT NOT NULL,
    "id_usuario" INTEGER,

    CONSTRAINT "familiar_militar_pkey" PRIMARY KEY ("id_familiar_militar")
);

-- CreateTable
CREATE TABLE "listado" (
    "id_listado" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listado_pkey" PRIMARY KEY ("id_listado")
);

-- CreateTable
CREATE TABLE "listado_personal" (
    "id" SERIAL NOT NULL,
    "id_listado" INTEGER NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "listado_personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conducta" (
    "id_conducta" SERIAL NOT NULL,
    "id_personal_militar" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conducta_pkey" PRIMARY KEY ("id_conducta")
);

-- CreateTable
CREATE TABLE "subsecciones" (
    "id_subseccion" SERIAL NOT NULL,
    "nombresubsec" TEXT NOT NULL,

    CONSTRAINT "subsecciones_pkey" PRIMARY KEY ("id_subseccion")
);

-- CreateTable
CREATE TABLE "grupos" (
    "grupo_id" SERIAL NOT NULL,
    "nombregrupo" TEXT NOT NULL,
    "subsecc" INTEGER NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("grupo_id")
);

-- CreateTable
CREATE TABLE "mesas" (
    "mesa_id" SERIAL NOT NULL,
    "nombremesa" TEXT NOT NULL,
    "abreviado" TEXT,
    "grupopert" INTEGER NOT NULL,
    "subsecpert" INTEGER NOT NULL,
    "clase" TEXT,

    CONSTRAINT "mesas_pkey" PRIMARY KEY ("mesa_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id_role" SERIAL NOT NULL,
    "nombre_role" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_role")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT,
    "id_role" INTEGER NOT NULL,
    "id_mesa" INTEGER,
    "id_grupo" INTEGER,
    "id_subsec" INTEGER,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateIndex
CREATE UNIQUE INDEX "personal_militar_matricula_key" ON "personal_militar"("matricula");

-- CreateIndex
CREATE UNIQUE INDEX "personal_militar_curp_key" ON "personal_militar"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "personal_militar_rfc_key" ON "personal_militar"("rfc");

-- CreateIndex
CREATE UNIQUE INDEX "familiar_militar_id_personal_militar_id_familiar_key" ON "familiar_militar"("id_personal_militar", "id_familiar");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_role_key" ON "roles"("nombre_role");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- AddForeignKey
ALTER TABLE "personal_militar" ADD CONSTRAINT "personal_militar_id_grado_fkey" FOREIGN KEY ("id_grado") REFERENCES "cat_grado"("id_grado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_militar" ADD CONSTRAINT "personal_militar_id_arma_servicio_fkey" FOREIGN KEY ("id_arma_servicio") REFERENCES "cat_arma_servicio"("id_arma_servicio") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_militar" ADD CONSTRAINT "personal_militar_id_organismo_fkey" FOREIGN KEY ("id_organismo") REFERENCES "cat_organismo"("id_organismo") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_militar" ADD CONSTRAINT "personal_militar_id_zona_militar_fkey" FOREIGN KEY ("id_zona_militar") REFERENCES "cat_zona_militar"("id_zona_militar") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personal_militar" ADD CONSTRAINT "personal_militar_id_region_militar_fkey" FOREIGN KEY ("id_region_militar") REFERENCES "cat_region_militar"("id_region_militar") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cat_organismo" ADD CONSTRAINT "cat_organismo_id_region_militar_fkey" FOREIGN KEY ("id_region_militar") REFERENCES "cat_region_militar"("id_region_militar") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ascensos" ADD CONSTRAINT "historial_ascensos_id_personal_militar_fkey" FOREIGN KEY ("id_personal_militar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_ascensos" ADD CONSTRAINT "historial_ascensos_id_grado_fkey" FOREIGN KEY ("id_grado") REFERENCES "cat_grado"("id_grado") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_adscripcion" ADD CONSTRAINT "historial_adscripcion_id_personal_militar_fkey" FOREIGN KEY ("id_personal_militar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_adscripcion" ADD CONSTRAINT "historial_adscripcion_id_organismo_fkey" FOREIGN KEY ("id_organismo") REFERENCES "cat_organismo"("id_organismo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo" ADD CONSTRAINT "cargo_id_personal_militar_fkey" FOREIGN KEY ("id_personal_militar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimiento" ADD CONSTRAINT "movimiento_id_personal_militar_fkey" FOREIGN KEY ("id_personal_militar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiar" ADD CONSTRAINT "familiar_id_personal_militar_fkey" FOREIGN KEY ("id_personal_militar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiar_militar" ADD CONSTRAINT "familiar_militar_id_personal_militar_fkey" FOREIGN KEY ("id_personal_militar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiar_militar" ADD CONSTRAINT "familiar_militar_id_familiar_fkey" FOREIGN KEY ("id_familiar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "familiar_militar" ADD CONSTRAINT "familiar_militar_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listado_personal" ADD CONSTRAINT "listado_personal_id_listado_fkey" FOREIGN KEY ("id_listado") REFERENCES "listado"("id_listado") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conducta" ADD CONSTRAINT "conducta_id_personal_militar_fkey" FOREIGN KEY ("id_personal_militar") REFERENCES "personal_militar"("id_personal_militar") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos" ADD CONSTRAINT "grupos_subsecc_fkey" FOREIGN KEY ("subsecc") REFERENCES "subsecciones"("id_subseccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_grupopert_fkey" FOREIGN KEY ("grupopert") REFERENCES "grupos"("grupo_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mesas" ADD CONSTRAINT "mesas_subsecpert_fkey" FOREIGN KEY ("subsecpert") REFERENCES "subsecciones"("id_subseccion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_role_fkey" FOREIGN KEY ("id_role") REFERENCES "roles"("id_role") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_mesa_fkey" FOREIGN KEY ("id_mesa") REFERENCES "mesas"("mesa_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "grupos"("grupo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_subsec_fkey" FOREIGN KEY ("id_subsec") REFERENCES "subsecciones"("id_subseccion") ON DELETE SET NULL ON UPDATE CASCADE;
