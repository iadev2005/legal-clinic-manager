import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los solicitantes
export async function GET() {
  try {
    const applicants = await prisma.applicant.findMany({
      include: {
        _count: {
          select: {
            cases: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(applicants);
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { error: "Error al obtener los solicitantes" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo solicitante
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, idDocument } = body;

    // Verificar si ya existe un solicitante con esa cédula
    const existing = await prisma.applicant.findUnique({
      where: { idDocument },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un solicitante con esta cédula" },
        { status: 400 }
      );
    }

    const newApplicant = await prisma.applicant.create({
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

    return NextResponse.json(newApplicant, { status: 201 });
  } catch (error) {
    console.error("Error creating applicant:", error);
    return NextResponse.json(
      { error: "Error al crear el solicitante" },
      { status: 500 }
    );
  }
}
