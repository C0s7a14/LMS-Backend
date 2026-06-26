import { pool } from "../database/connection.js"; 

// 1. CREATE (POST)
export async function createCertificateService(data: any) {
    const { usuario_id, curso_id, validationCode } = data;

    if (!usuario_id || !curso_id || !validationCode) {
        throw new Error("Usuário, Curso e Código de Validação são obrigatórios.");
    }

    const query = `
        INSERT INTO certificados (usuario_id, curso_id, validation_code) 
        VALUES (?, ?, ?)
    `;
    
    // The pool.query returns an array where the first item is the result object
    const [result]: any = await pool.query(query, [usuario_id, curso_id, validationCode]);

    return { 
        message: "Certificado gerado com sucesso!", 
        certificateId: result.insertId,
        validationCode 
    };
}

// 2. READ ALL (GET)
export async function getAllCertificatesService() {
    const query = 'SELECT * FROM certificados';
    const [rows] = await pool.query(query);
    
    return rows;
}

// 3. READ ONE (GET by ID)
export async function getCertificateByIdService(id: number) {
    const query = 'SELECT * FROM certificados WHERE id = ?';
    const [rows]: any = await pool.query(query, [id]);

    if (rows.length === 0) {
        throw new Error("Certificado não encontrado.");
    }

    return rows[0];
}

// 4. UPDATE (PUT)
export async function updateCertificateService(id: number, updateData: any) {
    const { validationCode } = updateData;

    if (!validationCode) {
        throw new Error("Nenhum dado válido fornecido para atualização.");
    }

    const query = 'UPDATE certificados SET validation_code = ? WHERE id = ?';
    const [result]: any = await pool.query(query, [validationCode, id]);

    if (result.affectedRows === 0) {
        throw new Error("Certificado não encontrado ou nenhuma mudança realizada.");
    }

    return { message: `Certificado ${id} atualizado com sucesso.` };
}

// 5. DELETE (DELETE)
export async function deleteCertificateService(id: number) {
    const query = 'DELETE FROM certificados WHERE id = ?';
    const [result]: any = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
        throw new Error("Certificado não encontrado.");
    }

    return { message: `Certificado ${id} deletado com sucesso.` };
}