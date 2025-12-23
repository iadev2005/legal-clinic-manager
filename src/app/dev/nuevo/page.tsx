import { getEstados } from '@/actions/solicitantes';
import SolicitanteForm from './form';

export default async function NuevoSolicitantePage() {
    const estadosResult = await getEstados();

    if (!estadosResult.success) {
        return (
            <div className="min-h-screen p-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-700">{estadosResult.error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Nuevo Solicitante
                </h1>
                <SolicitanteForm estados={estadosResult.data || []} />
            </div>
        </div>
    );
}
