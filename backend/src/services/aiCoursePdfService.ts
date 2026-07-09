import axios from "axios";
import { PDFParse } from "pdf-parse";

import { pool } from "../database/connection.js";
import { AppError } from "../middlewares/errorMiddleware.js";

async function readCoursePdfText(courseId: number, file?: Express.Multer.File) {
  if (!file) {
    throw new AppError("Envie um arquivo PDF", 400);
  }

  const [courseRows]: any = await pool.query(
    "SELECT id, titulo FROM cursos WHERE id = ?",
    [courseId]
  );

  if (courseRows.length === 0) {
    throw new AppError("Curso não encontrado", 404);
  }



  const parser = new PDFParse({
    data: new Uint8Array(file.buffer),
  });

  try {
    const pdfInfo = await parser.getInfo();

    const parsedPdf = await parser.getText();

    const cleanText = parsedPdf.text
      .replace(/\n+/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    if (!cleanText || cleanText.length < 100) {
      throw new AppError(
        "Não foi possível extrair texto suficiente deste PDF",
        400
      );
    }

    return {
      course: {
        id: courseRows[0].id,
        titulo: courseRows[0].titulo,
      },
      pdf: {
        name: file.originalname,
        pages: pdfInfo.total,
        total_characters: cleanText.length,
      },
      cleanText,
    };
  } finally {
    await parser.destroy();
  }
}

export async function extractCoursePdfTextService(
  courseId: number,
  file?: Express.Multer.File
) {
  const extracted = await readCoursePdfText(courseId, file);

  return {
    message: "PDF lido com sucesso",
    course: extracted.course,
    pdf: extracted.pdf,
    text_preview: extracted.cleanText.slice(0, 12000),
  };
}

export async function generateCourseFromPdfService(
  courseId: number,
  file?: Express.Multer.File
) {
  const extracted = await readCoursePdfText(courseId, file);

  const aiServiceUrl =
    process.env.AI_SERVICE_URL || "http://localhost:8000";

  try {
    const aiResponse = await axios.post(
      `${aiServiceUrl}/ai/course/generate`,
      {
        courseTitle: extracted.course.titulo,
        pdfText: extracted.cleanText,
      },
      {
        timeout: 120000,
      }
    );

    return {
      message: "Curso gerado com IA com sucesso",
      course: extracted.course,
      pdf: extracted.pdf,
      generated_course: aiResponse.data.course,
    };
  } catch (error: any) {
    console.log(error.response?.data || error.message);

    throw new AppError(
      "Erro ao gerar curso com o agente de IA",
      500
    );
  }
}

interface GeneratedAulaDTO {
  titulo: string;
  descricao?: string;
  conteudo?: string;
  duracao?: number;
  ordem?: number;
}

interface GeneratedModuloDTO {
  titulo: string;
  ordem?: number;
  aulas: GeneratedAulaDTO[];
}

interface GeneratedCourseDTO {
  titulo?: string;
  descricao?: string;
  modulos: GeneratedModuloDTO[];
}

export async function applyGeneratedCourseService(
  courseId: number,
  generatedCourse: GeneratedCourseDTO,
  replaceExisting = false
) {
  if (!generatedCourse) {
    throw new AppError("Curso gerado não enviado", 400);
  }

  if (!Array.isArray(generatedCourse.modulos)) {
    throw new AppError("A estrutura gerada precisa conter módulos", 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [courseRows]: any = await connection.query(
      "SELECT id, titulo FROM cursos WHERE id = ?",
      [courseId]
    );

    if (courseRows.length === 0) {
      throw new AppError("Curso não encontrado", 404);
    }

    if (generatedCourse.titulo || generatedCourse.descricao) {
  await connection.query(
    `
      UPDATE cursos
      SET
        titulo = COALESCE(NULLIF(?, ''), titulo),
        descricao = COALESCE(NULLIF(?, ''), descricao)
      WHERE id = ?
    `,
    [
      generatedCourse.titulo?.trim() || "",
      generatedCourse.descricao?.trim() || "",
      courseId,
    ]
  );
}

    if (replaceExisting) {
      const [existingModules]: any = await connection.query(
        "SELECT id FROM modulos WHERE curso_id = ?",
        [courseId]
      );

      const moduleIds = existingModules.map((modulo: any) => modulo.id);

      if (moduleIds.length > 0) {
        await connection.query(
          "DELETE FROM aulas WHERE modulo_id IN (?)",
          [moduleIds]
        );

        await connection.query(
          "DELETE FROM modulos WHERE curso_id = ?",
          [courseId]
        );
      }
    }

    let totalModulos = 0;
    let totalAulas = 0;

    for (const [moduleIndex, modulo] of generatedCourse.modulos.entries()) {
      if (!modulo.titulo?.trim()) {
        continue;
      }

      const [moduleResult]: any = await connection.query(
        `
          INSERT INTO modulos (
            curso_id,
            titulo,
            ordem
          )
          VALUES (?, ?, ?)
        `,
        [
          courseId,
          modulo.titulo.trim(),
          modulo.ordem || moduleIndex + 1,
        ]
      );

      const moduloId = moduleResult.insertId;

      totalModulos++;

      if (!Array.isArray(modulo.aulas)) {
        continue;
      }

      for (const [lessonIndex, aula] of modulo.aulas.entries()) {
        if (!aula.titulo?.trim()) {
          continue;
        }

        await connection.query(
          `
            INSERT INTO aulas (
              modulo_id,
              titulo,
              descricao,
              conteudo,
              duracao,
              ordem,
              status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            moduloId,
            aula.titulo.trim(),
            aula.descricao || null,
            aula.conteudo || null,
            aula.duracao || 10,
            aula.ordem || lessonIndex + 1,
            "publicada",
          ]
        );

        totalAulas++;
      }
    }

    await connection.commit();

    return {
      message: "Curso gerado aplicado com sucesso",
      course: {
        id: courseRows[0].id,
        titulo: courseRows[0].titulo,
      },
      total_modulos_criados: totalModulos,
      total_aulas_criadas: totalAulas,
      replace_existing: replaceExisting,
    };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
}