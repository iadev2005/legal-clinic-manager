import { cn } from "@/lib/utils";

interface TaskCardProps {
    title: string;
    caseNumber: string;
    dueDate: Date;
}

export default function TaskCard({ title, caseNumber, dueDate }: TaskCardProps) {
    const formatDueDate = (date: Date) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Hoy";
        if (diffDays === 1) return "Mañana";

        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
        if (date.getFullYear() !== now.getFullYear()) {
            options.year = 'numeric';
        }

        return new Intl.DateTimeFormat('es-ES', options).format(date);
    };

    const getPriority = (date: Date): "Alta" | "Media" | "Baja" => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3) return "Alta";
        if (diffDays <= 7) return "Media";
        return "Baja";
    };

    const priority = getPriority(dueDate);

    const priorityStyles = {
        Alta: "bg-red-100 text-red-500",
        Media: "bg-[#FEF9C3] text-[#CA8A04]", // Yellow-100 equivalent but specific
        Baja: "bg-[#DBEAFE] text-[#2563EB]", // Blue-100 equivalent but specific
    };

    return (
        <div className="self-stretch p-4 bg-neutral-50 rounded-2xl shadow-[0px_0px_8.899999618530273px_0px_rgba(0,0,0,0.25)] inline-flex justify-between items-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-default border border-transparent hover:border-gray-100">
            <div className="flex-1 inline-flex flex-col justify-start items-start">
                <div className="self-stretch justify-start text-sky-950 text-3xl font-semibold">{title}</div>
                <div className="self-stretch justify-start text-sky-950 text-xl font-semibold opacity-80">Caso #{caseNumber} - Vencimiento: {formatDueDate(dueDate)}</div>
            </div>
            <div className={cn("px-6 py-2 rounded-2xl inline-flex justify-center items-center gap-2.5 min-w-[100px]", priorityStyles[priority])}>
                <div className="text-right justify-start text-xl font-extrabold">{priority}</div>
            </div>
        </div>
    );
}
