'use client';
import React, { useState } from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';

interface ExportarButtonsProps {
    listado: { id_personal_militar: number }[];
}

export const ExportarComision: React.FC<ExportarButtonsProps> = ({ listado }) => {
    const [cargando, setCargando] = useState<'imprimir' | 'excel' | 'word' | null>(null);
    const fetchData = async () => {
        const ids = listado.map(p => p.id_personal_militar);
        const res = await fetch('/api/personal/exportar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        if (!res.ok) throw new Error('Error fetching data');
        const data = await res.json();

        // Ordenar los datos
        const personal = data.personal || data;
        const sortedPersonal = personal.sort((a: any, b: any) => {
            return ids.indexOf(a.id_personal_militar) - ids.indexOf(b.id_personal_militar);
        });

        return { personal: sortedPersonal, userInfo: data.userInfo || {} };
    };

    const getTimeDiff = (startDateStr: string | null, endDate?: Date) => {
        if (!startDateStr) return "-";
        const start = new Date(startDateStr);
        const end = endDate || new Date();

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months -= 1;
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return `${years} Año(s) ${months} Mes(es) ${days} Día(s)`;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        const dLocal = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
        const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        return `${dLocal.getDate()} ${months[dLocal.getMonth()]} ${dLocal.getFullYear()}`;
    };

    const getEdadLimite = (fechaNacStr: string | null) => {
        if (!fechaNacStr) return "-";
        const d = new Date(fechaNacStr);
        const dLocal = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
        dLocal.setFullYear(dLocal.getFullYear() + 50);
        const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        return `${dLocal.getDate()} ${months[dLocal.getMonth()]} ${dLocal.getFullYear()}`;
    };

    const processDataWithPhotos = async (data: any[], forExcel: boolean = false) => {
        const extList = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.webp'];
        return Promise.all(data.map(async (p) => {
            let b64 = null;
            let realUrl = "https://via.placeholder.com/70x90.png?text=SIN+FOTO";

            if (p.foto_url) {
                const basePhotoSrc = p.foto_url;
                const absoluteUrl = basePhotoSrc.startsWith('http') || basePhotoSrc.startsWith('data:')
                    ? basePhotoSrc
                    : `${window.location.origin}${basePhotoSrc.startsWith('/') ? '' : '/'}${basePhotoSrc}`;
                realUrl = absoluteUrl;
                if (!forExcel) {
                    try {
                        const res = await fetch(absoluteUrl);
                        if (res.ok) {
                            const blob = await res.blob();
                            b64 = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onloadend = () => resolve(reader.result);
                                reader.readAsDataURL(blob);
                            });
                        }
                    } catch (e) {
                        console.error("Error fetching photo", absoluteUrl, e);
                    }
                }
            }

            if (!b64 && p.matricula) {
                const matriculaFoto = p.matricula.replace(/-/g, '');
                realUrl = `${window.location.origin}/fotos/${matriculaFoto}.jpg`;
                if (!forExcel) {
                    for (const ext of extList) {
                        const basePhotoSrc = `/fotos/${matriculaFoto}${ext}`;
                        const absoluteUrl = `${window.location.origin}${basePhotoSrc}`;
                        try {
                            const res = await fetch(absoluteUrl);
                            if (res.ok) {
                                const blob = await res.blob();
                                b64 = await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onloadend = () => resolve(reader.result);
                                    reader.readAsDataURL(blob);
                                });
                                break;
                            }
                        } catch (e) {
                            // ignore and continue
                        }
                    }
                }
            }

            if (!b64 && !forExcel) {
                b64 = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='90' viewBox='0 0 70 90'%3E%3Crect width='70' height='90' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='10' font-weight='bold' fill='%23999' text-anchor='middle' dy='.3em'%3ESIN FOTO%3C/text%3E%3C/svg%3E";
            }
            return { ...p, foto_src: forExcel ? realUrl : b64 };
        }));
    };

    const generateHTML = (data: any[], userInfo: any, titleDate: string) => {
        let html = `
        <style>
            .export-doc { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
            .export-header { width: 100%; text-align: center; margin-bottom: 20px; font-weight: bold; }
            .export-header table { width: 100%; border-collapse: collapse; }
            .export-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; border: 1px solid #000; }
            .export-table td, .export-table th { border: 1px solid #000; padding: 4px; vertical-align: top; }
            .inner-table td { border: none !important; padding: 2px 4px !important; white-space: nowrap; }
            .inner-table td[colspan="4"] { white-space: normal; }
            .row-title { background-color: #f0f0f0; font-weight: bold; }
            .photo-cell { width: 80px; text-align: center; }
            .photo-cell img { width: 70px; height: auto; border: 1px solid #ccc; }
            .data-section { display: flex; flex-direction: column; gap: 4px; }
            .line { margin: 2px 0; }
            .strong { font-weight: bold; }
        </style>
        <div class="export-doc">
            <div class="export-header">
                <table style="border:none;">
                    <tr>
                        <td style="text-align:left; border:none; width:33%;">${userInfo?.grupo || 'GRUPO DE PERSONAL'}</td>
                        <td style="text-align:center; border:none; width:33%;"></td>
                        <td style="text-align:right; border:none; width:33%;">S-1 (R.H.) E.M.C.D.N</td>
                    </tr>
                </table>
                <div style="margin-top:10px;">FUENTE: SISTEMA COMPUTARIZADO DE RECURSOS HUMANOS</div>
                <div>SITUACIÓN DEL PERSONAL AL ${titleDate}</div>
            </div>
            <table class="export-table">
        `;

        data.forEach(p => {
            const fullname = `${p.grado?.abreviatura || ''} ${p.arma_servicio?.abreviatura || p.arma_servicio?.nombre_servicio || ''} ${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}`.toUpperCase().trim();
            const photoSrc = p.foto_src || p.foto_b64;

            html += `
                <tr>
                    <td class="photo-cell" style="vertical-align: top; padding: 10px; width: 80px; text-align: center; border-bottom: 1px solid #000;">
                        <div style="font-size: 11px; margin-bottom: 5px;">${p.matricula || '-'}</div>
                        <img src="${photoSrc}" alt="Foto" width="70" height="90" style="width: 70px; height: 90px; object-fit: cover; border: 1px solid #000;" />
                    </td>
                    <td style="vertical-align: top; padding: 10px; border-bottom: 1px solid #000;">
                        <table class="inner-table" style="width: 100%; border: none; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 9.5px; line-height: 1.4;">
                            <tr>
                                <td colspan="3" style="font-weight: bold; text-transform: uppercase;">${fullname}</td>
                            </tr>
                            <tr>
                                <td><span class="strong">F. DES.:</span> ${formatDate(p.fecha_cargo)}</td>
                                <td><span class="strong">ANT. DES.:</span> ${getTimeDiff(p.fecha_cargo)}</td>
                            </tr>
                            <tr>
                                <td colspan="4">
                                    <span class="strong">SITUACIÓN:</span> 
                                    <span style="text-transform: uppercase;">${p.situacion || 'ENCUADRADO'} ${p.organismo?.nombre_organismo ? `, ${p.organismo.nombre_organismo}` : ''}</span>
                                </td>
                            </tr>

                            <tr>
                                <td colspan="4">
                                    <span class="strong">ORIGINARIO:</span> 
                                    <span style="text-transform: uppercase;">${p.lugar_nacimiento || '-'}, ${p.estado_nacimiento || '-'}</span>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            `;
        });

        html += `
            </table>
        </div>
        `;
        return html;
    };

    const getTodayUpper = () => {
        const d = new Date();
        const months = ["ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO", "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE"];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const handleImprimir = async () => {
        if (listado.length === 0) return;
        setCargando('imprimir');
        try {
            const resData = await fetchData();
            const data = await processDataWithPhotos(resData.personal);
            const html = generateHTML(data, resData.userInfo, getTodayUpper());

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Imprimir Listado</title>
                            <style>
                                @media print {
                                    body { -webkit-print-color-adjust: exact; margin: 0; padding: 15px; }
                                    tr { page-break-inside: avoid; }
                                }
                            </style>
                        </head>
                        <body>${html}</body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.focus();

                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 500);
            }
        } catch (error) {
            console.error(error);
            alert("Error al generar vista de impresión.");
        } finally {
            setCargando(null);
        }
    };

    const handleExcel = async () => {
        if (listado.length === 0) return;
        setCargando('excel');
        try {
            const resData = await fetchData();
            const data = await processDataWithPhotos(resData.personal, true);
            const html = generateHTML(data, resData.userInfo, getTodayUpper());
            const blob = new Blob(['\uFEFF', html], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Listado_Personal_${new Date().toISOString().slice(0, 10)}.xls`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("Error al generar Excel.");
        } finally {
            setCargando(null);
        }
    };

    const handleWord = async () => {
        if (listado.length === 0) return;
        setCargando('word');
        try {
            const resData = await fetchData();
            const data = await processDataWithPhotos(resData.personal);
            const html = generateHTML(data, resData.userInfo, getTodayUpper());
            const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Doc</title></head><body>`;
            const postHtml = `</body></html>`;
            const blob = new Blob(['\uFEFF', preHtml + html + postHtml], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Listado_Personal_${new Date().toISOString().slice(0, 10)}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("Error al generar Word.");
        } finally {
            setCargando(null);
        }
    };

    const isDisabled = listado.length === 0 || cargando !== null;

    return (
        <>
            {/* IMPRIMIR */}
            <button
                onClick={handleImprimir}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-[var(--primary-foreground)] text-black border border-[var(--border)] rounded-md text-xs font-bold hover:bg-gray-400 hover:border-gray-800 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Generar e Imprimir Formato"
            >
                {cargando === 'imprimir' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
                IMPRIMIR trámite de comisión
            </button>
            <button
                onClick={handleExcel}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-[var(--primary-foreground)] text-black border border-[var(--border)] rounded-md text-xs font-bold hover:bg-green-50 hover:border-green-400 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Exportar a Excel"
            >
                {cargando === 'excel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-green-600" />}
                EXCEL trámite de comisión
            </button>
            <button
                onClick={handleWord}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-[var(--primary-foreground)] text-black border border-[var(--border)] rounded-md text-xs font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Exportar a Word"
            >
                {cargando === 'word' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-blue-600" />}
                WORD trámite de comisión
            </button>
        </>
    );
};
