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
        if (!value || materias.length === 0) {
            // Si no hay valor o las materias no están cargadas, limpiar
            if (!value) {
                setSelectedMateria("");
                setSelectedCategoria("");
                setSelectedSubcategoria("");
                setSelectedAmbito("");
                setCategorias([]);
                setSubcategorias([]);
                setAmbitos([]);
                lastProcessedValue.current = "";
            }
            return;
        }

        // Crear una clave única para este valor
        const valueKey = `${value.id_materia}-${value.num_categoria}-${value.num_subcategoria}-${value.num_ambito_legal}`;

        // Solo procesar si el valor cambió
        if (valueKey === lastProcessedValue.current) {
            return;
        }

        const loadInitialData = async () => {
            // Establecer materia y cargar categorías
            if (value.id_materia) {
                setSelectedMateria(value.id_materia.toString());
                setLoading(true);
                const categoriasResult = await getCategoriasByMateria(value.id_materia);
                if (categoriasResult.success && categoriasResult.data) {
                    setCategorias(categoriasResult.data);

                    // Establecer categoría y cargar subcategorías
                    if (value.num_categoria) {
                        setSelectedCategoria(value.num_categoria.toString());
                        const subcategoriasResult = await getSubCategoriasByCategoria(
                            value.num_categoria,
                            value.id_materia
                        );
                        if (subcategoriasResult.success && subcategoriasResult.data) {
                            setSubcategorias(subcategoriasResult.data);

                            // Establecer subcategoría y cargar ámbitos
                            if (value.num_subcategoria) {
                                setSelectedSubcategoria(value.num_subcategoria.toString());
                                const ambitosResult = await getAmbitosBySubCategoria(
                                    value.num_subcategoria,
                                    value.num_categoria,
                                    value.id_materia
                                );
                                if (ambitosResult.success && ambitosResult.data) {
                                    setAmbitos(ambitosResult.data);

                                    // Establecer ámbito y notificar cambio completo
                                    if (value.num_ambito_legal) {
                                        setSelectedAmbito(value.num_ambito_legal.toString());
                                        onChange({
                                            id_materia: value.id_materia,
                                            num_categoria: value.num_categoria,
                                            num_subcategoria: value.num_subcategoria,
                                            num_ambito_legal: value.num_ambito_legal,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                setLoading(false);
                lastProcessedValue.current = valueKey;
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
