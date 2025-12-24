"use client";

import { CldUploadWidget } from "next-cloudinary";
import PrimaryButton from "./primary-button";
import { useState, useEffect } from "react";

interface CloudinaryUploadButtonProps {
    onUploadSuccess: (url: string) => void;
    label?: string;
}

export default function CloudinaryUploadButton({
    onUploadSuccess,
    label = "Subir Documento",
}: CloudinaryUploadButtonProps) {
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Evitar hidratación incorrecta
    useEffect(() => {
        setIsClient(true);
    }, []);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (isClient && (!cloudName || !uploadPreset)) {
        return (
            <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg border border-red-200">
                <strong>Error de Configuración:</strong>
                <p>Faltan variables de entorno de Cloudinary.</p>
                <p className="text-xs mt-1 font-mono">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {cloudName ? 'OK' : 'FALTA'}</p>
                <p className="text-xs font-mono">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: {uploadPreset ? 'OK' : 'FALTA'}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <CldUploadWidget
                uploadPreset={uploadPreset}
                onSuccess={(result: any) => {
                    if (result.info?.secure_url) {
                        onUploadSuccess(result.info.secure_url);
                    }
                }}
                onError={(err) => {
                    console.error("Cloudinary Error:", err);
                    setError("Error al subir el archivo (Revisa la consola)");
                }}
                options={{
                    cloudName: cloudName, // Pasamos explícitamente el cloudName
                    sources: ['local', 'url', 'camera', 'google_drive'],
                    language: 'es',
                    text: {
                        es: {
                            or: 'o',
                            back: 'Atrás',
                            advanced: 'Avanzado',
                            close: 'Cerrar',
                            no_results: 'Sin resultados',
                            search_placeholder: 'Buscar archivos',
                            about_credits: ' ',
                            menu: {
                                files: 'Mis Archivos',
                                web: 'Dirección Web',
                                camera: 'Cámara',
                                gdrive: 'Google Drive'
                            },
                            local: {
                                browse: 'Explorar',
                                dd_title_single: 'Arrastra y suelta un archivo aquí',
                            }
                        }
                    }
                }}
            >
                {({ open }) => {
                    return (
                        <PrimaryButton
                            type="button"
                            onClick={() => open()}
                            icon="icon-[solar--upload-minimalistic-bold]"
                        >
                            {label}
                        </PrimaryButton>
                    );
                }}
            </CldUploadWidget>
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
    );
}
