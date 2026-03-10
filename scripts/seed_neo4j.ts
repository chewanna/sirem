import neo4j from 'neo4j-driver';
import * as bcrypt from 'bcryptjs';

// Conexión directa a Neo4j (sin depender de lib/neo4j para evitar problemas de resolución)
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'sirem_password';
const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

// ============================================================
//  DATOS DE REFERENCIA PARA GENERACIÓN
// ============================================================

const NOMBRES_MASCULINOS = [
    'ALEJANDRO', 'ANTONIO', 'ARTURO', 'BENITO', 'CARLOS', 'CESAR', 'DANIEL', 'DAVID',
    'EDUARDO', 'ENRIQUE', 'ERNESTO', 'FELIPE', 'FERNANDO', 'FRANCISCO', 'GABRIEL', 'GERARDO',
    'GILBERTO', 'GONZALO', 'GUSTAVO', 'HECTOR', 'HUGO', 'IGNACIO', 'ISMAEL', 'IVAN',
    'JAIME', 'JAVIER', 'JESUS', 'JOAQUIN', 'JORGE', 'JOSE', 'JUAN', 'JULIO',
    'LEONARDO', 'LORENZO', 'LUIS', 'MANUEL', 'MARCOS', 'MARIO', 'MARTIN', 'MIGUEL',
    'NICOLAS', 'OMAR', 'OSCAR', 'PABLO', 'PEDRO', 'RAFAEL', 'RAMON', 'RAUL',
    'RICARDO', 'ROBERTO', 'RODRIGO', 'RUBEN', 'SALVADOR', 'SANTIAGO', 'SERGIO', 'VICTOR',
    'ADRIAN', 'ALBERTO', 'ALFREDO', 'ANDRES', 'ANGEL', 'ARMANDO', 'BERNARDO', 'BRUNO',
    'CRISTIAN', 'DIEGO', 'EDGAR', 'EMILIO', 'ESTEBAN', 'FABIAN', 'FIDEL', 'FREDDY',
    'GUILLERMO', 'HERIBERTO', 'HORACIO', 'ISRAEL', 'JOEL', 'JONATHAN', 'JOSE LUIS', 'JOSE ANTONIO',
    'JOSE MANUEL', 'JOSE MARIA', 'JUAN CARLOS', 'JUAN PABLO', 'LEOPOLDO', 'MARCO ANTONIO', 'MAURICIO', 'MAXIMILIANO',
    'MOISES', 'NORBERTO', 'OCTAVIO', 'ORLANDO', 'PATRICIO', 'PORFIRIO', 'RAMIRO', 'RAUL EDUARDO',
    'ROMAN', 'SAMUEL', 'SAUL', 'SIMON', 'TEODORO', 'TOMAS', 'VALENTIN', 'VICENTE'
];

const NOMBRES_FEMENINOS = [
    'ADRIANA', 'ALEJANDRA', 'ALICIA', 'ANA', 'ANDREA', 'ANGELICA', 'BEATRIZ', 'BLANCA',
    'BRENDA', 'CARMEN', 'CAROLINA', 'CECILIA', 'CLAUDIA', 'CRISTINA', 'DANIELA', 'DIANA',
    'ELIZABETH', 'ELENA', 'ERIKA', 'ESPERANZA', 'ESTELA', 'EVA', 'FABIOLA', 'FERNANDA',
    'GABRIELA', 'GUADALUPE', 'IRMA', 'ISABEL', 'JESSICA', 'JOSEFINA', 'JUANA', 'KAREN',
    'LAURA', 'LETICIA', 'LILIA', 'LORENA', 'LUCIA', 'LUISA', 'MARGARITA', 'MARIA',
    'MARIBEL', 'MARISOL', 'MARTHA', 'MAYRA', 'MERCEDES', 'MONICA', 'NADIA', 'NANCY',
    'NORMA', 'OLGA', 'PAMELA', 'PATRICIA', 'PAULINA', 'RAQUEL', 'REBECA', 'REGINA',
    'ROCIO', 'ROSA', 'ROSARIO', 'SANDRA', 'SILVIA', 'SOFIA', 'SUSANA', 'TERESA',
    'VALENTINA', 'VANESSA', 'VERONICA', 'VICTORIA', 'XIMENA', 'YAZMIN', 'YOLANDA', 'ZULEMA'
];

const APELLIDOS = [
    'GARCIA', 'MARTINEZ', 'LOPEZ', 'HERNANDEZ', 'GONZALEZ', 'RODRIGUEZ', 'PEREZ', 'SANCHEZ',
    'RAMIREZ', 'TORRES', 'FLORES', 'RIVERA', 'GOMEZ', 'DIAZ', 'CRUZ', 'MORALES',
    'REYES', 'GUTIERREZ', 'ORTIZ', 'RAMOS', 'ROMERO', 'MENDOZA', 'CASTILLO', 'VARGAS',
    'JIMENEZ', 'HERRERA', 'AGUILAR', 'MEDINA', 'CASTRO', 'RUIZ', 'VELAZQUEZ', 'MUNOZ',
    'ALVAREZ', 'DELGADO', 'SALGADO', 'CONTRERAS', 'GUERRERO', 'SALAZAR', 'VEGA', 'DOMINGUEZ',
    'SANDOVAL', 'ROJAS', 'FUENTES', 'MEJIA', 'CABRERA', 'RIOS', 'LEON', 'NAVARRO',
    'CAMPOS', 'ESTRADA', 'LARA', 'AVILA', 'FIGUEROA', 'CERVANTES', 'SILVA', 'MORENO',
    'VAZQUEZ', 'CARDENAS', 'PACHECO', 'LUNA', 'ESPINOZA', 'ACOSTA', 'BAUTISTA', 'PENA',
    'MARQUEZ', 'JUAREZ', 'MIRANDA', 'OROZCO', 'IBARRA', 'CAMACHO', 'TREJO', 'SOTO',
    'VERA', 'PINEDA', 'MONTOYA', 'CORTEZ', 'ROSALES', 'GALLEGOS', 'ZAMORA', 'DURAN',
    'RANGEL', 'MALDONADO', 'OCHOA', 'VILLANUEVA', 'PADILLA', 'CISNEROS', 'BARRERA', 'NAVA',
    'BECERRA', 'AGUIRRE', 'VILLARREAL', 'BELTRAN', 'ARELLANO', 'PONCE', 'CORONADO', 'SOLIS',
    'BALDERAS', 'SERRANO', 'MAYA', 'TELLEZ'
];

