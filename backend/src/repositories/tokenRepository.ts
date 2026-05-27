import {pool} from "../database/connection.js";




export async function saveRefreshToken(
    userId: number,
    token: string,
    expiresAt: Date
){
    await pool.execute(
        `
        INSERT INTO refresh_tokens
        (user_id, token, expires_at)
        VALUES (?, ?, ?)
        `,
        [userId, token, expiresAt]
    );
}


export async function findRefreshToken(
    token: string
){
    const [rows]: any = await pool.execute(
        `
        SELECT * FROM refresh_tokens
        WHERE token = ?
        
        `,
        [token]
    );

    return rows[0];
}


export async function deleteRefreshToken(
    token: string
){

    console.log("DELETE TOKEN:");
    console.log(token);

    if (!token) {
        throw new Error("TOKEN UNDEFINED");
    }

    await pool.execute(
        `
        DELETE FROM refresh_tokens
        WHERE token = ?
        `,
        [token]
    );
}