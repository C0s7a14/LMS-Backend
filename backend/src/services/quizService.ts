import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";

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
  respostas: SubmitAnswerDTO[]
) {
  if (!Array.isArray(respostas) || respostas.length === 0) {
    throw new AppError("Envie as respostas do quiz", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [quizRows]: any = await connection.query(
      "SELECT * FROM quizzes WHERE id = ?",
      [quizId]
    );

    if (quizRows.length === 0) {
      throw new AppError("Quiz não encontrado", 404);
    }

    const quiz = quizRows[0];

    if (quiz.status !== "publicado") {
      throw new AppError("Este quiz ainda não está publicado", 403);
    }

    const [attemptRows]: any = await connection.query(
      `
        SELECT COUNT(*) AS total
        FROM quiz_tentativas
        WHERE usuario_id = ? AND quiz_id = ?
      `,
      [userId, quizId]
    );

    const totalTentativas = Number(attemptRows[0].total || 0);

    if (totalTentativas >= quiz.max_tentativas) {
      throw new AppError(
        "Você atingiu o número máximo de tentativas",
        403
      );
    }

    const [questionRows]: any = await connection.query(
      `
        SELECT id
        FROM quiz_questoes
        WHERE quiz_id = ?
      `,
      [quizId]
    );

    if (questionRows.length === 0) {
      throw new AppError("Este quiz não possui questões", 400);
    }

    const questionIds = questionRows.map((questao: any) => questao.id);

    const [optionRows]: any = await connection.query(
      `
        SELECT
          o.id,
          o.questao_id,
          o.correta
        FROM quiz_opcoes o
        INNER JOIN quiz_questoes q ON q.id = o.questao_id
        WHERE q.quiz_id = ?
      `,
      [quizId]
    );

    const respostasPorQuestao = new Map<number, number>();

    for (const resposta of respostas) {
      if (respostasPorQuestao.has(resposta.questao_id)) {
        throw new AppError(
          "Existe questão respondida mais de uma vez",
          400
        );
      }

      respostasPorQuestao.set(
        Number(resposta.questao_id),
        Number(resposta.opcao_id)
      );
    }

    for (const questionId of questionIds) {
      if (!respostasPorQuestao.has(questionId)) {
        throw new AppError(
          "Todas as questões precisam ser respondidas",
          400
        );
      }
    }

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
          "Uma das opções enviadas não pertence à questão informada",
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
    const aprovado = nota >= Number(quiz.nota_minima);

    const [attemptResult]: any = await connection.query(
      `
        INSERT INTO quiz_tentativas (
          usuario_id,
          quiz_id,
          nota,
          total_questoes,
          total_acertos,
          aprovado,
          finalizado_em
        )
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        userId,
        quizId,
        nota,
        totalQuestoes,
        totalAcertos,
        aprovado ? 1 : 0,
      ]
    );

    const tentativaId = attemptResult.insertId;

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

    if (quiz.tipo === "prova_final" && aprovado) {
      const [certificateRows]: any = await connection.query(
        `
          SELECT id
          FROM certificados
          WHERE usuario_id = ? AND curso_id = ?
          LIMIT 1
        `,
        [userId, quiz.curso_id]
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
            quiz.curso_id,
            null,
            generateValidationCode(),
          ]
        );

        certificadoEmitido = true;
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
        nota_minima: Number(quiz.nota_minima),
        total_questoes: totalQuestoes,
        total_acertos: totalAcertos,
        aprovado,
        tentativas_usadas: totalTentativas + 1,
        max_tentativas: quiz.max_tentativas,
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