const ESTADOS = [
    'CIUDAD DE MEXICO', 'ESTADO DE MEXICO', 'JALISCO', 'NUEVO LEON', 'PUEBLA',
    'GUANAJUATO', 'CHIHUAHUA', 'MICHOACAN', 'OAXACA', 'VERACRUZ',
    'GUERRERO', 'CHIAPAS', 'TAMAULIPAS', 'BAJA CALIFORNIA', 'SINALOA',
    'SONORA', 'TABASCO', 'SAN LUIS POTOSI', 'COAHUILA', 'HIDALGO',
    'QUERETARO', 'MORELOS', 'ZACATECAS', 'DURANGO', 'AGUASCALIENTES',
    'TLAXCALA', 'NAYARIT', 'COLIMA', 'CAMPECHE', 'QUINTANA ROO',
    'YUCATAN', 'BAJA CALIFORNIA SUR'
];

const CIUDADES: Record<string, string[]> = {
    'CIUDAD DE MEXICO': ['CDMX', 'AZCAPOTZALCO', 'COYOACAN', 'GUSTAVO A. MADERO', 'IZTAPALAPA', 'TLALPAN'],
    'ESTADO DE MEXICO': ['TOLUCA', 'ECATEPEC', 'NAUCALPAN', 'TLALNEPANTLA', 'NEZAHUALCOYOTL'],
    'JALISCO': ['GUADALAJARA', 'ZAPOPAN', 'TLAQUEPAQUE', 'TONALA', 'PUERTO VALLARTA'],
    'NUEVO LEON': ['MONTERREY', 'SAN PEDRO GARZA GARCIA', 'GUADALUPE', 'APODACA', 'SAN NICOLAS'],
    'PUEBLA': ['PUEBLA', 'TEHUACAN', 'ATLIXCO', 'SAN MARTIN TEXMELUCAN', 'CHOLULA'],
    'GUANAJUATO': ['LEON', 'IRAPUATO', 'CELAYA', 'SALAMANCA', 'GUANAJUATO'],
    'CHIHUAHUA': ['CHIHUAHUA', 'CIUDAD JUAREZ', 'DELICIAS', 'CUAUHTEMOC', 'PARRAL'],
    'MICHOACAN': ['MORELIA', 'URUAPAN', 'LAZARO CARDENAS', 'ZAMORA', 'APATZINGAN'],
    'OAXACA': ['OAXACA', 'JUCHITAN', 'SALINA CRUZ', 'HUATULCO', 'TUXTEPEC'],
    'VERACRUZ': ['VERACRUZ', 'XALAPA', 'COATZACOALCOS', 'CORDOBA', 'ORIZABA'],
    'GUERRERO': ['ACAPULCO', 'CHILPANCINGO', 'IGUALA', 'ZIHUATANEJO', 'TAXCO'],
    'CHIAPAS': ['TUXTLA GUTIERREZ', 'TAPACHULA', 'SAN CRISTOBAL', 'COMITAN', 'PALENQUE'],
    'TAMAULIPAS': ['TAMPICO', 'REYNOSA', 'MATAMOROS', 'CIUDAD VICTORIA', 'NUEVO LAREDO'],
    'BAJA CALIFORNIA': ['TIJUANA', 'MEXICALI', 'ENSENADA', 'TECATE', 'ROSARITO'],
    'SINALOA': ['CULIACAN', 'MAZATLAN', 'LOS MOCHIS', 'GUASAVE', 'NAVOLATO'],
    'SONORA': ['HERMOSILLO', 'CIUDAD OBREGON', 'NOGALES', 'GUAYMAS', 'NAVOJOA'],
    'TABASCO': ['VILLAHERMOSA', 'CARDENAS', 'COMALCALCO', 'PARAISO', 'MACUSPANA'],
    'SAN LUIS POTOSI': ['SAN LUIS POTOSI', 'CIUDAD VALLES', 'SOLEDAD', 'MATEHUALA', 'RIOVERDE'],
    'COAHUILA': ['SALTILLO', 'TORREON', 'MONCLOVA', 'PIEDRAS NEGRAS', 'ACUNA'],
    'HIDALGO': ['PACHUCA', 'TULANCINGO', 'TULA', 'HUEJUTLA', 'IXMIQUILPAN'],
    'QUERETARO': ['QUERETARO', 'SAN JUAN DEL RIO', 'CORREGIDORA', 'EL MARQUES', 'TEQUISQUIAPAN'],
    'MORELOS': ['CUERNAVACA', 'CUAUTLA', 'JIUTEPEC', 'TEMIXCO', 'YAUTEPEC'],
    'ZACATECAS': ['ZACATECAS', 'FRESNILLO', 'GUADALUPE', 'JEREZ', 'RIO GRANDE'],
    'DURANGO': ['DURANGO', 'GOMEZ PALACIO', 'LERDO', 'SANTIAGO PAPASQUIARO', 'CANATLÁN'],
    'AGUASCALIENTES': ['AGUASCALIENTES', 'JESUS MARIA', 'CALVILLO', 'RINCON DE ROMOS', 'PABELLON'],
    'TLAXCALA': ['TLAXCALA', 'APIZACO', 'HUAMANTLA', 'CHIAUTEMPAN', 'CALPULALPAN'],
    'NAYARIT': ['TEPIC', 'BAHIA DE BANDERAS', 'SANTIAGO IXCUINTLA', 'COMPOSTELA', 'TUXPAN'],
    'COLIMA': ['COLIMA', 'MANZANILLO', 'TECOMAN', 'VILLA DE ALVAREZ', 'ARMERIA'],
    'CAMPECHE': ['CAMPECHE', 'CIUDAD DEL CARMEN', 'CHAMPOTON', 'ESCARCEGA', 'CALKINI'],
    'QUINTANA ROO': ['CANCUN', 'CHETUMAL', 'PLAYA DEL CARMEN', 'COZUMEL', 'TULUM'],
    'YUCATAN': ['MERIDA', 'VALLADOLID', 'TIZIMIN', 'PROGRESO', 'UMAN'],
    'BAJA CALIFORNIA SUR': ['LA PAZ', 'LOS CABOS', 'COMONDU', 'LORETO', 'MULEGE'],
};

