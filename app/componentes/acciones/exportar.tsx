'use client';
import React, { useState } from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';

interface ExportarButtonsProps {
    personal: { id_personal_militar: number }[];
}

export const ExportarCaratula: React.FC<ExportarButtonsProps> = ({ personal }) => {
    const [cargando, setCargando] = useState<'imprimir' | 'excel' | 'word' | null>(null);

    const fetchData = async () => {
        const ids = personal.map(p => p.id_personal_militar);
        const res = await fetch('/api/personal/exportar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids })
        });
        if (!res.ok) throw new Error('Error fetching data');
        const data = await res.json();

        // Ordenar los datos
        const sortedPersonal = data.personal.sort((a: any, b: any) => {
            return ids.indexOf(a.id_personal_militar) - ids.indexOf(b.id_personal_militar);
        });

        return { personal: sortedPersonal, userInfo: data.userInfo };
    };

    const getTimeDiff = (startDateStr: string | null, endDate?: Date) => {
        if (!startDateStr) return { years: '-', months: '-', days: '-' };
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

        return { years, months, days };
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

    const generateHTML = (data: any[], titleDate: string, userInfo: { nombre: string, mesa: string }) => {
        let html = `
        <style>
            .export-doc { font-family: Arial, sans-serif; font-size: 11px; color: #333; }
            .person-page { page-break-after: auto; margin-bottom: 20px; page-break-inside: avoid; }
            
            .header-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
            .header-table td { padding: 2px; }
            
            .card { border: 1px solid #000; width: 100%; margin-bottom: 5px; background: white; box-sizing: border-box; }
            
            .top-section-table { width: 100%; border-collapse: collapse; }
            .photo-col { width: 140px; text-align: center; padding: 10px 10px 0 10px; }
            .photo-col img { width: 110px; height: 140px; object-fit: cover; border: 1px solid #000; }
            
            .info-col { padding: 10px 10px 0 10px; }
            
            .dates-table { width: 100%; text-align: center; border-collapse: collapse; }
            .dates-table td, .dates-table th { padding: 6px 5px; }
            .dates-table th { color: #c00000; font-weight: bold; font-size: 11px; text-align: center; }
            
            .details-table { width: 100%; border-collapse: collapse; border-bottom: 1px solid #000; }
            .details-table td { padding: 10px; vertical-align: top; }
            
            .metrics-table { width: 100%; text-align: right; border-collapse: collapse; font-size: 11px; }
            .metrics-table th { color: #c00000; font-weight: bold; padding-bottom: 6px; text-align: right; }
            .metrics-table td { padding: 3px 4px; text-align: right; }
            .metrics-table .label { color: #c00000; font-weight: bold; text-align: right; padding-right: 10px; }
            
            .footer-idiomas { text-align: center; font-weight: bold; padding: 6px; font-size: 11px; border-bottom: 1px solid #000; }
            
            .red-label { color: #c00000; font-weight: bold; font-size: 11.5px; }
            .dark-val { color: #333; font-size: 11.5px; }
            
            .data-row { margin-bottom: 8px; border-bottom: 1px dotted #ccc; padding-bottom: 2px; }
            
            @media print {
                .person-page { page-break-inside: avoid; margin-bottom: 30px; }
                .card { border: 1px solid #000; }
                .top-section, .photo-col, .dates-table, .details-table, .footer-idiomas { border-color: #000; }
            }
        </style>
        <div class="export-doc">
        `;

        data.forEach(p => {
            const gradoStr = p.grado?.abreviatura || '';
            const armaStr = p.arma_servicio?.abreviatura || p.arma_servicio?.nombre_servicio || '';
            const nombreStr = `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}`.toUpperCase().trim();
            const photoSrc = p.foto_src || p.foto_b64;

            const edad = getTimeDiff(p.fecha_nacimiento);
            const tiempoSvs = getTimeDiff(p.fecha_ingreso);
            const tiempoGrado = getTimeDiff(p.fecha_grado);
            const antiSit = getTimeDiff(p.fecha_cargo);
            const antiDes = getTimeDiff(p.fecha_cargo);

            // Generar fecha formateada ej: 19/01/2026 07:37:05 p. m.
            const currDate = new Date();
            const dateStr = currDate.toLocaleDateString('es-ES', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            });
            const timeStr = currDate.toLocaleTimeString('es-ES', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }).toLowerCase();

            const typeColors: Record<string, string> = {
                'AZUL': '#0078D7', // Blue
                'AMARILLO': '#ffea00', // Yellow
                'ROJO': '#e3000f', // Red
                'MORADO': '#800080' // Purple
            };

            let conductHtml = '';
            if (p.conductas && p.conductas.length > 0) {
                // Get exactly the existing ones from the database, grouped or distinct if needed, 
                // but the current logic takes the first 5 records
                const uniqueTypes = new Set<string>();
                const uniqueConductas = p.conductas.filter((c: any) => {
                    if (uniqueTypes.has(c.tipo)) return false;
                    uniqueTypes.add(c.tipo);
                    return true;
                });

                let bubbles = uniqueConductas.slice(0, 5).map((c: any) => {
                    const color = typeColors[c.tipo] || '#eee';
                    return `<div style="display: inline-block; width: 18px; height: 18px; background: ${color}; border-radius: 50%; border: 1px solid #ccc; text-align: center; margin: 0 3px;">
                                <div style="display: inline-block; width: 6px; height: 2px; background: white; vertical-align: middle; margin-top: -8px;"></div>
                            </div>`;
                }).join('');
                conductHtml = `<div style="margin-top: 6px; text-align: center;">${bubbles}</div>`;
            } else {
                conductHtml = `<div style="margin-top: 6px; text-align: center;"></div>`;
            }

            html += `
            <div class="person-page">
                 <table class="header-table">
                    <tr>
                        <td style="padding: 2px; text-align: left; width: 33%; font-weight: bold; font-size: 11px; color: #000;">S-1 (R.H.) E.M.C.D.N.</td>
                        <td style="text-align: center; width: 34%; font-weight: bold; font-size: 14px; color: #000;">DATOS PERSONALES</td>
                        <td style="padding: 2px; text-align: right; width: 33%; color: #c00000; font-weight: bold; font-size: 11px;">EDAD LIMITE : ${getEdadLimite(p.fecha_nacimiento).toUpperCase()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 2px; color: #c00000; font-weight: bold; font-size: 11px;">MILITAR EN EL ACTIVO</td>
                        <td style="text-align: left; font-weight: normal; font-size: 10px; color: #000;" colspan="2">FUENTE: SISTEMA COMPUTARIZADO DE RECURSOS HUMANOS</td>
                    </tr>
                </table>
                <div class="card">
                    <table class="top-section-table">
                        <tr>
                            <td class="photo-col" style="width: 140px; text-align: center; padding: 10px 10px 0 10px; vertical-align: top;">
                                <div style="color: rgba(241, 33, 19, 1); font-weight: bold; margin-bottom: 4px; font-size: 11px;">244861/2026</div>
                                <div style="border: 1px solid #424141ff; display: inline-block; padding: 0;">
                                    <img width="110" height="140" style="border: 1px solid #ffffff; width: 110px; height: 140px; object-fit: cover; display: block;" src="${photoSrc}" alt="Foto" />
                                    <div style="font-weight: bold; margin-top: 4px; font-size: 12px; display: block;">(${p.matricula || '-'})</div>
                                    ${conductHtml}
                                </div>
                            </td>
                            <td class="info-col" style="padding: 10px 10px 0 10px; vertical-align: top;">
                                <div style="font-size: 14px; font-weight: normal; color: #333; margin-bottom: 4px;">${gradoStr} ${armaStr}</div>
                                <div style="font-size: 15px; font-weight: bold; margin-bottom: 16px; color: #000;">${nombreStr}</div>
                                
                                <div style="border: 1px solid #424141ff; padding: 8px;">
                                    <table style="width: 100%; margin-bottom: 8px; border-collapse: collapse; border: none;">
                                        <tr>
                                            <td style="text-align: left; padding: 0;"><span class="red-label">Situacion :</span> <span class="dark-val">${p.situacion || 'PLANTA'}</span></td>
                                            <td style="text-align: right; padding: 0;"><span class="red-label">Desde :</span> <span class="dark-val">${formatDate(p.fecha_cargo).toUpperCase()}</span></td>
                                        </tr>
                                    </table>
                                    <div style="margin-bottom: 8px;">
                                        <span class="red-label">Ubicación:</span> <span style="text-transform: uppercase;" class="dark-val">${p.organismo?.nombre_organismo || p.unidad || '-'}</span>
                                    </div>
                                </div>
                                <div style="margin-top: 4px;  padding: 8px;">
                                    <span class="red-label">Originario:</span> <span style="text-transform: uppercase;" class="dark-val">${p.lugar_nacimiento || '-'}, ${p.estado_nacimiento || '-'}</span>
                                </div>
                            </td>
                        </tr>
                    </table>
                    
                    <div style="padding: 0 15px; margin-top: 4px;">
                        <div style="border-top: 1px solid #000; border-bottom: 1px solid #000;">
                            <table class="dates-table">
                                <tr>
                                    <th>Fecha de Nacimiento</th>
                                    <th>Fecha de Alta</th>
                                    <th>Fecha de Ascenso</th>
                                    <th>Fecha de Destino</th>
                                </tr>
                                <tr>
                                    <td>${formatDate(p.fecha_nacimiento).toUpperCase()}</td>
                                    <td>${formatDate(p.fecha_ingreso).toUpperCase()}</td>
                                    <td>${formatDate(p.fecha_grado).toUpperCase()}</td>
                                    <td>${formatDate(p.fecha_cargo).toUpperCase()}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <table class="details-table">
                        <tr>
                            <td style="width: 50%; border-right: none;">
                                <div style="line-height: 2; font-size: 11.5px;">
                                    <div><span class="red-label">C.U.R.P.:</span> <span class="dark-val">${p.curp || 'Sin Información'}</span></div>
                                    <div><span class="red-label">Estatura:</span> <span class="dark-val">Sin Información</span></div>
                                    <div><span class="red-label">Estado Civil:</span> <span class="dark-val">${p.estado_civil || 'Sin Información'}</span></div>
                                    <div><span class="red-label">Cuenta Banco:</span></div>
                                    <div><span class="red-label">Peso:</span> <span class="dark-val">Sin Información</span></div>
                                    <div><span class="red-label">Tipo Sangre:</span> <span class="dark-val">Sin Información</span></div>
                                </div>
                            </td>
                            <td style="width: 50%;">
                                <table class="metrics-table">
                                    <tr>
                                        <th></th>
                                        <th style="width: 50px;">Años</th>
                                        <th style="width: 50px;">Meses</th>
                                        <th style="width: 50px;">Dias</th>
                                    </tr>
                                    <tr>
                                        <td class="label">Edad:</td>
                                        <td>${edad.years}</td>
                                        <td>${edad.months}</td>
                                        <td>${edad.days}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tiempo Svs.:</td>
                                        <td>${tiempoSvs.years}</td>
                                        <td>${tiempoSvs.months}</td>
                                        <td>${tiempoSvs.days}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Tiempo Grado:</td>
                                        <td>${tiempoGrado.years}</td>
                                        <td>${tiempoGrado.months}</td>
                                        <td>${tiempoGrado.days}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Antiguedad en la Situacion:</td>
                                        <td>${antiSit.years}</td>
                                        <td>${antiSit.months}</td>
                                        <td>${antiSit.days}</td>
                                    </tr>
                                    <tr>
                                        <td class="label">Antiguedad en el Destino:</td>
                                        <td>${antiDes.years}</td>
                                        <td>${antiDes.months}</td>
                                        <td>${antiDes.days}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    
                    <div class="footer-idiomas">
                        No cuenta con registro de Idiomas
                    </div>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; font-size: 9px; color: #c00000; font-weight: bold; margin-top: 4px;">
                    <tr>
                        <td style="width: 33%; text-align: left; vertical-align: top;">${dateStr} ${timeStr}</td>
                        <td style="width: 34%; text-align: center; vertical-align: top;">${userInfo.nombre.toUpperCase()}<br/><span style="color:#c00000; font-weight:normal;">Sistema de Movimientos</span></td>
                        <td style="width: 33%; text-align: right; vertical-align: top;">${userInfo.mesa.toUpperCase()}</td>
                    </tr>
                </table>
            </div>
            `;
        });

        html += `
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
        if (personal.length === 0) return;
        setCargando('imprimir');
        try {
            const rawData = await fetchData();
            const data = await processDataWithPhotos(rawData.personal);
            const html = generateHTML(data, getTodayUpper(), rawData.userInfo);

            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Imprimir</title>
                            <style>
                                @media print {
                                    body { -webkit-print-color-adjust: exact; margin: 0; padding: 20px; }
                                    .person-page { page-break-inside: avoid; margin-bottom: 20px; }
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
        if (personal.length === 0) return;
        setCargando('excel');
        try {
            const rawData = await fetchData();
            const data = await processDataWithPhotos(rawData.personal, true);
            const html = generateHTML(data, getTodayUpper(), rawData.userInfo);
            const blob = new Blob(['\uFEFF', html], { type: 'application/vnd.ms-excel' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `caratula_${new Date().toISOString().slice(0, 10)}.xls`;
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
        if (personal.length === 0) return;
        setCargando('word');
        try {
            const rawData = await fetchData();
            const data = await processDataWithPhotos(rawData.personal);
            const html = generateHTML(data, getTodayUpper(), rawData.userInfo);
            const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Doc</title></head><body>`;
            const postHtml = `</body></html>`;
            const blob = new Blob(['\uFEFF', preHtml + html + postHtml], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `caratula_${new Date().toISOString().slice(0, 10)}.doc`;
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

    const isDisabled = personal.length === 0 || cargando !== null;

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
                IMPRIMIR
            </button>
            <button
                onClick={handleExcel}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-[var(--primary-foreground)] text-black border border-[var(--border)] rounded-md text-xs font-bold hover:bg-green-50 hover:border-green-400 hover:text-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Exportar a Excel"
            >
                {cargando === 'excel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-green-600" />}
                EXCEL
            </button>
            <button
                onClick={handleWord}
                disabled={isDisabled}
                className="flex items-center gap-1.5 px-5 py-1.5 bg-[var(--primary-foreground)] text-black border border-[var(--border)] rounded-md text-xs font-bold hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Exportar a Word"
            >
                {cargando === 'word' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-blue-600" />}
                WORD
            </button>
        </>
    );
};
