"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var neo4j_1 = require("../lib/neo4j");
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var session, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Iniciando seed para Neo4j (Grafos)...');
                    session = neo4j_1.driver.session();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 11]);
                    // Limpiamos base de datos actual (solo para desarrollo/pruebas)
                    console.log('Limpiando base de datos...');
                    return [4 /*yield*/, session.run('MATCH (n) DETACH DELETE n')];
                case 2:
                    _a.sent();
                    // ============================================================
                    //  CATÁLOGOS
                    // ============================================================
                    console.log('Insertando catálogos...');
                    return [4 /*yield*/, session.run("\n            CREATE \n            // Roles\n            (r1:Role {id: '1', nombre: 'ADMINISTRADOR'}),\n            (r2:Role {id: '2', nombre: 'DISCIPLINA_Y_OFICIALES'}),\n            (r3:Role {id: '3', nombre: 'USUARIO_REGULAR'}),\n            \n            // Subsecciones\n            (s1:Subseccion {id: '1', nombre: 'Jefatura'}),\n            (s2:Subseccion {id: '2', nombre: 'Recursos Humanos'}),\n            (s3:Subseccion {id: '3', nombre: 'Moral y Disciplina'}),\n            (s4:Subseccion {id: '4', nombre: 'Promociones y Evaluacion'}),\n            \n            // Grupos (con relaci\u00F3n a Subseccion)\n            (g1:Grupo {id: '1', nombre: 'Grupo de Enlace'})-[:PERTENECE_A]->(s1),\n            (g2:Grupo {id: '2', nombre: 'Grupo de Personal'})-[:PERTENECE_A]->(s2),\n            (g3:Grupo {id: '3', nombre: 'Grupo de Desarrollo y Asuntos Especiales'})-[:PERTENECE_A]->(s2),\n            (g4:Grupo {id: '4', nombre: 'Grupo de Moral'})-[:PERTENECE_A]->(s3),\n            (g5:Grupo {id: '5', nombre: 'Grupo de Disciplina'})-[:PERTENECE_A]->(s3),\n            \n            // Mesas\n            (m1:Mesa {id: '1', nombre: 'Grupo de Enlace', clase: 'enlace'})-[:PERTENECE_A]->(g1),\n            (m2:Mesa {id: '2', nombre: 'Mesa de Diplomados', clase: 'dem'})-[:PERTENECE_A]->(g2),\n            (m3:Mesa {id: '3', nombre: 'Mesa de Grals., Jefes y Ofs.', clase: 'ofs'})-[:PERTENECE_A]->(g2),\n            (m4:Mesa {id: '13', nombre: 'Mesa de Disciplina', clase: 'disc'})-[:PERTENECE_A]->(g5),\n            \n            // Grados\n            (gr1:Grado {id: '1', nombre: 'SOLDADO', abrev: 'SLD.'}),\n            (gr6:Grado {id: '6', nombre: 'GENERAL BRIGADIER', abrev: 'GRAL. BRG.'}),\n            (gr8:Grado {id: '8', nombre: 'CORONEL', abrev: 'COR.'}),\n            (gr11:Grado {id: '11', nombre: 'CAPIT\u00C1N SEGUNDO', abrev: 'CAP. 2/o.'}),\n            \n            // Armas\n            (arm1:ArmaServicio {id: '1', nombre: 'INF.'}),\n            (arm2:ArmaServicio {id: '2', nombre: 'CAB.'}),\n            \n            // Regiones y Zonas\n            (reg1:RegionMilitar {id: '1', nombre: 'III R.M. (MAZATL\u00C1N, SIN.)', numero: 'III R.M.'}),\n            (reg4:RegionMilitar {id: '4', nombre: 'IV R.M. (MONTERREY, N.L.)', numero: 'IV R.M.'}),\n            (zon1:ZonaMilitar {id: '1', nombre: '3/A. Z.M. (LA PAZ, B.C.S.)', numero: '3/A. Z.M.'}),\n            (zon4:ZonaMilitar {id: '4', nombre: '5/A. Z.M. (CHIHUAHUA, CHIH.)', numero: '5/A. Z.M.'}),\n            \n            // Organismos\n            (org1:Organismo {id: '1', nombre: 'DIR. GRAL. TIC.', campo_militar: 'CAMPO MIL. NO. 1-J'})-[:UBICADO_EN]->(reg1),\n            (org2:Organismo {id: '4', nombre: '1/ER. BN. INF.', campo_militar: 'CAMPO MIL. 1-A'})-[:UBICADO_EN]->(reg1),\n            (org3:Organismo {id: '3', nombre: '9/O. REGT. CAB. MOT.', campo_militar: 'MONTERREY'})-[:UBICADO_EN]->(reg4)\n        ")];
                case 3:
                    _a.sent();
                    // ============================================================
                    //  USUARIOS
                    // ============================================================
                    console.log('Insertando usuarios...');
                    return [4 /*yield*/, session.run("\n            MATCH (r1:Role {id: '1'})\n            MATCH (r3:Role {id: '3'})\n            MATCH (r2:Role {id: '2'})\n            MATCH (m3:Mesa {id: '3'})\n            MATCH (m4:Mesa {id: '13'})\n            \n            CREATE (u1:Usuario {id: '1', username: 'admin', nombre: 'Administrador Sistema'})-[:TIENE_ROL]->(r1)\n            CREATE (u2:Usuario {id: '2', username: 'usuario_regular', nombre: 'Usuario Regular'})-[:TIENE_ROL]->(r3)\n            CREATE (u3:Usuario {id: '3', username: 'oficiales', nombre: 'Usuario Oficiales'})-[:TIENE_ROL]->(r2)\n            CREATE (u4:Usuario {id: '4', username: 'disciplina', nombre: 'Usuario Mesa Disciplina'})-[:TIENE_ROL]->(r2)\n            \n            CREATE (u3)-[:ASIGNADO_A]->(m3)\n            CREATE (u4)-[:ASIGNADO_A]->(m4)\n        ")];
                case 4:
                    _a.sent();
                    // ============================================================
                    //  PERSONAL MILITAR Y RELACIONES
                    // ============================================================
                    console.log('Insertando personal militar y relaciones...');
                    return [4 /*yield*/, session.run("\n            MATCH (gr6:Grado {id: '6'})\n            MATCH (gr11:Grado {id: '11'})\n            MATCH (arm1:ArmaServicio {id: '1'})\n            MATCH (arm2:ArmaServicio {id: '2'})\n            MATCH (org1:Organismo {id: '1'})\n            MATCH (org2:Organismo {id: '4'})\n            MATCH (zon1:ZonaMilitar {id: '1'})\n            MATCH (zon4:ZonaMilitar {id: '4'})\n            MATCH (reg1:RegionMilitar {id: '1'})\n            MATCH (reg4:RegionMilitar {id: '4'})\n\n            CREATE (p1:PersonalMilitar {\n                id: '1', matricula: 'D-5475140', curp: 'GAGL720315HDFRRN08', rfc: 'GAGL720315AB3', \n                nombre: 'YAEL', apellido_paterno: 'SALGADO', apellido_materno: 'SANCHEZ', sexo: 'Masculino',\n                situacion: 'PLANTA'\n            })\n            CREATE (p1)-[:TIENE_GRADO]->(gr6)\n            CREATE (p1)-[:PERTENECE_A_ARMA]->(arm1)\n            CREATE (p1)-[:ADSCRITO_A]->(org1)\n            CREATE (p1)-[:EN_ZONA]->(zon1)\n            CREATE (p1)-[:EN_REGION]->(reg1)\n            \n            CREATE (p2:PersonalMilitar {\n                id: '2', matricula: 'D-6281034', curp: 'MALC850712HDFRRL05', rfc: 'MALC850712QR7', \n                nombre: 'CARLOS ALBERTO', apellido_paterno: 'MARTINEZ', apellido_materno: 'LOPEZ', sexo: 'Masculino',\n                situacion: 'PLANTA'\n            })\n            CREATE (p2)-[:TIENE_GRADO]->(gr11)\n            CREATE (p2)-[:PERTENECE_A_ARMA]->(arm2)\n            CREATE (p2)-[:ADSCRITO_A]->(org2)\n            CREATE (p2)-[:EN_ZONA]->(zon4)\n            CREATE (p2)-[:EN_REGION]->(reg4)\n        ")];
                case 5:
                    _a.sent();
                    // ============================================================
                    //  CARGOS Y MOVIMIENTOS
                    // ============================================================
                    console.log('Insertando cargos y movimientos...');
                    return [4 /*yield*/, session.run("\n            MATCH (p1:PersonalMilitar {id: '1'})\n            MATCH (p2:PersonalMilitar {id: '2'})\n            \n            // Movimientos\n            CREATE (m1:Movimiento {id: '1', tipo: 'ASCENSO', grado: 'Teniente', unidad: 'Dir. Gral. TIC', fecha: '2024-01-01'})\n            CREATE (p1)-[:TUVO_MOVIMIENTO]->(m1)\n            \n            CREATE (m2:Movimiento {id: '3', tipo: 'ASCENSO', grado: 'Coronel', unidad: '9/o. Regt. Cab. Mot.', fecha: '2023-11-16'})\n            CREATE (p2)-[:TUVO_MOVIMIENTO]->(m2)\n            \n            // Cargos\n            CREATE (c1:Cargo {id: '1', cargo: 'Jefe de Secci\u00F3n TIC', unidad: 'Dir. Gral. TIC', ubicacion: 'CDMX', fecha: '2023-01-01'})\n            CREATE (p1)-[:DESEMPENO_CARGO]->(c1)\n            \n            CREATE (c2:Cargo {id: '3', cargo: 'Comandante de Batall\u00F3n', unidad: '9/o. Regt. Cab. Mot.', ubicacion: 'Mty', fecha: '2023-11-16'})\n            CREATE (p2)-[:DESEMPENO_CARGO]->(c2)\n        ")];
                case 6:
                    _a.sent();
                    console.log('Seed completo ejecutado correctamente para Neo4j (Grafos).');
                    return [3 /*break*/, 11];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error durante el seed de Neo4j:', error_1);
                    return [3 /*break*/, 11];
                case 8: return [4 /*yield*/, session.close()];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, neo4j_1.driver.close()];
                case 10:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
main();
