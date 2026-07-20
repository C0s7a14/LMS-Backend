import { pool } from "../database/connection.js";

export async function getClientDevicesRepository(clientId: number) {
  const [rows]: any = await pool.execute(
    `
    SELECT
      d.id,
      d.nome,
      d.modelo,
      d.tipo,
      d.descricao,
      d.imagem_url,
      d.criado_em
    FROM cliente_dispositivos cd
    INNER JOIN dispositivos d
      ON d.id = cd.dispositivo_id
    WHERE cd.cliente_id = ?
    ORDER BY d.nome ASC
    `,
    [clientId]
  );

  return rows;
}

export async function linkDeviceToClientRepository(
  clientId: number,
  deviceId: number
) {
  const [result]: any = await pool.execute(
    `
    INSERT IGNORE INTO cliente_dispositivos (
      cliente_id,
      dispositivo_id
    ) VALUES (?, ?)
    `,
    [clientId, deviceId]
  );

  return result;
}

export async function unlinkDeviceFromClientRepository(
  clientId: number,
  deviceId: number
) {
  const [result]: any = await pool.execute(
    `
    DELETE FROM cliente_dispositivos
    WHERE cliente_id = ?
    AND dispositivo_id = ?
    `,
    [clientId, deviceId]
  );

  return result;
}