import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import type { ResultSetHeader } from "mysql2";

type QuizType = "aula" | "modulo" | "prova_final";
type QuizStatus = "rascunho" | "publicado";

interface QuizOptionDTO {
  texto_opcao: string;
  correta: boolean;
}

interface QuizQuestionDTO {
  pergunta: string;
  explicacao?: string | null;
  ordem?: number;
  opcoes: QuizOptionDTO[];
}

interface CreateQuizDTO {
  curso_id: number;
  modulo_id?: number | null;
  aula_id?: number | null;
  titulo: string;
  tipo: QuizType;
  nota_minima?: number;
  max_tentativas?: number;
  status?: QuizStatus;
  questoes: QuizQuestionDTO[];
}

interface SubmitAnswerDTO {
  questao_id: number;
  opcao_id: number;
}

interface QuizWithQuestions {
  id: number;
  curso_id: number;
  modulo_id: number | null;
  aula_id: number | null;
  titulo: string;
  tipo: QuizType;
  nota_minima: number;
  max_tentativas: number;
  questoes_por_tentativa?: number;
  sorteio_ativo?: boolean | number;
  status: QuizStatus;
  criado_em?: string;
  atualizado_em?: string;
  questoes: any[];
}


interface StartQuizAttemptResult {
  tentativa_id: number;
  quiz: QuizWithQuestions;
}

function validateQuizType(tipo: string): tipo is QuizType {
  return (
    tipo === "aula" ||
    tipo === "modulo" ||
    tipo === "prova_final"
  );
}

function generateValidationCode() {
  return `SIRROS-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase()}`;
}

