import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener un solicitante por ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const applicant = await prisma.applicant.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            cases: true,
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json(
        { error: "Solicitante no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(applicant);
  } catch (error) {
    console.error("Error fetching applicant:", error);
    return NextResponse.json(
      { error: "Error al obtener el solicitante" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un solicitante
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, address, idDocument } = body;

    // Verificar si el solicitante existe
    const existing = await prisma.applicant.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Solicitante no encontrado" },
        { status: 404 }
      );
    }

    // Si se cambió la cédula, verificar que no exista otra con ese número
    if (idDocument !== existing.idDocument) {
      const duplicateCI = await prisma.applicant.findUnique({
        where: { idDocument },
      });

      if (duplicateCI) {
        return NextResponse.json(
          { error: "Ya existe un solicitante con esta cédula" },
          { status: 400 }
        );
      }
    }

    const updatedApplicant = await prisma.applicant.update({
      where: { id: params.id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        idDocument,
      },
      include: {
        _count: {
          select: {
            cases: true,
          },
        },
      },
    });

    return NextResponse.json(updatedApplicant);
  } catch (error) {
    console.error("Error updating applicant:", error);
    return NextResponse.json(
      { error: "Error al actualizar el solicitante" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un solicitante
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si tiene casos asociados
    const applicant = await prisma.applicant.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            cases: true,
          },
        },
      },
    });

    if (!applicant) {
      return NextResponse.json(
        { error: "Solicitante no encontrado" },
        { status: 404 }
      );
    }

    if (applicant._count.cases > 0) {
      return NextResponse.json(
        { error: "No se puede eliminar un solicitante con casos asociados" },
        { status: 400 }
      );
    }

    await prisma.applicant.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Solicitante eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting applicant:", error);
    return NextResponse.json(
      { error: "Error al eliminar el solicitante" },
      { status: 500 }
    );
  }
}
