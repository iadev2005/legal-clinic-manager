"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Server Action para crear un usuario
export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  if (!email) {
    return;
  }

  try {
    await prisma.user.create({
      data: {
        email,
        name: name || null,
      },
    });
    
    revalidatePath("/");
  } catch (error: any) {
    // Si hay error, simplemente no hacemos nada
    // En producción podrías usar un sistema de logging
    console.error("Error al crear usuario:", error);
  }
}

// Server Action para borrar un usuario
export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string;

  if (!id) {
    return;
  }

  try {
    await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    
    revalidatePath("/");
  } catch (error) {
    console.error("Error al borrar usuario:", error);
  }
}

