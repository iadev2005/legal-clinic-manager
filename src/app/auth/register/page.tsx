"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LabeledInput } from "@/components/inputs/LabeledInput";
import { InputContainer } from "@/components/inputs/InputContainer";

export default function Register() {
    const [selectedRole, setSelectedRole] = useState("Estudiante");
    const roles = ["Estudiante", "Profesor", "Coordinador"];
    const [cedulaPrefix, setCedulaPrefix] = useState("V");
    const [isPrefixOpen, setIsPrefixOpen] = useState(false);
    const prefixes = ["V", "E"];
    const [cedulaNumber, setCedulaNumber] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidos, setApellidos] = useState("");
    const [correo, setCorreo] = useState("");
    const [sexo, setSexo] = useState("M");
    const [isSexoOpen, setIsSexoOpen] = useState(false);
    const sexos = ["M", "F"];
    const [telefonoLocal, setTelefonoLocal] = useState("");
    const [telefonoCelular, setTelefonoCelular] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        setIsValid(
            cedulaNumber.length >= 7 &&
            nombres.length >= 2 &&
            apellidos.length >= 2 &&
            correo.length >= 5 &&
            sexo.length === 1 &&
            telefonoLocal.length >= 7 &&
            telefonoCelular.length >= 10 &&
            password.length >= 8 &&
            confirmPassword.length >= 8 &&
            password === confirmPassword
        );
    }, [cedulaNumber, nombres, apellidos, correo, sexo, telefonoLocal, telefonoCelular, password, confirmPassword]);

    return (
        <div className="w-full h-screen relative overflow-hidden">
            <img src="/bg.svg" className="w-full h-full object-cover" />
            <div className="w-full h-full left-0 top-0 absolute" style={{ background: "linear-gradient(111deg, #036 42.22%, rgba(0, 102, 204, 0.64) 102.14%)" }} />
            <div className="w-full h-full left-0 top-0 absolute px-[4%] inline-flex justify-center items-center gap-32 flex-wrap content-center overflow-hidden">
                <div className="flex-1 min-w-[38%] px-[3%] py-[1%] bg-neutral-50 rounded-[25px] shadow-[0px_5px_24.600000381469727px_0px_rgba(0,0,0,0.25)] inline-flex flex-col justify-start items-center gap-4">

                    {/* Roles en el Sistema */}
                    <LabeledInput label="Rol en el Sistema:" className="self-stretch">
                        <div className="self-stretch inline-flex justify-center items-center gap-6">
                            {roles.map((role) => (
                                <div
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={`flex-1 py-[0.5%] rounded-xl outline outline-[3px] outline-sky-950 flex justify-center items-center gap-2.5 cursor-pointer transition-colors ${selectedRole === role ? "bg-blue-100" : "bg-neutral-50 hover:bg-gray-100"
                                        }`}
                                >
                                    <div className="justify-start text-sky-950 text-lg font-semibold">{role}</div>
                                </div>
                            ))}
                        </div>
                    </LabeledInput>

                    {/* Cedula del Estudiante */}
                    <LabeledInput label="Cedula de Identidad:" className="self-stretch">
                        <InputContainer className="px-[2%] py-[0.5%] flex items-center gap-2">
                            <span className="icon-[tabler--users] text-xl text-sky-950"></span>
                            <div className="relative">
                                <div
                                    onClick={() => setIsPrefixOpen(!isPrefixOpen)}
                                    className="flex items-center gap-1 cursor-pointer"
                                >
                                    <div className="text-sky-950 text-lg font-semibold">{cedulaPrefix}-</div>
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
                                                className="px-2 py-2 hover:bg-blue-100 cursor-pointer text-sky-950 text-lg font-semibold text-center"
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
                                className="w-full bg-transparent outline-none text-sky-950 text-lg font-semibold placeholder:text-sky-950/30"
                                value={cedulaNumber}
                                onChange={(e) => setCedulaNumber(e.target.value)}
                            />
                        </InputContainer>
                    </LabeledInput>

                    {/* Nombres y Apellidos */}
                    <div className="self-stretch inline-flex justify-center items-center gap-8">
                        <LabeledInput label="Nombres:" className="flex-1 self-stretch">
                            <InputContainer className="px-[4%] py-[0.5%]">
                                <input
                                    type="text"
                                    className="w-full bg-transparent outline-none text-sky-950 text-lg font-semibold placeholder:text-sky-950/30"
                                    value={nombres}
                                    onChange={(e) => setNombres(e.target.value)}
                                />
                            </InputContainer>
                        </LabeledInput>
                        <LabeledInput label="Apellidos:" className="flex-1 self-stretch">
                            <InputContainer className="px-[4%] py-[0.5%]">
                                <input
                                    type="text"
                                    className="w-full bg-transparent outline-none text-sky-950 text-lg font-semibold placeholder:text-sky-950/30"
                                    value={apellidos}
                                    onChange={(e) => setApellidos(e.target.value)}
                                />
                            </InputContainer>
                        </LabeledInput>
                    </div>

                    {/* Correo y Sexo */}
                    <div className="self-stretch inline-flex justify-center items-center gap-8">
                        <LabeledInput label="Correo Institucional:" className="flex-1 self-stretch">
                            <InputContainer className="px-[4%] py-[0.5%]">
                                <input
                                    type="text"
                                    placeholder="@universidad.edu"
                                    className="w-full bg-transparent outline-none text-sky-950 text-lg font-semibold placeholder:text-sky-950/30"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                />
                            </InputContainer>
                        </LabeledInput>
                        <LabeledInput label="Sexo:" className="flex-1 self-stretch">
                            <div className="relative self-stretch">
                                <InputContainer
                                    onClick={() => setIsSexoOpen(!isSexoOpen)}
                                    className="w-full px-[4%] py-[0.5%] justify-between cursor-pointer"
                                >
                                    <div className="flex-1 justify-start text-sky-950 text-lg font-semibold">{sexo}</div>
                                    <span className={`icon-[mingcute--down-fill] text-xl text-sky-950 transition-transform duration-300 ${isSexoOpen ? "rotate-180" : ""}`}></span>
                                </InputContainer>
                                {isSexoOpen && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-neutral-50 rounded-xl outline outline-[3px] outline-sky-950 z-10 overflow-hidden shadow-lg">
                                        {sexos.map((option) => (
                                            <div
                                                key={option}
                                                onClick={() => {
                                                    setSexo(option);
                                                    setIsSexoOpen(false);
                                                }}
                                                className="px-[4%] py-2 hover:bg-blue-100 cursor-pointer text-sky-950 text-lg font-semibold"
                                            >
                                                {option}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </LabeledInput>
                    </div>

                    {/* Telefonos */}
                    <div className="self-stretch inline-flex justify-center items-center gap-8">
                        <LabeledInput label="Telefono Local:" className="flex-1 self-stretch">
                            <InputContainer className="px-[4%] py-[0.5%]">
                                <span className="icon-[mingcute--phone-fill] text-xl text-sky-950"></span>
                                <input
                                    type="text"
                                    placeholder="(55) 1234-5678"
                                    className="w-full bg-transparent outline-none text-sky-950 text-lg font-semibold placeholder:text-sky-950/30"
                                    value={telefonoLocal}
                                    onChange={(e) => setTelefonoLocal(e.target.value)}
                                />
                            </InputContainer>
                        </LabeledInput>
                        <LabeledInput label="Telefono Celular:" className="flex-1 self-stretch">
                            <InputContainer className="px-[4%] py-[0.5%]">
                                <span className="icon-[mingcute--phone-fill] text-xl text-sky-950"></span>
                                <input
                                    type="text"
                                    placeholder="(55) 1234-5678"
                                    className="w-full bg-transparent outline-none text-sky-950 text-lg font-semibold placeholder:text-sky-950/30"
                                    value={telefonoCelular}
                                    onChange={(e) => setTelefonoCelular(e.target.value)}
                                />
                            </InputContainer>
                        </LabeledInput>
                    </div>

                    {/* Contraseña */}
                    <div className="self-stretch inline-flex justify-center items-center gap-8">
                        <LabeledInput label="Contraseña:" className="flex-1 self-stretch">
                            <InputContainer className="px-[4%] py-[0.5%]">
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
                        <LabeledInput label="Confirmar Contraseña:" className="flex-1 self-stretch">
                            <InputContainer className="px-[4%] py-[0.5%]">
                                <div className="flex justify-start items-center gap-2 w-full">
                                    <span className="icon-[uil--lock] text-2xl text-sky-950"></span>
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••••••••••••"
                                        className="w-full bg-transparent outline-none text-sky-950 text-xl font-semibold placeholder:text-sky-950/30"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onMouseDown={() => setShowConfirmPassword(true)}
                                    onMouseUp={() => setShowConfirmPassword(false)}
                                    onMouseLeave={() => setShowConfirmPassword(false)}
                                    onTouchStart={() => setShowConfirmPassword(true)}
                                    onTouchEnd={() => setShowConfirmPassword(false)}
                                    className="focus:outline-none flex items-center justify-center cursor-pointer"
                                >
                                    <span className={`text-2xl text-sky-950 ${showConfirmPassword ? "icon-[uil--eye]" : "icon-[uil--eye-slash]"}`}></span>
                                </button>
                            </InputContainer>
                        </LabeledInput>
                    </div>

                    <div className="self-stretch pt-[2%] flex flex-col justify-start items-center gap-1">
                        <Link
                            href={isValid ? "/dashboard" : "#"}
                            className={`self-stretch py-[1%] rounded-2xl inline-flex justify-center items-center gap-2.5 transition-colors duration-300 ${isValid ? "bg-[#0A233C] hover:bg-[#0A233C]/90 cursor-pointer" : "bg-gray-400 cursor-not-allowed pointer-events-none"}`}
                            aria-disabled={!isValid}
                        >
                            <div className="justify-start text-neutral-50 text-xl font-semibold">Registrarse</div>
                        </Link>
                        <div className="self-stretch text-center justify-start">
                            <span className="text-sky-950 text-base font-semibold">¿Ya tienes una cuenta? </span>
                            <Link href="/auth/login" className="text-[#3E7DBB] text-base font-semibold underline hover:text-[#3E7DBB]/80 transition-colors">
                                Iniciar Sesión
                            </Link>
                        </div>
                    </div>
                </div>
                <img src="/logo.svg" className="h-[35%]" />
            </div >
        </div >
    );
}