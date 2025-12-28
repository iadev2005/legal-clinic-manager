"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/shadcn/label";
import FilterSelect from "./filter-select";
import {
    getEstados,
    getMunicipiosByEstado,
    getParroquiasByMunicipio,
} from "@/actions/solicitantes";

interface LocationCascadeSelectProps {
    value?: number; // id_parroquia
    onChange: (idParroquia: number | undefined) => void;
    error?: string;
    required?: boolean;
}

interface Estado {
    id_estado: number;
    nombre_estado: string;
}

interface Municipio {
    id_municipio: number;
    nombre_municipio: string;
}

interface Parroquia {
    id_parroquia: number;
    nombre_parroquia: string;
}

export default function LocationCascadeSelect({
    value,
    onChange,
    error,
    required = false,
}: LocationCascadeSelectProps) {
    const [estados, setEstados] = useState<Estado[]>([]);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);

    const [selectedEstado, setSelectedEstado] = useState<string>("");
    const [selectedMunicipio, setSelectedMunicipio] = useState<string>("");
    const [selectedParroquia, setSelectedParroquia] = useState<string>("");

    const [loading, setLoading] = useState(false);

    // Cargar estados al montar
    useEffect(() => {
        loadEstados();
    }, []);

    // Si hay un valor inicial, cargar la cascada completa
    useEffect(() => {
        if (value && estados.length > 0) {
            loadInitialValue(value);
        }
    }, [value, estados]);

    const loadEstados = async () => {
        setLoading(true);
        const result = await getEstados();
        if (result.success && result.data) {
            setEstados(result.data);
        }
        setLoading(false);
    };

    const loadInitialValue = async (idParroquia: number) => {
        // Aquí deberías hacer una query para obtener el estado y municipio de la parroquia
        // Por ahora, simplemente establecemos el valor de la parroquia
        setSelectedParroquia(idParroquia.toString());
    };

    const handleEstadoChange = async (estadoId: string) => {
        setSelectedEstado(estadoId);
        setSelectedMunicipio("");
        setSelectedParroquia("");
        setMunicipios([]);
        setParroquias([]);
        onChange(undefined);

        if (estadoId) {
            setLoading(true);
            const result = await getMunicipiosByEstado(parseInt(estadoId));
            if (result.success && result.data) {
                setMunicipios(result.data);
            }
            setLoading(false);
        }
    };

    const handleMunicipioChange = async (municipioId: string) => {
        setSelectedMunicipio(municipioId);
        setSelectedParroquia("");
        setParroquias([]);
        onChange(undefined);

        if (municipioId) {
            setLoading(true);
            const result = await getParroquiasByMunicipio(parseInt(municipioId));
            if (result.success && result.data) {
                setParroquias(result.data);
            }
            setLoading(false);
        }
    };

    const handleParroquiaChange = (parroquiaId: string) => {
        setSelectedParroquia(parroquiaId);
        onChange(parroquiaId ? parseInt(parroquiaId) : undefined);
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="estado" className="text-sky-950 font-semibold">
                    Estado {required && <span className="text-red-500">*</span>}
                </Label>
                <FilterSelect
                    placeholder="Seleccione un estado"
                    value={selectedEstado}
                    onChange={handleEstadoChange}
                    options={estados.map((e) => ({
                        value: e.id_estado.toString(),
                        label: e.nombre_estado,
                    }))}
                    disabled={loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="municipio" className="text-sky-950 font-semibold">
                    Municipio {required && <span className="text-red-500">*</span>}
                </Label>
                <FilterSelect
                    placeholder={
                        selectedEstado
                            ? "Seleccione un municipio"
                            : "Primero seleccione un estado"
                    }
                    value={selectedMunicipio}
                    onChange={handleMunicipioChange}
                    options={municipios.map((m) => ({
                        value: m.id_municipio.toString(),
                        label: m.nombre_municipio,
                    }))}
                    disabled={!selectedEstado || loading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="parroquia" className="text-sky-950 font-semibold">
                    Parroquia {required && <span className="text-red-500">*</span>}
                </Label>
                <FilterSelect
                    placeholder={
                        selectedMunicipio
                            ? "Seleccione una parroquia"
                            : "Primero seleccione un municipio"
                    }
                    value={selectedParroquia}
                    onChange={handleParroquiaChange}
                    options={parroquias.map((p) => ({
                        value: p.id_parroquia.toString(),
                        label: p.nombre_parroquia,
                    }))}
                    disabled={!selectedMunicipio || loading}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
        </div>
    );
}