const SITUACIONES = ['PLANTA', 'PLANTA', 'PLANTA', 'PLANTA', 'PLANTA', 'PLANTA', 'PLANTA',
    'AGREGADO', 'COMISIONADO', 'A DISPOSICION', 'DISPONIBILIDAD', 'ENCUADRADO',
    'CON LICENCIA ORDINARIA', 'CON LICENCIA ESPECIAL'];

const ESPECIALIDADES = ['', '', '', '', 'PARACAIDISTA', 'FUERZAS ESPECIALES', 'TRANSMISIONES',
    'INFORMATICA', 'TOPOGRAFIA', 'MECANICA', 'ELECTRONICA', 'BLINDADOS',
    'TIRADORES', 'DEMOLICIONES', 'PILOTO AVIADOR', 'METEOROLOGIA'];

const PROFESIONES = ['', '', '', '', '', 'D.E.M.', 'D.E.M.A.', 'E.M.'];

const SUBESPECIALIDADES = ['', '', '', '', '', '', 'INSTRUCTOR', 'ANALISTA', 'OPERADOR', 'TECNICO'];

const ESTADOS_CIVILES = ['SOLTERO(A)', 'CASADO(A)', 'CASADO(A)', 'CASADO(A)', 'DIVORCIADO(A)', 'VIUDO(A)', 'UNION LIBRE'];

const TIPOS_MOVIMIENTO = ['ASCENSO', 'CAMBIO DE ADSCRIPCION', 'COMISION', 'PERMUTA', 'BAJA', 'ALTA', 'DESTINO'];

const TIPOS_CARGO = [
    'CMTE. DEL ORGANISMO', 'SUB CMTE.', 'JFE. DEL E.M.', 'S-1', 'S-2', 'S-3', 'S-4',
    'CMTE. DE CIA.', 'CMTE. DE SECCION', 'JFE. DE MESA', 'AUXILIAR',
    'CMTE. DE PELOTON', 'ENCARGADO DE ALMACEN', 'INSTRUCTOR',
    'JFE. DE DEPARTAMENTO', 'JFE. DE SECCION TIC', 'CMTE. DE BATALLON',
    'COORD. ADMINISTRATIVO', 'ENLACE', 'OPERADOR DE RADIO', 'CHOFER',
    'FURRIEL', 'ENFERMERO', 'MEDICO CIRUJANO', 'MECANICO', 'ARMERO',
    'JFE. DE GUARDIA', 'OFICIAL DE DIA', 'PAGADOR', 'SECRETARIO'
];

// ============================================================
//  UTILIDADES DE GENERACIÓN
// ============================================================

