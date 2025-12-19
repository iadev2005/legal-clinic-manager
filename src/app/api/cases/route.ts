import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener todos los casos
export async function GET() {
  try {
    const cases = await prisma.case.findMany({
      include: {
        applicant: true,
        assignedTo: true,
        _count: {
          select: {
            tasks: true,
            citations: true,
            documents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error("Error fetching cases:", error);
    return NextResponse.json(
      { error: "Error al obtener los casos" },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo caso
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      caseNumber,
      title,
      description,
      applicantId,
      assignedToId,
      priority,
    } = body;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title,
        description,
        applicantId,
        assignedToId,
        priority: priority || "MEDIA",
      },
      include: {
        applicant: true,
        assignedTo: true,
      },
    });

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    console.error("Error creating case:", error);
    return NextResponse.json(
      { error: "Error al crear el caso" },
      { status: 500 }
    );
  }
}
