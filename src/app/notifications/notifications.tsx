"use client";
import { CustomTable, type Column } from "@/components/ui/custom-table";
import { useState, useEffect } from "react";
import AdministrationModal from "@/components/ui/administration-modal";
import DeleteConfirmationModal from "@/components/ui/delete-confirmation-modal";
import BulkUploadModal from "@/components/ui/bulk-upload-modal";

import { getParroquias, getEstados, getMunicipiosByEstado } from "@/actions/solicitantes";
import Pagination from "@/components/ui/pagination";


export default function Notifications() {
    // State management for all tabs
    return (
        <div className="w-full h-screen min-h-screen bg-neutral-50 flex flex-col justify-start items-center overflow-hidden">
            <div className="w-full h-full p-6 flex flex-col overflow-hidden">
                <div className="self-stretch flex flex-col justify-start items-start flex-none">
                    <h1 className="self-stretch justify-start text-sky-950 text-6xl font-semibold">Notificaciones</h1>
                    <h1 className="self-stretch justify-start text-[#325B84] text-2xl font-semibold">Tus notificaciones </h1>
                </div>

                <div className="self-stretch w-full p-7 mt-6 bg-neutral-50 rounded-[30px] shadow-[0px_0px_15.5px_0px_rgba(0,0,0,0.25)] flex flex-col justify-start items-start gap-4 flex-1 min-h-0 overflow-hidden">

                </div>
            </div>

        </div>
    );
}
