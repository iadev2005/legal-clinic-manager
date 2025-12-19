import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Obtener estadísticas del dashboard
export async function GET() {
  try {
    // Casos activos (en proceso)
    const activeCases = await prisma.case.count({
      where: {
        status: "EN_PROCESO",
      },
    });

    // Total de solicitantes
    const totalApplicants = await prisma.applicant.count();

    // Casos en tribunales (citaciones pendientes)
    const casesInCourt = await prisma.citation.count({
      where: {
        status: "Pendiente",
        date: {
          gte: new Date(),
        },
      },
    });

    // Tareas pendientes para hoy
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const pendingToday = await prisma.task.count({
      where: {
        status: "PENDING",
        dueDate: {
          lte: today,
        },
      },
    });

    // Casos por estatus
    const casesByStatus = await prisma.case.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    return NextResponse.json({
      activeCases,
      totalApplicants,
      casesInCourt,
      pendingToday,
      casesByStatus,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Error al obtener las estadísticas" },
      { status: 500 }
    );
  }
}
