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

    // Asegurar que el widget de Cloudinary tenga z-index alto y deshabilitar overlay del Dialog
    useEffect(() => {
        if (!isClient) return;

        const adjustCloudinaryZIndex = () => {
            // Buscar todos los posibles elementos del widget de Cloudinary
            const selectors = [
                '#uw_modal',
                '.cloudinary-uw-modal',
                '[data-cloudinary-uw-modal]',
                'iframe[src*="cloudinary"]',
                'div[id*="cloudinary"]',
                'div[class*="cloudinary-uw"]'
            ];

            let widgetFound = false;
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el) => {
                    const htmlEl = el as HTMLElement;
                    htmlEl.style.zIndex = '9999';
                    htmlEl.style.pointerEvents = 'auto';
                    widgetFound = true;
                });
            });

            // Ajustar backdrop
            const backdropSelectors = [
                '#uw_modal_backdrop',
                '.cloudinary-uw-modal-backdrop',
                '[data-cloudinary-uw-backdrop]'
            ];

            backdropSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach((el) => {
                    (el as HTMLElement).style.zIndex = '9998';
                });
            });

            // Si el widget está abierto, deshabilitar pointer-events en el overlay del Dialog
            if (widgetFound) {
                // Buscar el overlay del Dialog de Radix UI
                const dialogOverlays = document.querySelectorAll('[data-radix-dialog-overlay]');
                dialogOverlays.forEach((overlay) => {
                    (overlay as HTMLElement).style.pointerEvents = 'none';
                });
            } else {
                // Si el widget está cerrado, rehabilitar pointer-events
                const dialogOverlays = document.querySelectorAll('[data-radix-dialog-overlay]');
                dialogOverlays.forEach((overlay) => {
                    (overlay as HTMLElement).style.pointerEvents = 'auto';
                });
            }
        };

        // Observar cambios en el DOM para detectar cuando se crea el widget
        const observer = new MutationObserver(() => {
            adjustCloudinaryZIndex();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Ajustar inmediatamente
        adjustCloudinaryZIndex();

        // Ajustar periódicamente como fallback
        const interval = setInterval(adjustCloudinaryZIndex, 200);

        return () => {
            observer.disconnect();
            clearInterval(interval);
            // Rehabilitar pointer-events al desmontar
            const dialogOverlays = document.querySelectorAll('[data-radix-dialog-overlay]');
            dialogOverlays.forEach((overlay) => {
                (overlay as HTMLElement).style.pointerEvents = 'auto';
            });
        };
    }, [isClient]);

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
                    styles: {
                        palette: {
                            window: "#FFFFFF",
                            windowBorder: "#90A0B3",
                            tabIcon: "#0078FF",
                            menuIcons: "#5A616A",
                            textDark: "#000000",
                            textLight: "#FFFFFF",
                            link: "#0078FF",
                            action: "#FF620C",
                            inactiveTabIcon: "#0E2F5A",
                            error: "#F44235",
                            inProgress: "#0078FF",
                            complete: "#20B832",
                            sourceBg: "#E4EBF1"
                        },
                        fonts: {
                            default: null,
                            "'Poppins', sans-serif": {
                                url: "https://fonts.googleapis.com/css?family=Poppins",
                                active: true
                            }
                        }
                    },
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
                onOpen={() => {
                    // Asegurar que el widget tenga z-index alto cuando se abre y deshabilitar overlay del Dialog
                    setTimeout(() => {
                        const modal = document.querySelector('#uw_modal, .cloudinary-uw-modal, [data-cloudinary-uw-modal]');
                        const backdrop = document.querySelector('#uw_modal_backdrop, .cloudinary-uw-modal-backdrop, [data-cloudinary-uw-backdrop]');
                        if (modal) {
                            (modal as HTMLElement).style.zIndex = '9999';
                            (modal as HTMLElement).style.pointerEvents = 'auto';
                        }
                        if (backdrop) {
                            (backdrop as HTMLElement).style.zIndex = '9998';
                            (backdrop as HTMLElement).style.pointerEvents = 'auto';
                        }
                        
                        // Agregar clase al body para deshabilitar pointer-events en el overlay del Dialog
                        document.body.classList.add('dialog-overlay-cloudinary-open');
                        
                        // También deshabilitar directamente por si acaso
                        const dialogOverlays = document.querySelectorAll('[data-radix-dialog-overlay]');
                        dialogOverlays.forEach((overlay) => {
                            (overlay as HTMLElement).style.pointerEvents = 'none';
                        });
                    }, 100);
                }}
                onClose={() => {
                    // Rehabilitar pointer-events cuando se cierra el widget
                    setTimeout(() => {
                        document.body.classList.remove('dialog-overlay-cloudinary-open');
                        const dialogOverlays = document.querySelectorAll('[data-radix-dialog-overlay]');
                        dialogOverlays.forEach((overlay) => {
                            (overlay as HTMLElement).style.pointerEvents = 'auto';
                        });
                    }, 100);
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
