'use client';

import { getMunicipiosByEstado, getParroquiasByMunicipio, createSolicitante } from '@/actions/solicitantes';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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

export default function SolicitanteForm({ estados }: { estados: Estado[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estados para cascading
    const [selectedEstado, setSelectedEstado] = useState<number | null>(null);
    const [selectedMunicipio, setSelectedMunicipio] = useState<number | null>(null);
    const [municipios, setMunicipios] = useState<Municipio[]>([]);
    const [parroquias, setParroquias] = useState<Parroquia[]>([]);
    const [loadingMunicipios, setLoadingMunicipios] = useState(false);
    const [loadingParroquias, setLoadingParroquias] = useState(false);

    // Cargar municipios cuando se selecciona un estado
    useEffect(() => {
        if (selectedEstado) {
            setLoadingMunicipios(true);
            setMunicipios([]);
            setParroquias([]);
            setSelectedMunicipio(null);

            getMunicipiosByEstado(selectedEstado).then((result) => {
                if (result.success) {
                    setMunicipios(result.data || []);
                }
                setLoadingMunicipios(false);
            });
        } else {
            setMunicipios([]);
            setParroquias([]);
        }
    }, [selectedEstado]);

    // Cargar parroquias cuando se selecciona un municipio
    useEffect(() => {
        if (selectedMunicipio) {
            setLoadingParroquias(true);
            setParroquias([]);

            getParroquiasByMunicipio(selectedMunicipio).then((result) => {
                if (result.success) {
                    setParroquias(result.data || []);
                }
                setLoadingParroquias(false);
            });
        } else {
            setParroquias([]);
        }
    }, [selectedMunicipio]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const data = {
            cedula_solicitante: formData.get('cedula') as string,
            nombres: formData.get('nombres') as string,
            apellidos: formData.get('apellidos') as string,
            telefono_celular: formData.get('telefono') as string,
            correo_electronico: formData.get('correo') as string,
            sexo: formData.get('sexo') as 'M' | 'F',
            nacionalidad: formData.get('nacionalidad') as 'V' | 'E',
            fecha_nacimiento: formData.get('fecha_nacimiento') as string,
            id_parroquia: parseInt(formData.get('id_parroquia') as string),
        };

        const result = await createSolicitante(data);

        if (result.success) {
            router.push('/dev');
        } else {
            setError(result.error || 'Error desconocido');
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cédula */}
                <div>
                    <label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-2">
                        Cédula <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="cedula"
                        name="cedula"
                        required
                        placeholder="V12345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Nacionalidad */}
                <div>
                    <label htmlFor="nacionalidad" className="block text-sm font-medium text-gray-700 mb-2">
                        Nacionalidad <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="nacionalidad"
                        name="nacionalidad"
                        required
                        defaultValue="V"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="V">Venezolano</option>
                        <option value="E">Extranjero</option>
                    </select>
                </div>

                {/* Nombres */}
                <div>
                    <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombres <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="nombres"
                        name="nombres"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Apellidos */}
                <div>
                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="apellidos"
                        name="apellidos"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Sexo */}
                <div>
                    <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-2">
                        Sexo <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="sexo"
                        name="sexo"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                    </select>
                </div>

                {/* Fecha de Nacimiento */}
                <div>
                    <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha de Nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        id="fecha_nacimiento"
                        name="fecha_nacimiento"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Teléfono */}
                <div>
                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono Celular
                    </label>
                    <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        placeholder="0412-1234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Correo */}
                <div>
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-2">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="correo"
                        name="correo"
                        placeholder="ejemplo@correo.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Sección Geográfica con Cascading */}
            <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación Geográfica</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Estado */}
                    <div>
                        <label htmlFor="id_estado" className="block text-sm font-medium text-gray-700 mb-2">
                            Estado <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="id_estado"
                            value={selectedEstado || ''}
                            onChange={(e) => setSelectedEstado(e.target.value ? parseInt(e.target.value) : null)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Seleccionar estado...</option>
                            {estados.map((estado) => (
                                <option key={estado.id_estado} value={estado.id_estado}>
                                    {estado.nombre_estado}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Municipio */}
                    <div>
                        <label htmlFor="id_municipio" className="block text-sm font-medium text-gray-700 mb-2">
                            Municipio <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="id_municipio"
                            value={selectedMunicipio || ''}
                            onChange={(e) => setSelectedMunicipio(e.target.value ? parseInt(e.target.value) : null)}
                            required
                            disabled={!selectedEstado || loadingMunicipios}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {loadingMunicipios ? 'Cargando...' : 'Seleccionar municipio...'}
                            </option>
                            {municipios.map((municipio) => (
                                <option key={municipio.id_municipio} value={municipio.id_municipio}>
                                    {municipio.nombre_municipio}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Parroquia */}
                    <div>
                        <label htmlFor="id_parroquia" className="block text-sm font-medium text-gray-700 mb-2">
                            Parroquia <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="id_parroquia"
                            name="id_parroquia"
                            required
                            disabled={!selectedMunicipio || loadingParroquias}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">
                                {loadingParroquias ? 'Cargando...' : 'Seleccionar parroquia...'}
                            </option>
                            {parroquias.map((parroquia) => (
                                <option key={parroquia.id_parroquia} value={parroquia.id_parroquia}>
                                    {parroquia.nombre_parroquia}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Guardando...' : 'Guardar Solicitante'}
                </button>
                <button
                    type="button"
                    onClick={() => router.push('/dev')}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Cancelar
                </button>
            </div>
        </form>
    );
}
