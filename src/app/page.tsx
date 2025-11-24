import { prisma } from "@/lib/prisma";
import { createUser, deleteUser } from "./actions";
import type { User } from "@prisma/client";
import Link from "next/link";

// Componente principal (async para hacer fetch de datos)
export default async function Home() {
  let users: User[] = [];
  let errorMessage: string | null = null;

  try {
    users = await prisma.user.findMany({
      orderBy: {
        id: "desc",
      },
    });
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    errorMessage = error?.message || "Error desconocido";
    users = [];
  }

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <img src="/bg.svg" className="w-full h-full object-cover" />
      <div className="w-full h-full left-0 top-0 absolute" style={{ background: "linear-gradient(111deg, #036 42.22%, rgba(0, 102, 204, 0.64) 102.14%)" }} />
      <div className="w-full h-full px-[31%] py-[24%] left-0 top-0 absolute inline-flex flex-col justify-center items-center gap-6 overflow-hidden">
        <img src="/logo.svg" className="w-[80%]" />
        <Link href="/auth/login" className="h-[11%] w-full py-[5%] bg-[#0A233C] rounded-2xl inline-flex justify-center items-center gap-2.5">
          <div className="justify-start text-neutral-50 text-3xl font-semibold">Iniciar Sesión</div>
        </Link>
        <Link href="/auth/register" className="h-[11%] w-full py-[5%] bg-neutral-50 rounded-2xl inline-flex justify-center items-center gap-2.5">
          <div className="justify-start text-[#0A233C] text-3xl font-semibold">Registrarse</div>
        </Link>
      </div>
    </div >
  );
}
