"use client";

import { useActionState, useState } from "react";
import CloudinaryUploadButton from "@/components/ui/cloudinary-upload-button";
import PrimaryButton from "@/components/ui/primary-button";
import { CldImage } from "next-cloudinary";
import { crearSoporteLegal } from "@/actions/soportes";

const initialState = {
    success: false,
    message: '',
};

export default function UploadTestPage() {
    const [state, formAction, isPending] = useActionState(crearSoporteLegal, initialState);
    const [uploadedUrl, setUploadedUrl] = useState<string>("");

    return (
        <div className="p-10 space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-[#003366]">Registro de Soporte Legal</h1>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <form action={formAction} className="space-y-6">

                    {/* Input Oculto para la URL */}
                    <input type="hidden" name="documento_url" value={uploadedUrl} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nro. de Caso (ID)</label>
                        <input
                            type="number"
                            name="nro_caso"
                            placeholder="Ej. 1"
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                        <p className="text-xs text-gray-500 mt-1">Debe ser un ID de 'Casos' existente</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <input
                            type="text"
                            name="descripcion"
                            placeholder="Ej. Acta de Matrimonio"
                            required
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
                        <textarea
                            name="observacion"
                            placeholder="Opcional..."
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
                        />
                    </div>

                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Documento Digital</label>

                        {!uploadedUrl ? (
                            <CloudinaryUploadButton
                                onUploadSuccess={(url) => setUploadedUrl(url)}
                                label="Subir Archivo a Cloudinary"
                            />
                        ) : (
                            <div className="bg-green-50 p-3 rounded-lg flex items-center justify-between border border-green-200">
                                <span className="text-sm text-green-800 font-medium truncate w-64">{uploadedUrl}</span>
                                <button
                                    type="button"
                                    onClick={() => setUploadedUrl("")}
                                    className="text-xs text-red-600 hover:underline"
                                >
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    <PrimaryButton
                        type="submit"
                        disabled={isPending || !uploadedUrl}
                        className="w-full"
                    >
                        {isPending ? 'Guardando...' : 'Registrar en Base de Datos'}
                    </PrimaryButton>

                    {state?.message && (
                        <div className={`p-4 rounded-lg text-sm ${state.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {state.message}
                        </div>
                    )}
                </form>
            </div>

            {/* Visualización Rápida si es imagen */}
            {uploadedUrl && (uploadedUrl.endsWith('.jpg') || uploadedUrl.endsWith('.png') || uploadedUrl.endsWith('.jpeg')) && (
                <div className="mt-8">
                    <h3 className="font-semibold text-gray-600 mb-3">Vista Previa:</h3>
                    <CldImage
                        src={uploadedUrl}
                        width="200"
                        height="200"
                        alt="Preview"
                        className="rounded-lg shadow-md border"
                    />
                </div>
            )}
        </div>
    );
}
