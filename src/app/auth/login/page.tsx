"use client";

import Link from "next/link";
import { useState } from "react";
import { LabeledInput } from "@/components/inputs/LabeledInput";
import { InputContainer } from "@/components/inputs/InputContainer";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [cedulaPrefix, setCedulaPrefix] = useState("V");
    const [isPrefixOpen, setIsPrefixOpen] = useState(false);
    const prefixes = ["V", "E"];
    const [cedulaNumber, setCedulaNumber] = useState("");
    const [password, setPassword] = useState("");

    const isValid = cedulaNumber.trim() !== "" && password.trim() !== "";

    return (
        <div className="w-full h-screen relative overflow-hidden">
            <img src="/bg.svg" className="w-full h-full object-cover" />
            <div className="w-full h-full left-0 top-0 absolute" style={{ background: "linear-gradient(111deg, #036 42.22%, rgba(0, 102, 204, 0.64) 102.14%)" }} />
            <div className="w-full h-full px-[19%] py-[3%] left-0 top-0 absolute inline-flex flex-col justify-center items-center gap-6 overflow-hidden">
                <img src="/logo.svg" className="w-[47%]" />
                <div className="self-stretch px-[3%] py-[2%] bg-neutral-50 rounded-[20px] shadow-[0px_5px_24.600000381469727px_0px_rgba(0,0,0,0.25)] flex flex-col justify-start items-center gap-5">

                    <LabeledInput label="Cedula de Identidad:" className="self-stretch">
                        <InputContainer className="px-[0.8%] py-[0.3%] flex items-center gap-2">
                            <span className="icon-[tabler--users] text-2xl text-sky-950"></span>
                            <div className="relative">
                                <div
                                    onClick={() => setIsPrefixOpen(!isPrefixOpen)}
                                    className="flex items-center gap-1 cursor-pointer"
                                >
                                    <div className="text-sky-950 text-xl font-semibold">{cedulaPrefix}-</div>
                                    <span className={`icon-[mingcute--down-fill] text-xl text-sky-950 transition-transform duration-300 ${isPrefixOpen ? "rotate-180" : ""}`}></span>
                                </div>
                                {isPrefixOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-neutral-50 rounded-xl outline outline-[3px] outline-sky-950 z-10 overflow-hidden shadow-lg min-w-[60px]">
                                        {prefixes.map((p) => (
                                            <div
                                                key={p}
                                                onClick={() => {
                                                    setCedulaPrefix(p);
                                                    setIsPrefixOpen(false);
                                                }}
                                                className="px-2 py-2 hover:bg-blue-100 cursor-pointer text-sky-950 text-xl font-semibold text-center"
                                            >
                                                {p}-
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                placeholder="12.345.678"
                                className="w-full bg-transparent outline-none text-sky-950 text-xl font-semibold placeholder:text-sky-950/30"
                                value={cedulaNumber}
                                onChange={(e) => setCedulaNumber(e.target.value)}
                            />
                        </InputContainer>
                    </LabeledInput>

                    <LabeledInput label="Contraseña:" className="self-stretch">
                        <InputContainer className="px-[0.8%] py-[0.3%] justify-between">
                            <div className="flex justify-start items-center gap-2 w-full">
                                <span className="icon-[uil--lock] text-2xl text-sky-950"></span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••••••••"
                                    className="w-full bg-transparent outline-none text-sky-950 text-xl font-semibold placeholder:text-sky-950/30"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                onMouseDown={() => setShowPassword(true)}
                                onMouseUp={() => setShowPassword(false)}
                                onMouseLeave={() => setShowPassword(false)}
                                onTouchStart={() => setShowPassword(true)}
                                onTouchEnd={() => setShowPassword(false)}
                                className="focus:outline-none flex items-center justify-center cursor-pointer"
                            >
                                <span className={`text-2xl text-sky-950 ${showPassword ? "icon-[uil--eye]" : "icon-[uil--eye-slash]"}`}></span>
                            </button>
                        </InputContainer>
                    </LabeledInput>

                    <div className="self-stretch pt-[1%] flex flex-col justify-start items-center gap-2">
                        <Link
                            href={isValid ? "/dashboard" : "#"}
                            className={`self-stretch py-[1%] rounded-2xl inline-flex justify-center items-center gap-2.5 transition-colors duration-300 ${isValid ? "bg-[#0A233C] hover:bg-[#0A233C]/90 cursor-pointer" : "bg-gray-400 cursor-not-allowed pointer-events-none"}`}
                            aria-disabled={!isValid}
                        >
                            <div className="justify-start text-neutral-50 text-2xl font-semibold">Iniciar Sesión</div>
                        </Link>
                        <div className="self-stretch text-center justify-start">
                            <span className="text-sky-950 text-xl font-semibold">¿No tienes una cuenta? </span>
                            <Link href="/auth/register" className="text-[#3E7DBB] text-xl font-semibold underline hover:text-[#3E7DBB]/80 transition-colors">
                                Regístrate
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}