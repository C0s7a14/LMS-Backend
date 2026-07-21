import { pool } from "../database/connection.js";

interface CreateDeviceDTO {
  nome: string;
  modelo?: string;
  tipo?: string;
  descricao?: string;
  imagem_url?: string;
}

interface UpdateDeviceDTO {
  nome?: string;
  modelo?: string;
  tipo?: string;
  descricao?: string;
  imagem_url?: string;
}

/* CREATE */
export async function createDeviceRepository(data: CreateDeviceDTO) {
  const {
    nome,
    modelo,
    tipo,
    descricao,
    imagem_url
  } = data;

  const [result]: any = await pool.execute(
    `
    INSERT INTO dispositivos
    (nome, modelo, tipo, descricao, imagem_url)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      nome,
      modelo || null,
      tipo || null,
      descricao || null,
      imagem_url || null
    ]
  );

  return result;
}

/* GET ALL */
export async function getDevicesRepository() {
  const [rows]: any = await pool.execute(
    `
    SELECT
      d.id,
      d.nome,
      d.modelo,
      d.tipo,
      d.descricao,
      d.imagem_url,
      d.criado_em,

      (
        SELECT c.id
        FROM curso_dispositivos cd
        INNER JOIN cursos c
          ON c.id = cd.curso_id
        WHERE cd.dispositivo_id = d.id
          AND c.status = 'publicado'
        ORDER BY c.id DESC
        LIMIT 1
      ) AS course_id,

      (
        SELECT c.titulo
        FROM curso_dispositivos cd
        INNER JOIN cursos c
          ON c.id = cd.curso_id
        WHERE cd.dispositivo_id = d.id
          AND c.status = 'publicado'
        ORDER BY c.id DESC
        LIMIT 1
      ) AS course_title

    FROM dispositivos d
    ORDER BY d.id DESC
    `
  );

  return rows;
}

/* GET BY ID */
export async function getDeviceByIdRepository(id: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      id,
      nome,
      modelo,
      tipo,
      descricao,
      imagem_url,
      criado_em
    FROM dispositivos
    WHERE id = ?
    `,
    [id]
  );

  return rows[0];
}

/* UPDATE */
export async function updateDeviceRepository(
  id: number,
  data: UpdateDeviceDTO
) {
  const {
    nome,
    modelo,
    tipo,
    descricao,
    imagem_url
  } = data;

  await pool.execute(
    `
    UPDATE dispositivos
    SET
      nome = ?,
      modelo = ?,
      tipo = ?,
      descricao = ?,
      imagem_url = ?
    WHERE id = ?
    `,
    [
      nome,
      modelo || null,
      tipo || null,
      descricao || null,
      imagem_url || null,
      id
    ] as any[]
  );
}

/* DELETE */
export async function deleteDeviceRepository(id: number) {
  await pool.execute(
    `
    DELETE FROM dispositivos
    WHERE id = ?
    `,
    [id]
  );
}

/* ASSOCIATE DEVICE WITH COURSE */
export async function attachDeviceToCourseRepository(
  curso_id: number,
  dispositivo_id: number
) {
  const [result]: any = await pool.execute(
    `
    INSERT INTO curso_dispositivos
    (curso_id, dispositivo_id)
    VALUES (?, ?)
    `,
    [
      curso_id,
      dispositivo_id
    ]
  );

  return result;
}

/* VERIFY ASSOCIATION */
export async function findCourseDeviceRelationRepository(
  curso_id: number,
  dispositivo_id: number
) {
  const [rows]: any = await pool.execute(
    `
    SELECT *
    FROM curso_dispositivos
    WHERE curso_id = ?
    AND dispositivo_id = ?
    `,
    [
      curso_id,
      dispositivo_id
    ]
  );

  return rows[0];
}

/* GET DEVICES BY COURSE */
export async function getDevicesByCourseRepository(
  curso_id: number
) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      cursos.id AS curso_id,
      cursos.titulo AS curso_titulo,

      dispositivos.id AS dispositivo_id,
      dispositivos.nome AS dispositivo_nome,
      dispositivos.modelo,
      dispositivos.tipo,
      dispositivos.descricao,
      dispositivos.imagem_url,
      dispositivos.criado_em

    FROM curso_dispositivos

    JOIN cursos
    ON cursos.id = curso_dispositivos.curso_id

    JOIN dispositivos
    ON dispositivos.id = curso_dispositivos.dispositivo_id

    WHERE curso_dispositivos.curso_id = ?

    ORDER BY dispositivos.nome ASC
    `,
    [curso_id]
  );

  return rows;
}

/* REMOVE DEVICE FROM COURSE */
export async function detachDeviceFromCourseRepository(
  curso_id: number,
  dispositivo_id: number
) {
  await pool.execute(
    `
    DELETE FROM curso_dispositivos
    WHERE curso_id = ?
    AND dispositivo_id = ?
    `,
    [
      curso_id,
      dispositivo_id
    ]
  );
}