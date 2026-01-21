import Link from "next/link";
import NextImage from "next/image";

export default async function Home() {

  return (
    <div className="w-full h-screen relative overflow-hidden">
      <NextImage
        src="/bg.svg"
        alt="Background"
        fill
        className="object-cover"
        priority
      />
      <div className="w-full h-full left-0 top-0 absolute" style={{ background: "linear-gradient(111deg, #036 42.22%, rgba(0, 102, 204, 0.64) 102.14%)" }} />
      <div className="w-full h-full px-[25%] py-[24%] left-0 top-0 absolute inline-flex flex-col justify-center items-center gap-2 overflow-hidden">
        <NextImage
          src="/logo.svg"
          alt="Logo"
          width={0}
          height={0}
          sizes="100vw"
          className="w-[60%] h-auto"
          priority
        />
        <div className="self-stretch pb-7 inline-flex justify-center items-center gap-2.5">
          <h1 className="flex-1 text-center justify-start text-neutral-50 text-2xl font-semibold [text-shadow:_0px_10px_8px_rgb(0_0_0_/_0.25)]">Plataforma integral para la administración de expedientes, control de solicitantes y seguimiento académico alineado con los tribunales.</h1>
        </div>
        <div className="self-stretch px-[10%] flex flex-col justify-start items-start gap-6">
          <Link href="/login" className="h-[11%] w-full py-[5%] bg-[#0A233C] rounded-2xl inline-flex justify-center items-center gap-2.5 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95">
            <div className="justify-start text-neutral-50 text-3xl font-semibold">Iniciar Sesión</div>
          </Link>

        </div>
      </div>
    </div >
  );
}