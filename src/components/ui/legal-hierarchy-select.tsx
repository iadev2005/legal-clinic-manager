"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/shadcn/label";
import FilterSelect from "./filter-select";
import {
    getMaterias,
    getCategoriasByMateria,
    getSubCategoriasByCategoria,
    getAmbitosBySubCategoria,
} from "@/actions/casos";

interface LegalHierarchySelectProps {
    value?: {
        id_materia?: number;
        num_categoria?: number;
        num_subcategoria?: number;
        num_ambito_legal?: number;
    };
    onChange: (value: {
        id_materia: number;
        num_categoria: number;
        num_subcategoria: number;
        num_ambito_legal: number;
    } | undefined) => void;
    error?: string;
    required?: boolean;
}

interface Materia {
    id_materia: number;
    nombre_materia: string;
}

interface Categoria {
    num_categoria: number;
    id_materia: number;
    nombre_categoria: string;
}

interface SubCategoria {
    num_subcategoria: number;
    num_categoria: number;
    id_materia: number;
    nombre_subcategoria: string;
}

interface Ambito {
    num_ambito_legal: number;
    num_subcategoria: number;
    num_categoria: number;
    id_materia: number;
    nombre_ambito_legal: string;
}

export default function LegalHierarchySelect({
    value,
    onChange,
    error,
    required = false,
}: LegalHierarchySelectProps) {
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [subcategorias, setSubcategorias] = useState<SubCategoria[]>([]);
    const [ambitos, setAmbitos] = useState<Ambito[]>([]);

    const [selectedMateria, setSelectedMateria] = useState<string>("");
    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [selectedSubcategoria, setSelectedSubcategoria] = useState<string>("");
    const [selectedAmbito, setSelectedAmbito] = useState<string>("");

    const [loading, setLoading] = useState(false);
    const lastProcessedValue = useRef<string>("");

    // Cargar materias al montar
    useEffect(() => {
        loadMaterias();
    }, []);

    // Si hay un valor inicial, establecerlo y cargar datos dependientes
    useEffect(() => {
        // Solo proceder si las materias ya están cargadas
        if (materias.length === 0) return;

        if (!value) {
            // Si explícitamente no hay valor, limpiar
            setSelectedMateria("");
            setSelectedCategoria("");
            setSelectedSubcategoria("");
            setSelectedAmbito("");
            setCategorias([]);
            setSubcategorias([]);
            setAmbitos([]);
            lastProcessedValue.current = "";
            return;
        }

        // Si el valor está incompleto pero tenemos algo, no limpiar inmediatamente
        // para evitar parpadeos mientras el padre (CaseEditModal) carga los datos.
        if (value.id_materia == null) return;

        // Crear una clave única para este valor
        const valueKey = `${value.id_materia}-${value.num_categoria}-${value.num_subcategoria}-${value.num_ambito_legal}`;

        // Solo procesar si el valor cambió
        if (valueKey === lastProcessedValue.current) {
            return;
        }

        const loadInitialData = async () => {
            if (value.id_materia == null) return;

            // Marcar como procesado inmediatamente para evitar ejecuciones duplicadas
            lastProcessedValue.current = valueKey;
            setLoading(true);

            try {
                // Preparar promesas para carga paralela
                const promises: Promise<any>[] = [getCategoriasByMateria(value.id_materia)];

                if (value.num_categoria != null) {
                    promises.push(getSubCategoriasByCategoria(value.num_categoria, value.id_materia));
                }

                if (value.num_subcategoria != null && value.num_categoria != null) {
                    promises.push(getAmbitosBySubCategoria(value.num_subcategoria, value.num_categoria, value.id_materia));
                }

                // Ejecutar todas las cargas necesarias en paralelo
                const results = await Promise.all(promises);

                // Mapear resultados a estados
                if (results[0].success && results[0].data) {
                    setCategorias(results[0].data);
                    setSelectedMateria(value.id_materia.toString());
                }

                if (value.num_categoria != null && results[1]?.success && results[1]?.data) {
                    setSubcategorias(results[1].data);
                    setSelectedCategoria(value.num_categoria.toString());
                }

                if (value.num_subcategoria != null && results[2]?.success && results[2]?.data) {
                    setAmbitos(results[2].data);
                    setSelectedSubcategoria(value.num_subcategoria.toString());
                }

                if (value.num_ambito_legal != null) {
                    setSelectedAmbito(value.num_ambito_legal.toString());

                    // Solo notificar si tenemos el valor completo y es diferente al que recibimos
                    // (Aunque en la carga inicial usualmente es el mismo)
                    onChange({
                        id_materia: value.id_materia,
                        num_categoria: value.num_categoria,
                        num_subcategoria: value.num_subcategoria,
                        num_ambito_legal: value.num_ambito_legal,
                    });
                }
            } catch (error) {
                console.error("Error in loadInitialData:", error);
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [value, materias, onChange]);

    const loadMaterias = async () => {
        setLoading(true);
        const result = await getMaterias();
        if (result.success && result.data) {
            setMaterias(result.data);
        }
        setLoading(false);
    };

    const handleMateriaChange = async (materiaId: string) => {
        setSelectedMateria(materiaId);
        setSelectedCategoria("");
        setSelectedSubcategoria("");
        setSelectedAmbito("");
        setCategorias([]);
        setSubcategorias([]);
        setAmbitos([]);
        onChange(undefined);
        lastProcessedValue.current = ""; // Reset para permitir recarga si se vuelve a seleccionar

        if (materiaId) {
            setLoading(true);
            const result = await getCategoriasByMateria(parseInt(materiaId));
            if (result.success && result.data) {
                setCategorias(result.data);
            }
            setLoading(false);
        }
    };

    const handleCategoriaChange = async (categoriaId: string) => {
        setSelectedCategoria(categoriaId);
        setSelectedSubcategoria("");
        setSelectedAmbito("");
        setSubcategorias([]);
        setAmbitos([]);
        onChange(undefined);

        if (categoriaId && selectedMateria) {
            setLoading(true);
            const result = await getSubCategoriasByCategoria(
                parseInt(categoriaId),
                parseInt(selectedMateria)
            );
            if (result.success && result.data) {
                setSubcategorias(result.data);
            }
            setLoading(false);
        }
    };

    const handleSubcategoriaChange = async (subcategoriaId: string) => {
        setSelectedSubcategoria(subcategoriaId);
        setSelectedAmbito("");
        setAmbitos([]);
        onChange(undefined);

        if (subcategoriaId && selectedCategoria && selectedMateria) {
            setLoading(true);
            const result = await getAmbitosBySubCategoria(
                parseInt(subcategoriaId),
                parseInt(selectedCategoria),
                parseInt(selectedMateria)
            );
            if (result.success && result.data) {
                setAmbitos(result.data);
            }
            setLoading(false);
        }
    };

    const handleAmbitoChange = (ambitoId: string) => {
        setSelectedAmbito(ambitoId);

        if (ambitoId && selectedSubcategoria && selectedCategoria && selectedMateria) {
            onChange({
                id_materia: parseInt(selectedMateria),
                num_categoria: parseInt(selectedCategoria),
                num_subcategoria: parseInt(selectedSubcategoria),
                num_ambito_legal: parseInt(ambitoId),
            });
        } else {
            onChange(undefined);
        }
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="materia" className="text-sky-950 font-semibold">
                    Materia {required && <span className="text-red-500">*</span>}
                </Label>
                <FilterSelect
                    placeholder="Seleccione una materia"
                    value={selectedMateria}
                    onChange={handleMateriaChange}
                    options={materias.map((m) => ({
                        value: m.id_materia.toString(),
                        label: m.nombre_materia,
                    }))}
                    disabled={loading}
                />
            </div>

            <div className={`space-y-2 transition-opacity duration-300 ${!selectedMateria ? "opacity-50" : "opacity-100"}`}>
                <Label htmlFor="categoria" className="text-sky-950 font-semibold">
                    Categoría {required && <span className="text-red-500">*</span>}
                </Label>
                <FilterSelect
                    placeholder={
                        selectedMateria
                            ? "Seleccione una categoría"
                            : "Primero seleccione una materia"
                    }
                    value={selectedCategoria}
                    onChange={handleCategoriaChange}
                    options={categorias.map((c) => ({
                        value: c.num_categoria.toString(),
                        label: c.nombre_categoria,
                    }))}
                    disabled={!selectedMateria || loading}
                />
            </div>

            <div className={`space-y-2 transition-opacity duration-300 ${!selectedCategoria ? "opacity-50" : "opacity-100"}`}>
                <Label htmlFor="subcategoria" className="text-sky-950 font-semibold">
                    Subcategoría {required && <span className="text-red-500">*</span>}
                </Label>
                <FilterSelect
                    placeholder={
                        selectedCategoria
                            ? "Seleccione una subcategoría"
                            : "Primero seleccione una categoría"
                    }
                    value={selectedSubcategoria}
                    onChange={handleSubcategoriaChange}
                    options={subcategorias.map((s) => ({
                        value: s.num_subcategoria.toString(),
                        label: s.nombre_subcategoria,
                    }))}
                    disabled={!selectedCategoria || loading}
                />
            </div>

            <div className={`space-y-2 transition-opacity duration-300 ${!selectedSubcategoria ? "opacity-50" : "opacity-100"}`}>
                <Label htmlFor="ambito" className="text-sky-950 font-semibold">
                    Ámbito Legal {required && <span className="text-red-500">*</span>}
                </Label>
                <FilterSelect
                    placeholder={
                        selectedSubcategoria
                            ? "Seleccione un ámbito legal"
                            : "Primero seleccione una subcategoría"
                    }
                    value={selectedAmbito}
                    onChange={handleAmbitoChange}
                    options={ambitos.map((a) => ({
                        value: a.num_ambito_legal.toString(),
                        label: a.nombre_ambito_legal,
                    }))}
                    disabled={!selectedSubcategoria || loading}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
        </div>
    );
}