export async function createQuizService(data: CreateQuizDTO) {
  if (!data.curso_id || Number.isNaN(Number(data.curso_id))) {
    throw new AppError("Curso inválido", 400);
  }

  if (!data.titulo?.trim()) {
    throw new AppError("O título do quiz é obrigatório", 400);
  }

  if (!validateQuizType(data.tipo)) {
    throw new AppError("Tipo de quiz inválido", 400);
  }

  if (!Array.isArray(data.questoes) || data.questoes.length === 0) {
    throw new AppError("O quiz precisa ter pelo menos uma questão", 400);
  }

  if (data.tipo === "aula" && !data.aula_id) {
    throw new AppError("Quiz do tipo aula precisa de aula_id", 400);
  }

  if (data.tipo === "modulo" && !data.modulo_id) {
    throw new AppError("Quiz do tipo módulo precisa de modulo_id", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [courseRows]: any = await connection.query(
      "SELECT id FROM cursos WHERE id = ?",
      [data.curso_id]
    );

    if (courseRows.length === 0) {
      throw new AppError("Curso não encontrado", 404);
    }

    if (data.modulo_id) {
      const [moduleRows]: any = await connection.query(
        "SELECT id FROM modulos WHERE id = ? AND curso_id = ?",
        [data.modulo_id, data.curso_id]
      );

      if (moduleRows.length === 0) {
        throw new AppError("Módulo não pertence ao curso informado", 400);
      }
    }

    if (data.aula_id) {
      const [lessonRows]: any = await connection.query(
        `
          SELECT a.id
          FROM aulas a
          INNER JOIN modulos m ON m.id = a.modulo_id
          WHERE a.id = ? AND m.curso_id = ?
        `,
        [data.aula_id, data.curso_id]
      );

      if (lessonRows.length === 0) {
        throw new AppError("Aula não pertence ao curso informado", 400);
      }
    }

    const [quizResult]: any = await connection.query(
      `
        INSERT INTO quizzes (
          curso_id,
          modulo_id,
          aula_id,
          titulo,
          tipo,
          nota_minima,
          max_tentativas,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        data.curso_id,
        data.tipo === "prova_final" ? null : data.modulo_id || null,
        data.tipo === "prova_final" ? null : data.aula_id || null,
        data.titulo.trim(),
        data.tipo,
        data.nota_minima || 70,
        data.max_tentativas || 3,
        data.status || "rascunho",
      ]
    );

    const quizId = quizResult.insertId;

    for (const [questionIndex, questao] of data.questoes.entries()) {
      if (!questao.pergunta?.trim()) {
        throw new AppError("Todas as questões precisam ter pergunta", 400);
      }

      if (!Array.isArray(questao.opcoes) || questao.opcoes.length < 2) {
        throw new AppError(
          "Cada questão precisa ter pelo menos duas opções",
          400
        );
      }

      const correctOptions = questao.opcoes.filter(
        (opcao) => opcao.correta === true
      );

      if (correctOptions.length !== 1) {
        throw new AppError(
          "Cada questão precisa ter exatamente uma alternativa correta",
          400
        );
      }

      const [questionResult]: any = await connection.query(
        `
          INSERT INTO quiz_questoes (
            quiz_id,
            pergunta,
            explicacao,
            ordem
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          quizId,
          questao.pergunta.trim(),
          questao.explicacao || null,
          questao.ordem || questionIndex + 1,
        ]
      );

      const questaoId = questionResult.insertId;

      for (const opcao of questao.opcoes) {
        if (!opcao.texto_opcao?.trim()) {
          throw new AppError("Todas as opções precisam ter texto", 400);
        }

        await connection.query(
          `
            INSERT INTO quiz_opcoes (
              questao_id,
              texto_opcao,
              correta
            )
            VALUES (?, ?, ?)
          `,
          [
            questaoId,
            opcao.texto_opcao.trim(),
            opcao.correta ? 1 : 0,
          ]
        );
      }
    }

    await connection.commit();

    return {
      message: "Quiz criado com sucesso",
      quiz_id: quizId,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getOrCreateCursoTentativa(
  usuarioId: number,
  cursoId: number
): Promise<number | null> {
  const [existingRows] = await pool.query<any[]>(
    `
    SELECT id, status
    FROM curso_tentativas
    WHERE usuario_id = ?
      AND curso_id = ?
      AND status IN ('em_andamento', 'em_revisao')
    ORDER BY numero_tentativa DESC
    LIMIT 1
    `,
    [usuarioId, cursoId]
  );

  if (existingRows.length > 0) {
    return existingRows[0].id;
  }

  const [lastRows] = await pool.query<any[]>(
    `
    SELECT numero_tentativa
    FROM curso_tentativas
    WHERE usuario_id = ?
      AND curso_id = ?
    ORDER BY numero_tentativa DESC
    LIMIT 1
    `,
    [usuarioId, cursoId]
  );

  const nextAttemptNumber = lastRows.length
    ? Number(lastRows[0].numero_tentativa) + 1
    : 1;

  if (nextAttemptNumber > 3) {
    throw new AppError(
      "Limite de tentativas do curso atingido. Entre em contato com o administrador.",
      403
    );
  }

  const [result] = await pool.query<ResultSetHeader>(
    `
    INSERT INTO curso_tentativas (
      usuario_id,
      curso_id,
      numero_tentativa,
      status,
      max_tentativas
    )
    VALUES (?, ?, ?, 'em_andamento', 3)
    `,
    [usuarioId, cursoId, nextAttemptNumber]
  );

  return result.insertId;
}

export async function getQuizByIdService(
  quizId: number,
  showCorrectAnswers = false
) {
  const [quizRows]: any = await pool.query(
    "SELECT * FROM quizzes WHERE id = ?",
    [quizId]
  );

  if (quizRows.length === 0) {
    throw new AppError("Quiz não encontrado", 404);
  }

  const quiz = quizRows[0];

  const [questionRows]: any = await pool.query(
    `
      SELECT *
      FROM quiz_questoes
      WHERE quiz_id = ?
      ORDER BY ordem ASC, id ASC
    `,
    [quizId]
  );

  if (questionRows.length === 0) {
    return {
      ...quiz,
      questoes: [],
    };
  }

  const questionIds = questionRows.map((questao: any) => questao.id);

  const [optionRows]: any = await pool.query(
    `
      SELECT *
      FROM quiz_opcoes
      WHERE questao_id IN (?)
      ORDER BY id ASC
    `,
    [questionIds]
  );

  const questoes = questionRows.map((questao: any) => {
    const opcoes = optionRows
      .filter((opcao: any) => opcao.questao_id === questao.id)
      .map((opcao: any) => {
        if (showCorrectAnswers) {
          return opcao;
        }

        return {
          id: opcao.id,
          questao_id: opcao.questao_id,
          texto_opcao: opcao.texto_opcao,
        };
      });

    return {
      ...questao,
      opcoes,
    };
  });

  return {
    ...quiz,
    questoes,
  };
}


export async function listCourseQuizzesService(courseId: number) {
  const [courseRows]: any = await pool.query(
    "SELECT id FROM cursos WHERE id = ?",
    [courseId]
  );

  if (courseRows.length === 0) {
    throw new AppError("Curso não encontrado", 404);
  }

  const [quizRows]: any = await pool.query(
    `
      SELECT
        q.id,
        q.curso_id,
        q.modulo_id,
        q.aula_id,
        q.titulo,
        q.tipo,
        q.nota_minima,
        q.max_tentativas,
        q.status,
        q.criado_em,
        COUNT(qq.id) AS total_questoes
      FROM quizzes q
      LEFT JOIN quiz_questoes qq ON qq.quiz_id = q.id
      WHERE q.curso_id = ?
      GROUP BY q.id
      ORDER BY q.criado_em DESC
    `,
    [courseId]
  );

  return quizRows;
}

export async function submitQuizService(
  quizId: number,
  userId: number,
  tentativaId: number,
  respostas: SubmitAnswerDTO[]
) {
  if (!tentativaId || Number.isNaN(Number(tentativaId))) {
    throw new AppError("ID da tentativa é obrigatório", 400);
  }

  if (!Array.isArray(respostas) || respostas.length === 0) {
    throw new AppError("Envie as respostas do quiz", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [attemptRows]: any = await connection.query(
      `
        SELECT
          qt.id AS tentativa_id,
          qt.usuario_id,
          qt.quiz_id,
          qt.curso_tentativa_id,
          qt.finalizado_em,

          q.id,
          q.curso_id,
          q.titulo,
          q.tipo,
          q.nota_minima,
          q.max_tentativas,
          q.status
        FROM quiz_tentativas qt
        INNER JOIN quizzes q ON q.id = qt.quiz_id
        WHERE qt.id = ?
          AND qt.quiz_id = ?
          AND qt.usuario_id = ?
        LIMIT 1
      `,
      [tentativaId, quizId, userId]
    );

    if (attemptRows.length === 0) {
      throw new AppError("Tentativa não encontrada para este usuário", 404);
    }

    const attempt = attemptRows[0];

    if (attempt.status !== "publicado") {
      throw new AppError("Este quiz ainda não está publicado", 403);
    }

    if (attempt.finalizado_em) {
      throw new AppError("Esta tentativa já foi finalizada", 403);
    }

    const [finishedAttemptRows]: any = await connection.query(
      `
        SELECT COUNT(*) AS total
        FROM quiz_tentativas
        WHERE usuario_id = ?
          AND quiz_id = ?
          AND finalizado_em IS NOT NULL
      `,
      [userId, quizId]
    );

    const totalTentativasFinalizadas = Number(
      finishedAttemptRows[0].total || 0
    );

    if (totalTentativasFinalizadas >= Number(attempt.max_tentativas)) {
      throw new AppError(
        "Você atingiu o número máximo de tentativas",
        403
      );
    }

    const [questionRows]: any = await connection.query(
      `
        SELECT qq.id
        FROM quiz_tentativa_questoes qtq
        INNER JOIN quiz_questoes qq ON qq.id = qtq.questao_id
        WHERE qtq.tentativa_id = ?
          AND qq.quiz_id = ?
        ORDER BY qtq.ordem ASC
      `,
      [tentativaId, quizId]
    );

    if (questionRows.length === 0) {
      throw new AppError(
        "Esta tentativa não possui questões sorteadas",
        400
      );
    }

    const questionIds = questionRows.map((questao: any) =>
      Number(questao.id)
    );

    const respostasPorQuestao = new Map<number, number>();

    for (const resposta of respostas) {
      const questaoId = Number(resposta.questao_id);
      const opcaoId = Number(resposta.opcao_id);

      if (respostasPorQuestao.has(questaoId)) {
        throw new AppError(
          "Existe questão respondida mais de uma vez",
          400
        );
      }

      respostasPorQuestao.set(questaoId, opcaoId);
    }

    for (const questionId of questionIds) {
      if (!respostasPorQuestao.has(questionId)) {
        throw new AppError(
          "Todas as questões sorteadas precisam ser respondidas",
          400
        );
      }
    }

    const [optionRows]: any = await connection.query(
      `
        SELECT
          id,
          questao_id,
          correta
        FROM quiz_opcoes
        WHERE questao_id IN (?)
      `,
      [questionIds]
    );

    let totalAcertos = 0;

    const respostasCorrigidas = questionIds.map((questionId: number) => {
      const opcaoId = respostasPorQuestao.get(questionId);

      const option = optionRows.find(
        (opcao: any) =>
          Number(opcao.id) === Number(opcaoId) &&
          Number(opcao.questao_id) === Number(questionId)
      );

      if (!option) {
        throw new AppError(
          "Uma das opções enviadas não pertence à questão sorteada",
          400
        );
      }

      const correta = Boolean(option.correta);

      if (correta) {
        totalAcertos++;
      }

      return {
        questao_id: questionId,
        opcao_id: Number(opcaoId),
        correta,
      };
    });

    const totalQuestoes = questionIds.length;
    const nota = Number(((totalAcertos / totalQuestoes) * 100).toFixed(2));
    const aprovado = nota >= Number(attempt.nota_minima);

    await connection.query(
      `
        UPDATE quiz_tentativas
        SET
          nota = ?,
          total_questoes = ?,
          total_acertos = ?,
          aprovado = ?,
          finalizado_em = NOW()
        WHERE id = ?
      `,
      [
        nota,
        totalQuestoes,
        totalAcertos,
        aprovado ? 1 : 0,
        tentativaId,
      ]
    );

    for (const resposta of respostasCorrigidas) {
      await connection.query(
        `
          INSERT INTO respostas_quiz (
            tentativa_id,
            usuario_id,
            quiz_id,
            questao_id,
            opcao_id,
            correta
          )
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          tentativaId,
          userId,
          quizId,
          resposta.questao_id,
          resposta.opcao_id,
          resposta.correta ? 1 : 0,
        ]
      );
    }

    let certificadoEmitido = false;

    if (attempt.tipo === "prova_final") {
      if (attempt.curso_tentativa_id) {
        if (aprovado) {
          await connection.query(
            `
              UPDATE curso_tentativas
              SET
                status = 'aprovado',
                nota_final = ?,
                finalizado_em = NOW()
              WHERE id = ?
            `,
            [nota, attempt.curso_tentativa_id]
          );
        } else {
          await connection.query(
            `
              UPDATE curso_tentativas
              SET
                status = 'em_revisao',
                nota_final = ?
              WHERE id = ?
            `,
            [nota, attempt.curso_tentativa_id]
          );
        }
      }

      if (aprovado) {
        const [certificateRows]: any = await connection.query(
          `
            SELECT id
            FROM certificados
            WHERE usuario_id = ?
              AND curso_id = ?
            LIMIT 1
          `,
          [userId, attempt.curso_id]
        );

        if (certificateRows.length === 0) {
          await connection.query(
            `
              INSERT INTO certificados (
                usuario_id,
                curso_id,
                certificado_url,
                validation_code
              )
              VALUES (?, ?, ?, ?)
            `,
            [
              userId,
              attempt.curso_id,
              null,
              generateValidationCode(),
            ]
          );

          certificadoEmitido = true;
        }
      }
    }

    await connection.commit();

    return {
      message: aprovado
        ? "Quiz finalizado com aprovação"
        : "Quiz finalizado sem aprovação",
      tentativa: {
        id: tentativaId,
        quiz_id: quizId,
        usuario_id: userId,
        nota,
        nota_minima: Number(attempt.nota_minima),
        total_questoes: totalQuestoes,
        total_acertos: totalAcertos,
        aprovado,
        tentativas_usadas: totalTentativasFinalizadas + 1,
        max_tentativas: Number(attempt.max_tentativas),
        certificado_emitido: certificadoEmitido,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function startQuizAttemptService(
  quizId: number,
  userId: number
): Promise<StartQuizAttemptResult> {
  const [quizRows] = await pool.query<any[]>(
    `
    SELECT 
      id,
      curso_id,
      modulo_id,
      aula_id,
      titulo,
      tipo,
      nota_minima,
      max_tentativas,
      questoes_por_tentativa,
      sorteio_ativo,
      status
    FROM quizzes
    WHERE id = ?
    LIMIT 1
    `,
    [quizId]
  );

  if (quizRows.length === 0) {
    throw new AppError("Quiz não encontrado", 404);
  }

  const quiz = quizRows[0];

  if (quiz.status !== "publicado") {
    throw new AppError("Esta avaliação ainda não está publicada", 403);
  }

  if (quiz.tipo === "prova_final") {
    const [courseAttemptRows]: any = await pool.query(
      `
      SELECT 
        id,
        status,
        numero_tentativa,
        max_tentativas
      FROM curso_tentativas
      WHERE usuario_id = ?
        AND curso_id = ?
      ORDER BY numero_tentativa DESC
      LIMIT 1
      `,
      [userId, quiz.curso_id]
    );

    const latestCourseAttempt = courseAttemptRows[0];

    if (latestCourseAttempt?.status === "aprovado") {
      throw new AppError(
        "Este curso já foi aprovado. O certificado já está disponível.",
        409
      );
    }

    if (latestCourseAttempt?.status === "em_revisao") {
      throw new AppError(
        "Você precisa revisar o curso antes de fazer uma nova tentativa da prova final.",
        403
      );
    }

    if (
      latestCourseAttempt?.status === "bloqueado" ||
      latestCourseAttempt?.status === "reprovado"
    ) {
      throw new AppError(
        "Você atingiu o limite de tentativas da prova final.",
        403
      );
    }
  }

  const [attemptRows] = await pool.query<any[]>(
    `
    SELECT COUNT(*) AS total
    FROM quiz_tentativas
    WHERE usuario_id = ?
      AND quiz_id = ?
      AND finalizado_em IS NOT NULL
    `,
    [userId, quizId]
  );

  const totalTentativas = Number(attemptRows[0].total || 0);

  if (totalTentativas >= Number(quiz.max_tentativas)) {
    throw new AppError("Você atingiu o número máximo de tentativas", 403);
  }

  const [openAttemptRows] = await pool.query<any[]>(
    `
    SELECT id
    FROM quiz_tentativas
    WHERE usuario_id = ?
      AND quiz_id = ?
      AND finalizado_em IS NULL
    ORDER BY iniciado_em DESC
    LIMIT 1
    `,
    [userId, quizId]
  );

  if (openAttemptRows.length > 0) {
    const tentativaId = Number(openAttemptRows[0].id);

    const quizWithQuestions = await getQuizAttemptQuestions(
      quizId,
      tentativaId,
      false
    );

    return {
      tentativa_id: tentativaId,
      quiz: quizWithQuestions,
    };
  }

  const cursoTentativaId = await getOrCreateCursoTentativa(
    userId,
    Number(quiz.curso_id)
  );

  const [questionRows] = await pool.query<any[]>(
    `
    SELECT id
    FROM quiz_questoes
    WHERE quiz_id = ?
    ORDER BY 
      CASE WHEN ? = TRUE THEN RAND() ELSE ordem END
    LIMIT ?
    `,
    [
      quizId,
      Boolean(quiz.sorteio_ativo),
      Number(quiz.questoes_por_tentativa || 5),
    ]
  );

  if (questionRows.length === 0) {
    throw new AppError("Este quiz não possui questões cadastradas", 400);
  }

  const [attemptResult] = await pool.query<ResultSetHeader>(
    `
    INSERT INTO quiz_tentativas (
      usuario_id,
      quiz_id,
      curso_tentativa_id,
      nota,
      total_questoes,
      total_acertos,
      aprovado
    )
    VALUES (?, ?, ?, 0, ?, 0, FALSE)
    `,
    [userId, quizId, cursoTentativaId, questionRows.length]
  );

  const tentativaId = attemptResult.insertId;

  for (let index = 0; index < questionRows.length; index++) {
    await pool.query(
      `
      INSERT INTO quiz_tentativa_questoes (
        tentativa_id,
        questao_id,
        ordem
      )
      VALUES (?, ?, ?)
      `,
      [tentativaId, questionRows[index].id, index + 1]
    );
  }

  const quizWithQuestions = await getQuizAttemptQuestions(
    quizId,
    tentativaId,
    false
  );

  return {
    tentativa_id: tentativaId,
    quiz: quizWithQuestions,
  };
}

async function getQuizAttemptQuestions(
  quizId: number,
  tentativaId: number,
  showCorrectAnswers = false
): Promise<QuizWithQuestions> {
  const [quizRows] = await pool.query<any[]>(
    `
    SELECT 
      id,
      curso_id,
      modulo_id,
      aula_id,
      titulo,
      tipo,
      nota_minima,
      max_tentativas,
      questoes_por_tentativa,
      sorteio_ativo,
      status,
      criado_em,
      atualizado_em
    FROM quizzes
    WHERE id = ?
    LIMIT 1
    `,
    [quizId]
  );

  if (quizRows.length === 0) {
    throw new AppError("Quiz não encontrado", 404);
  }

  const quiz = quizRows[0];

  const [questionRows] = await pool.query<any[]>(
    `
    SELECT 
      qq.id,
      qq.quiz_id,
      qq.pergunta,
      qq.explicacao,
      qtq.ordem,
      qq.criado_em
    FROM quiz_tentativa_questoes qtq
    INNER JOIN quiz_questoes qq ON qq.id = qtq.questao_id
    WHERE qtq.tentativa_id = ?
    ORDER BY qtq.ordem ASC
    `,
    [tentativaId]
  );

  const questionsWithOptions = await Promise.all(
    questionRows.map(async (question) => {
      const [optionRows] = await pool.query<any[]>(
        `
        SELECT 
          id,
          questao_id,
          texto_opcao
          ${showCorrectAnswers ? ", correta" : ""}
        FROM quiz_opcoes
        WHERE questao_id = ?
        ORDER BY id ASC
        `,
        [question.id]
      );

      return {
        ...question,
        opcoes: optionRows,
      };
    })
  );

  return {
    ...quiz,
    questoes: questionsWithOptions,
  };
}