function rand(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(yearMin: number, yearMax: number): string {
    const y = rand(yearMin, yearMax);
    const m = String(rand(1, 12)).padStart(2, '0');
    const d = String(rand(1, 28)).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function generarMatricula(index: number): string {
    const num = (1000000 + index).toString();
    return `D-${num}`;
}

function generarCURP(nombre: string, apPat: string, apMat: string, fecha: string, sexo: string): string {
    const s = sexo === 'MASCULINO' ? 'H' : 'M';
    const estado = pick(['DF', 'MC', 'JC', 'NL', 'PL', 'GT', 'CH', 'MN', 'OC', 'VZ', 'GR', 'CS', 'TS', 'BC', 'SI', 'SR', 'TC', 'SP', 'CL', 'HG']);
    const f = fecha.replace(/-/g, '').substring(2);
    const p1 = apPat.substring(0, 2);
    const p2 = apMat.charAt(0);
    const p3 = nombre.charAt(0);
    const r = String(rand(10, 99));
    return `${p1}${p2}${p3}${f}${s}${estado}${r}`;
}

function generarRFC(apPat: string, apMat: string, nombre: string, fecha: string): string {
    const f = fecha.replace(/-/g, '').substring(2);
    const p1 = apPat.substring(0, 2);
    const p2 = apMat.charAt(0);
    const p3 = nombre.charAt(0);
    const hom = `${String.fromCharCode(65 + rand(0, 25))}${rand(0, 9)}${rand(0, 9)}`;
    return `${p1}${p2}${p3}${f}${hom}`;
}

// ============================================================
//  DATOS DE CATÁLOGOS
// ============================================================

const GRADOS = [
    { id: '1', nombre_grado: 'SOLDADO', abreviatura: 'Sld.' },
    { id: '2', nombre_grado: 'CABO', abreviatura: 'Cabo' },
    { id: '3', nombre_grado: 'SARGENTO SEGUNDO', abreviatura: 'Sgto. 2/o.' },
    { id: '4', nombre_grado: 'SARGENTO PRIMERO', abreviatura: 'Sgto. 1/o.' },
    { id: '5', nombre_grado: 'SUBTENIENTE', abreviatura: 'Sbtte.' },
    { id: '6', nombre_grado: 'TENIENTE', abreviatura: 'Tte.' },
    { id: '7', nombre_grado: 'CAPITÁN SEGUNDO', abreviatura: 'Cap. 2/o.' },
    { id: '8', nombre_grado: 'CAPITÁN PRIMERO', abreviatura: 'Cap. 1/o.' },
    { id: '9', nombre_grado: 'MAYOR', abreviatura: 'Mayor' },
    { id: '10', nombre_grado: 'TENIENTE CORONEL', abreviatura: 'Tte. Cor.' },
    { id: '11', nombre_grado: 'CORONEL', abreviatura: 'Cor.' },
    { id: '12', nombre_grado: 'GENERAL BRIGADIER', abreviatura: 'Gral. Brig.' },
    { id: '13', nombre_grado: 'GENERAL BRIGADA', abreviatura: 'Gral. Bgda.' },
    { id: '14', nombre_grado: 'GENERAL DIVISIÓN', abreviatura: 'Gral. Div.' },
    { id: '15', nombre_grado: 'CADETE', abreviatura: 'Cadete' },
    { id: '16', nombre_grado: 'ALUMNO', abreviatura: 'Alumno' },
    { id: '17', nombre_grado: 'GENERAL DE ALA', abreviatura: 'Gral. Ala' },
    { id: '18', nombre_grado: 'GENERAL DE GRUPO', abreviatura: 'Gral. Gpo.' },
    { id: '19', nombre_grado: 'RURAL 1/A.', abreviatura: 'Rural 1/a.' },
    { id: '20', nombre_grado: 'RURAL 2/A.', abreviatura: 'Rural 2/a.' },
];

// Distribución de grados (peso para asignación aleatoria — más tropa, menos generales)
const GRADO_PESOS = [
    { id: '1', peso: 250 },  // SOLDADO — muchos
    { id: '2', peso: 150 },  // CABO
    { id: '3', peso: 100 },  // SGTO 2o
    { id: '4', peso: 80 },   // SGTO 1o
    { id: '5', peso: 60 },   // SUBTTE
    { id: '6', peso: 60 },   // TTE
    { id: '7', peso: 55 },   // CAP 2o
    { id: '8', peso: 50 },   // CAP 1o
    { id: '9', peso: 40 },   // MAYOR
    { id: '10', peso: 35 },  // TTE COR
    { id: '11', peso: 30 },  // COR
    { id: '12', peso: 15 },  // GRAL BRIG
    { id: '13', peso: 10 },  // GRAL BGDA
    { id: '14', peso: 5 },   // GRAL DIV
    { id: '15', peso: 20 },  // CADETE
    { id: '16', peso: 15 },  // ALUMNO
    { id: '17', peso: 8 },   // GRAL ALA
    { id: '18', peso: 7 },   // GRAL GPO
    { id: '19', peso: 5 },   // RURAL 1a
    { id: '20', peso: 5 },   // RURAL 2a
];

function gradoAleatorio(): string {
    const total = GRADO_PESOS.reduce((s, g) => s + g.peso, 0);
    let r = rand(1, total);
    for (const g of GRADO_PESOS) {
        r -= g.peso;
        if (r <= 0) return g.id;
    }
    return '1';
}

const ARMAS = [
    { id: '1', nombre_servicio: 'INF.' },
    { id: '2', nombre_servicio: 'CAB.' },
    { id: '3', nombre_servicio: 'ART.' },
    { id: '4', nombre_servicio: 'ARTCA.' },
    { id: '5', nombre_servicio: 'ING.' },
    { id: '6', nombre_servicio: 'ARMA BLND.' },
    { id: '7', nombre_servicio: 'F.A.' },
    { id: '8', nombre_servicio: 'ADMON.' },
    { id: '9', nombre_servicio: 'INT.' },
    { id: '10', nombre_servicio: 'SND.' },
    { id: '11', nombre_servicio: 'JUST. MIL' },
    { id: '12', nombre_servicio: 'TRANS.' },
    { id: '13', nombre_servicio: 'INFTCA.' },
    { id: '14', nombre_servicio: 'TPTES.' },
    { id: '15', nombre_servicio: 'MAT. AR.' },
    { id: '16', nombre_servicio: 'MET.MIL.' },
    { id: '17', nombre_servicio: 'M.G.' },
    { id: '18', nombre_servicio: 'CART.' },
    { id: '19', nombre_servicio: 'EDUC. MIL.' },
    { id: '20', nombre_servicio: 'EDUC.F.Y D.' },
    { id: '21', nombre_servicio: 'CTL. MIL.VLO.' },
    { id: '22', nombre_servicio: 'MUS.MIL.' },
    { id: '23', nombre_servicio: 'P.M.' },
    { id: '24', nombre_servicio: 'PLA.' },
    { id: '25', nombre_servicio: 'PNAL.' },
    { id: '26', nombre_servicio: 'REC.' },
    { id: '27', nombre_servicio: 'TPTE.AR.' },
    { id: '28', nombre_servicio: 'T.T.F.A.' },
    { id: '29', nombre_servicio: 'BOM.' },
    { id: '30', nombre_servicio: 'DEF. RUR.' },
    { id: '31', nombre_servicio: 'ARCH.' },
    { id: '32', nombre_servicio: 'VR.' },
    { id: '33', nombre_servicio: 'MARINA' },
    { id: '34', nombre_servicio: 'ARMAS' },
    { id: '35', nombre_servicio: 'SERVICIO' },
];

const REGIONES = [
    { id: '1', nombre_region_militar: 'I R.M. (CDMX)', numero: 'I R.M.' },
    { id: '2', nombre_region_militar: 'II R.M. (MEXICALI, B.C.)', numero: 'II R.M.' },
    { id: '3', nombre_region_militar: 'III R.M. (MAZATLÁN, SIN.)', numero: 'III R.M.' },
    { id: '4', nombre_region_militar: 'IV R.M. (MONTERREY, N.L.)', numero: 'IV R.M.' },
    { id: '5', nombre_region_militar: 'V R.M. (GUADALAJARA, JAL.)', numero: 'V R.M.' },
    { id: '6', nombre_region_militar: 'VI R.M. (PUEBLA, PUE.)', numero: 'VI R.M.' },
    { id: '7', nombre_region_militar: 'VII R.M. (TUXTLA GUTIERREZ, CHIS.)', numero: 'VII R.M.' },
    { id: '8', nombre_region_militar: 'VIII R.M. (OAXACA, OAX.)', numero: 'VIII R.M.' },
    { id: '9', nombre_region_militar: 'IX R.M. (CUERNAVACA, MOR.)', numero: 'IX R.M.' },
    { id: '10', nombre_region_militar: 'X R.M. (MÉRIDA, YUC.)', numero: 'X R.M.' },
    { id: '11', nombre_region_militar: 'XI R.M. (CHIHUAHUA, CHIH.)', numero: 'XI R.M.' },
    { id: '12', nombre_region_militar: 'XII R.M. (IRAPUATO, GTO.)', numero: 'XII R.M.' },
];

const ZONAS: { id: string; nombre_zona_militar: string; numero: string }[] = [];
const CIUDADES_ZONA = [
    'CDMX', 'TIJUANA', 'LA PAZ', 'MONTERREY', 'CHIHUAHUA', 'SALTILLO', 'GUADALAJARA',
    'OAXACA', 'VILLAHERMOSA', 'DURANGO', 'ZACATECAS', 'SAN LUIS POTOSI', 'TEPIC',
    'AGUASCALIENTES', 'PUEBLA', 'IRAPUATO', 'QUERETARO', 'PACHUCA', 'TUXTLA GUTIERREZ',
    'CUERNAVACA', 'MORELIA', 'TOLUCA', 'TLAXCALA', 'CANCUN', 'MERIDA', 'CAMPECHE',
    'ACAPULCO', 'MATAMOROS', 'TAMPICO', 'VERACRUZ', 'COATZACOALCOS', 'MAZATLAN',
    'CULIACAN', 'LOS MOCHIS', 'HERMOSILLO', 'TAPACHULA', 'COMITAN', 'LEON',
    'CIUDAD JUAREZ', 'REYNOSA', 'NUEVO LAREDO', 'CIUDAD VICTORIA', 'NOGALES',
    'ORIZABA', 'CORDOBA', 'URUAPAN', 'COLIMA', 'LOS CABOS'
];
for (let i = 1; i <= 48; i++) {
    ZONAS.push({
        id: String(i),
        nombre_zona_militar: `${i}/a. Z.M. (${CIUDADES_ZONA[i - 1] || 'CDMX'})`,
        numero: `${i}/a. Z.M.`
    });
}

const ORGANISMOS = [
    { id: '1', nombre_organismo: 'DIR. GRAL. TIC.', campo_militar: 'CAMPO MIL. NO. 1-J', regionId: '1' },
    { id: '2', nombre_organismo: '1/ER. BN. INF.', campo_militar: 'CAMPO MIL. 1-A', regionId: '1' },
    { id: '3', nombre_organismo: '9/O. REGT. CAB. MOT.', campo_militar: 'MONTERREY, N.L.', regionId: '4' },
    { id: '4', nombre_organismo: '2/O. BN. INF.', campo_militar: 'CAMPO MIL. 1-B', regionId: '1' },
    { id: '5', nombre_organismo: '3/ER. BN. INF.', campo_militar: 'GUADALAJARA, JAL.', regionId: '5' },
    { id: '6', nombre_organismo: '1/ER. REGT. ART.', campo_militar: 'CAMPO MIL. 1-C', regionId: '1' },
    { id: '7', nombre_organismo: '4/O. BN. INF.', campo_militar: 'PUEBLA, PUE.', regionId: '6' },
    { id: '8', nombre_organismo: '2/O. REGT. CAB. MOT.', campo_militar: 'CHIHUAHUA, CHIH.', regionId: '11' },
    { id: '9', nombre_organismo: 'BN. ING. CMBS.', campo_militar: 'CAMPO MIL. 1-D', regionId: '1' },
    { id: '10', nombre_organismo: '5/O. BN. INF.', campo_militar: 'OAXACA, OAX.', regionId: '8' },
    { id: '11', nombre_organismo: 'HOSP. MIL. REGIONAL', campo_militar: 'CAMPO MIL. 1-E', regionId: '1' },
    { id: '12', nombre_organismo: '6/O. BN. INF.', campo_militar: 'TUXTLA GUTIERREZ, CHIS.', regionId: '7' },
    { id: '13', nombre_organismo: 'ESC. MIL. DE CLASES', campo_militar: 'CAMPO MIL. 1-F', regionId: '1' },
    { id: '14', nombre_organismo: '7/O. BN. INF.', campo_militar: 'CUERNAVACA, MOR.', regionId: '9' },
    { id: '15', nombre_organismo: '8/O. BN. INF.', campo_militar: 'IRAPUATO, GTO.', regionId: '12' },
    { id: '16', nombre_organismo: 'DIR. GRAL. ADMÓN.', campo_militar: 'CAMPO MIL. NO. 1-G', regionId: '1' },
    { id: '17', nombre_organismo: '10/O. BN. INF.', campo_militar: 'MONTERREY, N.L.', regionId: '4' },
    { id: '18', nombre_organismo: '1/A. BGDA. INF.', campo_militar: 'CAMPO MIL. 1-H', regionId: '1' },
    { id: '19', nombre_organismo: 'BAT. DE F.E.', campo_militar: 'CAMPO MIL. 1-I', regionId: '1' },
    { id: '20', nombre_organismo: '1/ER. BN. TPTES.', campo_militar: 'CAMPO MIL. 1-K', regionId: '1' },
    { id: '21', nombre_organismo: 'COL. MIL.', campo_militar: 'TLALPAN, CDMX', regionId: '1' },
    { id: '22', nombre_organismo: '11/O. BN. INF.', campo_militar: 'MÉRIDA, YUC.', regionId: '10' },
    { id: '23', nombre_organismo: 'ESC. MIL. ING.', campo_militar: 'CAMPO MIL. 1-L', regionId: '1' },
    { id: '24', nombre_organismo: '12/O. BN. INF.', campo_militar: 'MAZATLÁN, SIN.', regionId: '3' },
    { id: '25', nombre_organismo: 'BN. DE P.M.', campo_militar: 'CAMPO MIL. 1-M', regionId: '1' },
    { id: '26', nombre_organismo: '13/O. BN. INF.', campo_militar: 'VILLAHERMOSA, TAB.', regionId: '7' },
    { id: '27', nombre_organismo: 'DIR. GRAL. JUST. MIL.', campo_militar: 'CAMPO MIL. 1-N', regionId: '1' },
    { id: '28', nombre_organismo: 'B.A. MIL. No. 1', campo_militar: 'STA. LUCÍA, EDO. MÉX.', regionId: '1' },
    { id: '29', nombre_organismo: '14/O. BN. INF.', campo_militar: 'CANCÚN, Q. ROO', regionId: '10' },
    { id: '30', nombre_organismo: 'UNIDAD HAB. MIL. CDMX', campo_militar: 'CDMX', regionId: '1' },
];

// ============================================================
//  MAIN
// ============================================================

async function main() {
    console.log('🚀 Iniciando seed masivo para Neo4j...');
    console.log('   Se generarán 1000 personas con datos completos.\n');

    const session = driver.session();

    try {
        // ── PASO 1: Limpiar ──
        console.log('🗑️  Limpiando base de datos...');
        await session.run('MATCH (n) DETACH DELETE n');

        // ── PASO 2: Catálogos ──
        console.log('📋 Insertando catálogos...');

        // Roles, Subsecciones, Grupos, Mesas
        await session.run(`
            CREATE 
            (r1:Role {id: '1', nombre: 'ADMINISTRADOR'}),
            (r2:Role {id: '2', nombre: 'DISCIPLINA_Y_OFICIALES'}),
            (r3:Role {id: '3', nombre: 'USUARIO_REGULAR'}),
            
            (s1:Subseccion {id: '1', nombre: 'Jefatura'}),
            (s2:Subseccion {id: '2', nombre: 'Recursos Humanos'}),
            (s3:Subseccion {id: '3', nombre: 'Moral y Disciplina'}),
            (s4:Subseccion {id: '4', nombre: 'Promociones y Evaluacion'}),
            
            (g1:Grupo {id: '1', nombre: 'Grupo de Enlace'})-[:PERTENECE_A]->(s1),
            (g2:Grupo {id: '2', nombre: 'Grupo de Personal'})-[:PERTENECE_A]->(s2),
            (g3:Grupo {id: '3', nombre: 'Grupo de Desarrollo y Asuntos Especiales'})-[:PERTENECE_A]->(s2),
            (g4:Grupo {id: '4', nombre: 'Grupo de Moral'})-[:PERTENECE_A]->(s3),
            (g5:Grupo {id: '5', nombre: 'Grupo de Disciplina'})-[:PERTENECE_A]->(s3),
            
            (m1:Mesa {id: '1', nombre: 'Grupo de Enlace', clase: 'enlace'})-[:PERTENECE_A]->(g1),
            (m2:Mesa {id: '2', nombre: 'Mesa de Diplomados', clase: 'dem'})-[:PERTENECE_A]->(g2),
            (m3:Mesa {id: '3', nombre: 'Mesa de Grals., Jefes y Ofs.', clase: 'ofs'})-[:PERTENECE_A]->(g2),
            (m4:Mesa {id: '13', nombre: 'Mesa de Disciplina', clase: 'disc'})-[:PERTENECE_A]->(g5)
        `);

        // Grados
        console.log('  → Grados...');
        await session.run(`
            UNWIND $grados AS g
            CREATE (:Grado {id: g.id, nombre_grado: g.nombre_grado, abreviatura: g.abreviatura})
        `, { grados: GRADOS });

        // Armas
        console.log('  → Armas/Servicios...');
        await session.run(`
            UNWIND $armas AS a
            CREATE (:ArmaServicio {id: a.id, nombre_servicio: a.nombre_servicio})
        `, { armas: ARMAS });

        // Regiones
        console.log('  → Regiones militares...');
        await session.run(`
            UNWIND $regiones AS r
            CREATE (:RegionMilitar {id: r.id, nombre_region_militar: r.nombre_region_militar, numero: r.numero})
        `, { regiones: REGIONES });

        // Zonas
        console.log('  → Zonas militares...');
        await session.run(`
            UNWIND $zonas AS z
            CREATE (:ZonaMilitar {id: z.id, nombre_zona_militar: z.nombre_zona_militar, numero: z.numero})
        `, { zonas: ZONAS });

        // Organismos
        console.log('  → Organismos...');
        for (const org of ORGANISMOS) {
            await session.run(`
                MATCH (r:RegionMilitar {id: $regionId})
                CREATE (o:Organismo {id: $id, nombre_organismo: $nombre, campo_militar: $campo})-[:UBICADO_EN]->(r)
            `, { id: org.id, nombre: org.nombre_organismo, campo: org.campo_militar, regionId: org.regionId });
        }

        // ── PASO 3: Usuarios ──
        console.log('👤 Insertando usuarios...');
        const passwordHash = await bcrypt.hash('admin123', 10);

        await session.run(`
            MATCH (r1:Role {id: '1'})
            MATCH (r2:Role {id: '2'})
            MATCH (r3:Role {id: '3'})
            MATCH (m3:Mesa {id: '3'})
            MATCH (m4:Mesa {id: '13'})
            
            CREATE (u1:Usuario {id: '1', username: 'admin', nombre: 'Administrador Sistema', password: $passwordHash})-[:TIENE_ROL]->(r1)
            CREATE (u2:Usuario {id: '2', username: 'usuario_regular', nombre: 'Usuario Regular', password: $passwordHash})-[:TIENE_ROL]->(r3)
            CREATE (u3:Usuario {id: '3', username: 'oficiales', nombre: 'Usuario Oficiales', password: $passwordHash})-[:TIENE_ROL]->(r2)
            CREATE (u4:Usuario {id: '4', username: 'disciplina', nombre: 'Usuario Mesa Disciplina', password: $passwordHash})-[:TIENE_ROL]->(r2)
            
            CREATE (u3)-[:ASIGNADO_A]->(m3)
            CREATE (u4)-[:ASIGNADO_A]->(m4)
        `, { passwordHash });

        // ── PASO 4: Generar 1000 personas ──
        console.log('🧑‍✈️ Generando 1000 registros de personal militar...');

        const BATCH_SIZE = 50;
        const TOTAL = 1000;

        for (let batchStart = 0; batchStart < TOTAL; batchStart += BATCH_SIZE) {
            const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL);
            const personas: any[] = [];

            for (let i = batchStart; i < batchEnd; i++) {
                const esMasc = Math.random() < 0.82; // ~82% masculino en ejército
                const sexo = esMasc ? 'MASCULINO' : 'FEMENINO';
                const nombre = esMasc ? pick(NOMBRES_MASCULINOS) : pick(NOMBRES_FEMENINOS);
                const apPat = pick(APELLIDOS);
                const apMat = pick(APELLIDOS);
                const estadoNac = pick(ESTADOS);
                const ciudadesEstado = CIUDADES[estadoNac] || [estadoNac];
                const lugarNac = pick(ciudadesEstado) + ', ' + estadoNac;
                const fechaNac = randomDate(1960, 2000);
                const anioNac = parseInt(fechaNac.substring(0, 4));
                const fechaIngreso = randomDate(Math.max(anioNac + 18, 1978), 2024);
                const anioIngreso = parseInt(fechaIngreso.substring(0, 4));
                const fechaEmpleo = randomDate(anioIngreso, 2025);
                const fechaDestino = randomDate(Math.max(anioIngreso, 2015), 2025);

                const gradoId = gradoAleatorio();
                const gradoInfo = GRADOS.find(g => g.id === gradoId)!;
                const EDAD_LIM: Record<string, number> = {
                    '1': 50, '2': 50, '3': 50, '4': 50, '5': 51, '6': 52, '7': 53,
                    '8': 54, '9': 56, '10': 58, '11': 60, '12': 61, '13': 63, '14': 65,
                    '15': 50, '16': 50, '17': 63, '18': 63, '19': 50, '20': 50
                };
                const edadLim = EDAD_LIM[gradoId] || 50;
                const fechaEdadLimite = `${anioNac + edadLim}-${fechaNac.substring(5)}`;

                personas.push({
                    id: String(i + 1),
                    matricula: generarMatricula(i + 1),
                    curp: generarCURP(nombre, apPat, apMat, fechaNac, sexo),
                    rfc: generarRFC(apPat, apMat, nombre, fechaNac),
                    nombre,
                    apellido_paterno: apPat,
                    apellido_materno: apMat,
                    sexo,
                    situacion: pick(SITUACIONES),
                    clasificacion: Math.random() < 0.7 ? 'PERMANENTE' : 'AUXILIAR',
                    especialidad: pick(ESPECIALIDADES),
                    profesion: pick(PROFESIONES),
                    subespecialidad: pick(SUBESPECIALIDADES),
                    estado_civil: pick(ESTADOS_CIVILES),
                    fecha_nacimiento: fechaNac,
                    fecha_ingreso: fechaIngreso,
                    fecha_empleo: fechaEmpleo,
                    fecha_destino: fechaDestino,
                    edad_limite: fechaEdadLimite,
                    lugar_nacimiento: lugarNac,
                    estado_nacimiento: estadoNac,
                    ubicacion: pick(ciudadesEstado),
                    gradoId,
                    armaId: String(rand(1, ARMAS.length)),
                    regionId: String(rand(1, REGIONES.length)),
                    zonaId: String(rand(1, ZONAS.length)),
                    organismoId: String(rand(1, ORGANISMOS.length)),
                });
            }

            // Crear nodos PersonalMilitar y relaciones en un solo batch
            await session.run(`
                UNWIND $personas AS p
                MATCH (gr:Grado {id: p.gradoId})
                MATCH (arm:ArmaServicio {id: p.armaId})
                MATCH (reg:RegionMilitar {id: p.regionId})
                MATCH (zon:ZonaMilitar {id: p.zonaId})
                MATCH (org:Organismo {id: p.organismoId})
                CREATE (pm:PersonalMilitar {
                    id: p.id,
                    matricula: p.matricula,
                    curp: p.curp,
                    rfc: p.rfc,
                    nombre: p.nombre,
                    apellido_paterno: p.apellido_paterno,
                    apellido_materno: p.apellido_materno,
                    sexo: p.sexo,
                    situacion: p.situacion,
                    clasificacion: p.clasificacion,
                    especialidad: p.especialidad,
                    profesion: p.profesion,
                    subespecialidad: p.subespecialidad,
                    estado_civil: p.estado_civil,
                    fecha_nacimiento: p.fecha_nacimiento,
                    fecha_ingreso: p.fecha_ingreso,
                    fecha_empleo: p.fecha_empleo,
                    fecha_destino: p.fecha_destino,
                    edad_limite: p.edad_limite,
                    lugar_nacimiento: p.lugar_nacimiento,
                    estado_nacimiento: p.estado_nacimiento,
                    ubicacion: p.ubicacion
                })
                CREATE (pm)-[:TIENE_GRADO]->(gr)
                CREATE (pm)-[:PERTENECE_A_ARMA]->(arm)
                CREATE (pm)-[:EN_REGION]->(reg)
                CREATE (pm)-[:EN_ZONA]->(zon)
                CREATE (pm)-[:ADSCRITO_A]->(org)
            `, { personas });

            console.log(`   ✅ ${batchEnd}/${TOTAL} personas creadas`);
        }

        // ── PASO 5: Cargos ──
        console.log('💼 Creando cargos para cada persona...');
        for (let batchStart = 0; batchStart < TOTAL; batchStart += BATCH_SIZE) {
            const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL);
            const cargos: any[] = [];

            for (let i = batchStart; i < batchEnd; i++) {
                const orgNombre = pick(ORGANISMOS).nombre_organismo;
                cargos.push({
                    personalId: String(i + 1),
                    cargoId: `c${i + 1}`,
                    cargo: pick(TIPOS_CARGO),
                    unidad: orgNombre,
                    ubicacion: pick(CIUDADES_ZONA),
                    fecha_cargo: randomDate(2018, 2025),
                });
            }

            await session.run(`
                UNWIND $cargos AS c
                MATCH (p:PersonalMilitar {id: c.personalId})
                CREATE (cg:Cargo {id: c.cargoId, cargo: c.cargo, unidad: c.unidad, ubicacion: c.ubicacion, fecha_cargo: c.fecha_cargo})
                CREATE (p)-[:DESEMPENO_CARGO]->(cg)
            `, { cargos });

            if (batchEnd % 200 === 0 || batchEnd === TOTAL) console.log(`   ✅ ${batchEnd}/${TOTAL} cargos creados`);
        }

        // ── PASO 6: Movimientos (~1-2 por persona = ~1500 total) ──
        console.log('📦 Creando movimientos...');
        let movId = 0;
        for (let batchStart = 0; batchStart < TOTAL; batchStart += BATCH_SIZE) {
            const batchEnd = Math.min(batchStart + BATCH_SIZE, TOTAL);
            const movs: any[] = [];

            for (let i = batchStart; i < batchEnd; i++) {
                const numMovs = rand(1, 3);
                for (let j = 0; j < numMovs; j++) {
                    movId++;
                    movs.push({
                        personalId: String(i + 1),
                        movId: `m${movId}`,
                        tipo: pick(TIPOS_MOVIMIENTO),
                        grado: pick(GRADOS).nombre_grado,
                        unidad: pick(ORGANISMOS).nombre_organismo,
                        fecha_mov: randomDate(2015, 2025),
                    });
                }
            }

            await session.run(`
                UNWIND $movs AS mv
                MATCH (p:PersonalMilitar {id: mv.personalId})
                CREATE (m:Movimiento {id: mv.movId, tipo: mv.tipo, grado: mv.grado, unidad: mv.unidad, fecha_mov: mv.fecha_mov})
                CREATE (p)-[:TUVO_MOVIMIENTO]->(m)
            `, { movs });

            if (batchEnd % 200 === 0 || batchEnd === TOTAL) console.log(`   ✅ Movimientos hasta persona ${batchEnd} creados`);
        }

        // ── PASO 7: Familiares (~200 pares) ──
        console.log('👨‍👩‍👧‍👦 Creando relaciones de familiares...');
        const parentescos = ['PADRE', 'MADRE', 'HIJO(A)', 'HERMANO(A)', 'ESPOSO(A)', 'TIO(A)', 'SOBRINO(A)', 'PRIMO(A)', 'ABUELO(A)', 'NIETO(A)'];
        const familiares: any[] = [];
        const usedPairs = new Set<string>();

        for (let i = 0; i < 200; i++) {
            let id1: string, id2: string;
            let pairKey: string;
            do {
                id1 = String(rand(1, TOTAL));
                id2 = String(rand(1, TOTAL));
                pairKey = `${Math.min(+id1, +id2)}-${Math.max(+id1, +id2)}`;
            } while (id1 === id2 || usedPairs.has(pairKey));
            usedPairs.add(pairKey);

            familiares.push({
                id1,
                id2,
                parentesco: pick(parentescos),
            });
        }

        // Insert in batches of 50
        for (let fb = 0; fb < familiares.length; fb += 50) {
            const batch = familiares.slice(fb, fb + 50);
            await session.run(`
                UNWIND $fams AS f
                MATCH (p1:PersonalMilitar {id: f.id1})
                MATCH (p2:PersonalMilitar {id: f.id2})
                CREATE (p1)-[:TIENE_FAMILIAR {parentesco: f.parentesco}]->(p2)
            `, { fams: batch });
        }
        console.log(`   ✅ ${familiares.length} relaciones de familiares creadas`);

        // ── PASO 8: Conductas (~100) ──
        console.log('⚖️  Creando registros de conducta...');
        const conductas: any[] = [];
        const tiposConducta = ['AMONESTACION', 'ARRESTO', 'RECONOCIMIENTO', 'FELICITACION', 'SANCION DISCIPLINARIA', 'MENCION HONORIFICA'];
        const descsConducta = [
            'Falta de puntualidad reiterada.',
            'Insubordinación ante oficial superior.',
            'Desempeño sobresaliente en maniobras.',
            'Reconocimiento por labor humanitaria.',
            'Violación al reglamento general.',
            'Participación destacada en operación.',
            'Abandono de puesto sin autorización.',
            'Conducta ejemplar ante contingencia.',
            'Falta de respeto a insignias.',
            'Colaboración extraordinaria en misión.',
        ];

        for (let i = 0; i < 100; i++) {
            conductas.push({
                personalId: String(rand(1, TOTAL)),
                conductaId: `cond${i + 1}`,
                tipo: pick(tiposConducta),
                descripcion: pick(descsConducta),
                fecha: randomDate(2019, 2025),
            });
        }

        await session.run(`
            UNWIND $conductas AS c
            MATCH (p:PersonalMilitar {id: c.personalId})
            CREATE (con:Conducta {id: c.conductaId, tipo: c.tipo, descripcion: c.descripcion, fecha: c.fecha})
            CREATE (p)-[:TIENE_CONDUCTA]->(con)
        `, { conductas });
        console.log(`   ✅ ${conductas.length} registros de conducta creados`);

        // ── PASO 9: Índices para rendimiento ──
        console.log('🔧 Creando índices para rendimiento...');
        const indices = [
            'CREATE INDEX IF NOT EXISTS FOR (p:PersonalMilitar) ON (p.id)',
            'CREATE INDEX IF NOT EXISTS FOR (p:PersonalMilitar) ON (p.matricula)',
            'CREATE INDEX IF NOT EXISTS FOR (p:PersonalMilitar) ON (p.nombre)',
            'CREATE INDEX IF NOT EXISTS FOR (p:PersonalMilitar) ON (p.apellido_paterno)',
            'CREATE INDEX IF NOT EXISTS FOR (g:Grado) ON (g.id)',
            'CREATE INDEX IF NOT EXISTS FOR (a:ArmaServicio) ON (a.id)',
            'CREATE INDEX IF NOT EXISTS FOR (r:RegionMilitar) ON (r.id)',
            'CREATE INDEX IF NOT EXISTS FOR (z:ZonaMilitar) ON (z.id)',
            'CREATE INDEX IF NOT EXISTS FOR (o:Organismo) ON (o.id)',
            'CREATE INDEX IF NOT EXISTS FOR (u:Usuario) ON (u.id)',
            'CREATE INDEX IF NOT EXISTS FOR (u:Usuario) ON (u.username)',
        ];
        for (const idx of indices) {
            await session.run(idx);
        }

        console.log('\n✅ ¡Seed completo!');
        console.log(`   📊 Resumen:`);
        console.log(`   • ${TOTAL} Personal Militar`);
        console.log(`   • ${GRADOS.length} Grados`);
        console.log(`   • ${ARMAS.length} Armas/Servicios`);
        console.log(`   • ${REGIONES.length} Regiones Militares`);
        console.log(`   • ${ZONAS.length} Zonas Militares`);
        console.log(`   • ${ORGANISMOS.length} Organismos`);
        console.log(`   • ${TOTAL} Cargos`);
        console.log(`   • ~${movId} Movimientos`);
        console.log(`   • ${familiares.length} Relaciones de Familiares`);
        console.log(`   • ${conductas.length} Registros de Conducta`);
        console.log(`   • 4 Usuarios del sistema`);
        console.log(`   • ${indices.length} Índices de rendimiento`);

    } catch (error) {
        console.error('❌ Error durante el seed de Neo4j:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

main();
