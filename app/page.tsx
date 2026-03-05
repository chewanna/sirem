import React from "react";
import { prisma } from "@/lib/prisma";
import { Users, Activity, Heart, ShieldCheck, Clock, FileText, Medal, Crosshair } from "lucide-react";

// Forzar renderizado dinámico para que los datos siempre estén frescos
export const dynamic = "force-dynamic";

export default async function Page() {
  // Realizar todas las consultas a la base de datos en paralelo
  const [
    totalPersonal,
    totalMovimientos,
    totalFamiliares,
    totalUsuarios,
    ultimosMovimientos,
    armasConteo,
    gradosConteo
  ] = await Promise.all([
    prisma.personalMilitar.count(),
    prisma.movimiento.count(),
    prisma.familiar.count(),
    prisma.usuario.count(),
    prisma.movimiento.findMany({
      take: 5,
      orderBy: { fecha_mov: 'desc' },
      include: {
        personal: {
          select: { nombre: true, apellido_paterno: true, apellido_materno: true, matricula: true }
        }
      }
    }),
    // Traer todos los servicios de armas y contar cuántos miliares tienen asignados
    prisma.catArmaServicio.findMany({
      select: {
        nombre_servicio: true,
        _count: { select: { personal: true } }
      }
    }),
    // Traer todos los grados y contar cuántos militares los tienen
    prisma.catGrado.findMany({
      select: {
        nombre_grado: true,
        abreviatura: true,
        _count: { select: { personal: true } }
      }
    })
  ]);

  // Limpiar y ordenar de mayor a menor utilizando JavaScript
  const armasFiltradasYOrdenadas = armasConteo
    .filter(a => a._count.personal > 0)
    .sort((a, b) => b._count.personal - a._count.personal);

  const gradosFiltradosYOrdenados = gradosConteo
    .filter(g => g._count.personal > 0)
    .sort((a, b) => b._count.personal - a._count.personal);

  const stats = [
    { label: "Total de Personal", value: totalPersonal.toLocaleString(), icon: Users, color: "bg-blue-500", lightColor: "bg-blue-100", textColor: "text-blue-600" },
    { label: "Registros de Movimientos", value: totalMovimientos.toLocaleString(), icon: Activity, color: "bg-indigo-500", lightColor: "bg-indigo-100", textColor: "text-indigo-600" },
    { label: "Familiares Registrados", value: totalFamiliares.toLocaleString(), icon: Heart, color: "bg-rose-500", lightColor: "bg-rose-100", textColor: "text-rose-600" },
    { label: "Usuarios del Sistema", value: totalUsuarios.toLocaleString(), icon: ShieldCheck, color: "bg-teal-500", lightColor: "bg-teal-100", textColor: "text-teal-600" }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans">

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
        <p className="text-slate-500 text-lg">Resumen general del Sistema de Movimientos</p>
      </div>

      {/* Grid de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.lightColor} ${stat.textColor}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Fila del medio: Gráficos/Listas de Armas y Grados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Panel de Armas / Servicios */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Crosshair size={20} /></div>
              <h2 className="text-lg font-semibold text-slate-800">Personal por Arma / Servicio</h2>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 border border-slate-200 rounded-full shadow-sm">
              {armasFiltradasYOrdenadas.length} Categorías
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-5">
            {armasFiltradasYOrdenadas.length > 0 ? (
              armasFiltradasYOrdenadas.map((arma, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex justify-between items-end text-sm">
                    <span className="font-medium text-slate-700">{arma.nombre_servicio}</span>
                    <span className="font-bold text-slate-900">{arma._count.personal}</span>
                  </div>
                  {/* Barra de progreso visual */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${Math.max(2, (arma._count.personal / totalPersonal) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 mt-10">No hay datos clasificados en armas y servicios.</p>
            )}
          </div>
        </div>

        {/* Panel de Grados */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[400px]">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><Medal size={20} /></div>
              <h2 className="text-lg font-semibold text-slate-800">Personal por Grado</h2>
            </div>
            <span className="text-sm font-medium text-slate-500 bg-white px-3 py-1 border border-slate-200 rounded-full shadow-sm">
              {gradosFiltradosYOrdenados.length} Grados
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-0">
            <ul className="divide-y divide-slate-100">
              {gradosFiltradosYOrdenados.length > 0 ? (
                gradosFiltradosYOrdenados.map((grado, index) => (
                  <li key={index} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                        {grado.abreviatura || grado.nombre_grado.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-700">{grado.nombre_grado}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                        {grado._count.personal}
                      </span>
                    </div>
                  </li>
                ))
              ) : (
                <li className="px-6 py-12 text-center text-slate-500">No hay datos clasificados en grados.</li>
              )}
            </ul>
          </div>
        </div>

      </div>

      {/* Renglón Inferior: Tabla de últimos movimientos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-800">Últimos Movimientos Registrados</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-medium">Personal</th>
                <th className="px-6 py-4 font-medium">Matrícula</th>
                <th className="px-6 py-4 font-medium">Tipo de Movimiento</th>
                <th className="px-6 py-4 font-medium">Unidad Destino</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ultimosMovimientos.length > 0 ? (
                ultimosMovimientos.map((mov) => (
                  <tr key={mov.id_movimiento} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {mov.personal.nombre} {mov.personal.apellido_paterno} {mov.personal.apellido_materno || ''}
                      </div>
                      <div className="text-xs text-slate-500">{mov.grado}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {mov.personal.matricula}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                        <span className="text-sm text-slate-700 font-medium">{mov.tipo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{mov.unidad}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(mov.fecha_mov).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-300" />
                      <p>No hay movimientos registrados recientemente.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}