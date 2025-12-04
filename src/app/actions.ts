"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ---------------------------
// SOLICITANTES
// ---------------------------
export async function createSolicitante(formData: FormData) {
  const cedula = String(formData.get("cedula") ?? "").trim();
  const nombres = String(formData.get("nombres") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const correo = String(formData.get("correo") ?? "").trim() || null;
  const sexo = formData.get("sexo") as Prisma.TipoSexo | null;

  if (!cedula || !nombres || !apellidos) {
    return;
  }

  try {
    await prisma.solicitante.create({
      data: {
        cedula_solicitante: cedula,
        nombres,
        apellidos,
        correo,
        sexo,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error al crear solicitante:", error);
  }
}

export async function deleteSolicitante(formData: FormData) {
  const cedula = String(formData.get("cedula") ?? "").trim();

  if (!cedula) return;

  try {
    await prisma.solicitante.delete({
      where: { cedula_solicitante: cedula },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error al eliminar solicitante:", error);
  }
}

// ---------------------------
// CASOS
// ---------------------------
export async function createCaso(formData: FormData) {
  const tipoCaso = String(formData.get("tipoCaso") ?? "").trim();
  const cedulaSolicitante = String(formData.get("cedulaSolicitante") ?? "").trim() || null;
  const tramite = (formData.get("tramite") as Prisma.TipoTramite | null) ?? null;
  const estatus = (formData.get("estatus") as Prisma.EstatusCaso | null) ?? null;
  const observacion = String(formData.get("observacion") ?? "").trim() || null;
  const nroExpediente = String(formData.get("nroExpediente") ?? "").trim() || null;

  if (!tipoCaso) return;

  try {
    await prisma.caso.create({
      data: {
        tipo_caso: tipoCaso,
        cedula_solicitante: cedulaSolicitante || null,
        tramite,
        estatus,
        observacion,
        nro_expediente_tribunal: nroExpediente,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error al crear caso:", error);
  }
}

export async function deleteCaso(formData: FormData) {
  const id = Number(formData.get("nroCaso"));
  if (!id) return;

  try {
    await prisma.caso.delete({
      where: { nro_caso: id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error al eliminar caso:", error);
  }
}

// ---------------------------
// BENEFICIARIOS
// ---------------------------
export async function createBeneficiario(formData: FormData) {
  const nombres = String(formData.get("nombres") ?? "").trim();
  const apellidos = String(formData.get("apellidos") ?? "").trim();
  const cedula = String(formData.get("cedula") ?? "").trim() || null;
  const sexo = formData.get("sexo") as Prisma.TipoSexo | null;
  const nroCaso = Number(formData.get("nroCaso"));
  const tipoRelacion = formData.get("tipoRelacion") as Prisma.TipoBeneficiarioRel | null;
  const parentesco = String(formData.get("parentesco") ?? "").trim() || null;

  if (!nombres || !apellidos) return;

  try {
    const beneficiario = await prisma.beneficiario.create({
      data: {
        nombres,
        apellidos,
        cedula,
        sexo,
      },
    });

    if (nroCaso) {
      await prisma.beneficiario_Caso.create({
        data: {
          id_beneficiario: beneficiario.id_beneficiario,
          nro_caso: nroCaso,
          tipo_beneficiario: tipoRelacion,
          tipo_parentesco: parentesco,
        },
      });
    }

    revalidatePath("/");
  } catch (error) {
    console.error("Error al crear beneficiario:", error);
  }
}

export async function deleteBeneficiario(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!id) return;

  try {
    await prisma.beneficiario.delete({
      where: { id_beneficiario: id },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error al eliminar beneficiario:", error);
  }
}

export async function asociarBeneficiarioACaso(formData: FormData) {
  const beneficiarioId = Number(formData.get("beneficiarioId"));
  const nroCaso = Number(formData.get("nroCaso"));
  const tipoRelacion = formData.get("tipoRelacion") as Prisma.TipoBeneficiarioRel | null;
  const parentesco = String(formData.get("parentesco") ?? "").trim() || null;

  if (!beneficiarioId || !nroCaso) return;

  try {
    await prisma.beneficiario_Caso.create({
      data: {
        id_beneficiario: beneficiarioId,
        nro_caso: nroCaso,
        tipo_beneficiario: tipoRelacion,
        tipo_parentesco: parentesco,
      },
    });
    revalidatePath("/");
  } catch (error) {
    console.error("Error al asociar beneficiario:", error);
  }
}
