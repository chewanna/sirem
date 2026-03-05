'use client'

import { useAppState } from "../componentes/acciones/estados";
import { useFiltrosBusqueda } from "../componentes/acciones/filtros";
import { Popover, PopoverTrigger, PopoverContent } from "../componentes/ui/popover";
import { ChevronDown } from "lucide-react"

const BusquedaRapida = () => {
    const { state: appState, actions: appActions } = useAppState();
    const { state, actions } = useFiltrosBusqueda();
    const { filtros, resultados } = state;
    const opciones1 = ["Gral. Div.", "Gral. Bgda.", "Gral. Ala", "Gral. Brig.", "Gral. Gpo.", "Cor.", "Tte. Cor.", "Mayor", "Cap. 1/o.", "Cap. 2/o.", "Tte.", "Sbtte.", "Sgto. 1/o.", "Sgto. 2/o.", "Cabo", "Sld.", "Cadete", "Alumno", "Rural 1/a.", "Rural 2/a.", "Rural 3/a.", "Rural 4/a.", "Rural", "Civil", "Sr. (a)"]
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        actions.setFiltros({ [field]: e.target.value });
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, field: string) => {
        actions.setFiltros({ [field]: e.target.value });
    };

    const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
        const current = (filtros as any)[field] as string[];
        const updated = checked
            ? [...current, value]
            : current.filter((v: string) => v !== value);
        actions.setFiltros({ [field]: updated });
    };

    return (
        <div>
            <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/*checkbox empleo */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase"> Empleo </label>
                            <Popover>
                                <PopoverTrigger asChild className="px-3 h-10 border border-[var(--border)] rounded-lg bg-[var(--surface)]">
                                    <button className="flex items-center justify-between w-full">
                                        <span className="text-xs font-semibold text-[var(--text-secondary)] truncate">{filtros.empleo.length > 0 ? filtros.empleo.join(", ") : "TODOS"}</span>
                                        <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-3 space-y-2 max-h-48 overflow-y-auto">
                                    {opciones1.map((opcion) => {
                                        const checked = filtros.empleo.includes(opcion)
                                        return (
                                            <div key={opcion}
                                                className="flex items-center gap-2 hover:bg-[var(--surface)] rounded p-1 transition-colors cursor-pointer"
                                                onClick={() => handleCheckboxChange("empleo", opcion, !checked)} >
                                                <span className={`h-4 w-4 flex items-center justify-center border rounded ${checked ? "bg-blue-600 text-white" : "bg-white"}`} > {checked ? "✓" : ""}</span>
                                                <span className="text-xs text-[var(--text-secondary)] select-none">{opcion}</span>
                                            </div>)
                                    })}
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Apellido Paterno</label>
                            <input
                                value={filtros.apellidoPaterno}
                                onChange={(e) => handleInputChange(e, 'apellidoPaterno')}
                                className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Apellido Materno</label>
                            <input
                                value={filtros.apellidoMaterno}
                                onChange={(e) => handleInputChange(e, 'apellidoMaterno')}
                                className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Nombre</label>
                            <input
                                value={filtros.nombre}
                                onChange={(e) => handleInputChange(e, 'nombre')}
                                className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Matrícula</label>
                            <input
                                value={filtros.matricula}
                                onChange={(e) => handleInputChange(e, 'matricula')}
                                className="w-full h-10 px-3 rounded-md border border-[var(--border)] bg-[var(--surface)] text-sm focus:ring-2 focus:ring-[var(--primary)] outline-none"
                            />
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}


export default BusquedaRapida

