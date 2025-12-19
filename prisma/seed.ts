import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed de la base de datos...");

  // Crear usuarios
  const student1 = await prisma.user.create({
    data: {
      email: "luis.martinez@ucab.edu.ve",
      name: "Luis Martínez",
      password: "password123", // En producción, usar hash
      role: "STUDENT",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: "ana.silva@ucab.edu.ve",
      name: "Ana Silva",
      password: "password123",
      role: "STUDENT",
    },
  });

  const professor = await prisma.user.create({
    data: {
      email: "dr.briceno@ucab.edu.ve",
      name: "Dr. Briceño",
      password: "password123",
      role: "PROFESSOR",
    },
  });

  console.log("✅ Usuarios creados");

  // Crear solicitantes
  const applicant1 = await prisma.applicant.create({
    data: {
      name: "María González",
      email: "maria.gonzalez@email.com",
      phone: "+58 412-1234567",
      address: "Caracas, Venezuela",
      idDocument: "V-12345678",
    },
  });

  const applicant2 = await prisma.applicant.create({
    data: {
      name: "Carlos Rodríguez",
      email: "carlos.rodriguez@email.com",
      phone: "+58 414-9876543",
      address: "Valencia, Venezuela",
      idDocument: "V-87654321",
    },
  });

  const applicant3 = await prisma.applicant.create({
    data: {
      name: "Laura Pérez",
      email: "laura.perez@email.com",
      phone: "+58 424-5555555",
      address: "Maracaibo, Venezuela",
      idDocument: "V-11223344",
    },
  });

  console.log("✅ Solicitantes creados");

  // Crear casos
  const case1 = await prisma.case.create({
    data: {
      caseNumber: "2024-051",
      title: "Divorcio Contencioso",
      description: "Caso de divorcio con disputa de bienes",
      status: "EN_PROCESO",
      priority: "ALTA",
      applicantId: applicant1.id,
      assignedToId: student1.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      caseNumber: "2024-049",
      title: "Demanda Laboral",
      description: "Despido injustificado",
      status: "EN_PROCESO",
      priority: "MEDIA",
      applicantId: applicant2.id,
      assignedToId: student2.id,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      caseNumber: "2024-052",
      title: "Asesoría Legal",
      description: "Consulta sobre contrato de arrendamiento",
      status: "ASESORIA",
      priority: "BAJA",
      applicantId: applicant3.id,
      assignedToId: student1.id,
    },
  });

  const case4 = await prisma.case.create({
    data: {
      caseNumber: "2024-048",
      title: "Pensión Alimenticia",
      description: "Solicitud de pensión para menores",
      status: "ARCHIVADO",
      priority: "MEDIA",
      applicantId: applicant1.id,
      assignedToId: student2.id,
      closedAt: new Date("2024-11-15"),
    },
  });

  console.log("✅ Casos creados");

  // Crear tareas
  await prisma.task.create({
    data: {
      title: "Redactar Informe Preliminar",
      description: "Elaborar informe inicial del caso",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      status: "PENDING",
      priority: "ALTA",
      caseId: case1.id,
      assignedToId: student1.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Entrevista con Solicitante",
      description: "Reunión para recopilar información adicional",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
      status: "PENDING",
      priority: "MEDIA",
      caseId: case2.id,
      assignedToId: student2.id,
    },
  });

  await prisma.task.create({
    data: {
      title: "Revisar Expediente en Tribunal",
      description: "Verificar documentación en el tribunal",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 20)),
      status: "PENDING",
      priority: "BAJA",
      caseId: case3.id,
      assignedToId: student1.id,
    },
  });

  console.log("✅ Tareas creadas");

  // Crear citaciones
  await prisma.citation.create({
    data: {
      date: new Date(new Date().setDate(new Date().getDate() + 7)),
      location: "Tribunal de Primera Instancia - Caracas",
      description: "Audiencia preliminar",
      status: "Pendiente",
      caseId: case1.id,
    },
  });

  await prisma.citation.create({
    data: {
      date: new Date(new Date().setDate(new Date().getDate() + 14)),
      location: "Tribunal Laboral - Valencia",
      description: "Audiencia de conciliación",
      status: "Pendiente",
      caseId: case2.id,
    },
  });

  console.log("✅ Citaciones creadas");

  // Crear actividades
  await prisma.activity.create({
    data: {
      action: "Registro Actuación Caso #2024-051",
      description: "Se registró nueva actuación en el expediente",
      userId: student1.id,
      caseId: case1.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: "Carga de Documento",
      description: "Se cargó documento de identidad del solicitante",
      userId: student2.id,
      caseId: case2.id,
    },
  });

  await prisma.activity.create({
    data: {
      action: "Aprobación de Caso",
      description: "Caso aprobado para seguimiento",
      userId: professor.id,
      caseId: case1.id,
    },
  });

  console.log("✅ Actividades creadas");

  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
