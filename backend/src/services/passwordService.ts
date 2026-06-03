import bcrypt from "bcrypt";

import { Resend } from "resend";

import { pool } from "../database/connection.js";

import { findUserByEmail } from "../repositories/userRepository.js";

const resend = new Resend(
process.env.RESEND_API_KEY
);

export async function forgotPasswordService(
email: string
) {

const user = await findUserByEmail(
email
);

if (!user) {
throw new Error(
"Usuário não encontrado"
);
}

const code = Math.floor(
100000 + Math.random() * 900000
).toString();

const expiresAt = new Date();

expiresAt.setMinutes(
expiresAt.getMinutes() + 15
);

await pool.execute(
`     INSERT INTO password_reset_codes
    (user_id, code, expires_at)
    VALUES (?, ?, ?)
    `,
[
user.id,
code,
expiresAt
]
);

await resend.emails.send({
  from: "onboarding@resend.dev",

  to: email,

  subject: "Recuperação de senha",

  html: `
    <h1>Recuperação de senha</h1>

    <p>Seu código:</p>

    <h2>${code}</h2>

    <p>
      Código válido por 15 minutos.
    </p>
  `,
});

return {
message:
"Código enviado para o email",
};
}

export async function resetPasswordService(
code: string,
senha: string
) {

const [rows]: any =
await pool.execute(
`       SELECT * FROM password_reset_codes
      WHERE code = ?
      `,
[code]
);

const resetCode = rows[0];

if (!resetCode) {
throw new Error(
"Código inválido"
);
}

const hashedPassword =
await bcrypt.hash(
senha,
10
);

await pool.execute(
`     UPDATE users
    SET senha = ?
    WHERE id = ?
    `,
[
hashedPassword,
resetCode.user_id
]
);

await pool.execute(
`     DELETE FROM password_reset_codes
    WHERE id = ?
    `,
[resetCode.id]
);

return {
message:
"Senha redefinida com sucesso",
};
}
