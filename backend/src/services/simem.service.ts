import axios from "axios";

const DATASET_ID = "c51127";
const API_URL =
  process.env.API_URL ?? "https://www.simem.co/backend-files/api/PublicData";
const TARGET_EMBALSES = ["CHUZA", "GUAVIO", "MUNA"];

export interface SimemReservaRegional {
  fecha: string;
  fechaPublicacion: string;
  embalse: string;
  region: string;
  volumenUtilDiarioEnergia: number;
  capacidadUtilEnergia: number;
  volumenTotalEnergia: number;
  vertimientosEnergia: number;
  minimoOperativoSuperior: number;
  minimoOperativoInferior: number;
  porcentajeLlenado: number;
}

export interface SimemReservaRegionalResponse {
  fuente: string;
  datasetId: string;
  startDate: string;
  endDate: string;
  agregadoBogota: SimemReservaRegional | null;
  promedioRegional: number;
  embalsesDetalle: SimemReservaRegional[];
  historicoEmbalses: SimemReservaRegional[];
}

type SimemRawRow = {
  FechaPublicacion?: string;
  Fecha?: string;
  CodigoEmbalse?: string;
  NombreEmbalse?: string;
  Region?: string;
  RegionHidrologica?: string;
  VolumenUtilDiarioEnergia?: number | string;
  CapacidadUtilEnergia?: number | string;
  VolumenTotalEnergia?: number | string;
  VertimientosEnergia?: number | string;
  MinimoOperativoSuperior?: number | string;
  MinimoOperativoInferior?: number | string;
  CodigoDuracion?: string;
};

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const normalized = value.replace(/,/g, "").trim();
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
}

function normalizeText(value: string | undefined): string {
  return (value ?? "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function getEmbalseDisplayName(row: SimemRawRow): string {
  const codigo = normalizeText(row.CodigoEmbalse);
  const nombre = normalizeText(row.NombreEmbalse);
  return nombre || codigo;
}

function getRegionName(row: SimemRawRow): string {
  return row.RegionHidrologica ?? row.Region ?? "";
}

function normalizeRow(row: SimemRawRow): SimemReservaRegional {
  const volumenUtilDiarioEnergia = toNumber(row.VolumenUtilDiarioEnergia);
  const capacidadUtilEnergia = toNumber(row.CapacidadUtilEnergia);

  const porcentajeLlenado =
    capacidadUtilEnergia > 0
      ? Number(((volumenUtilDiarioEnergia / capacidadUtilEnergia) * 100).toFixed(2))
      : 0;

  return {
    fecha: row.Fecha ?? "",
    fechaPublicacion: row.FechaPublicacion ?? "",
    embalse: getEmbalseDisplayName(row),
    region: getRegionName(row),
    volumenUtilDiarioEnergia,
    capacidadUtilEnergia,
    volumenTotalEnergia: toNumber(row.VolumenTotalEnergia),
    vertimientosEnergia: toNumber(row.VertimientosEnergia),
    minimoOperativoSuperior: toNumber(row.MinimoOperativoSuperior),
    minimoOperativoInferior: toNumber(row.MinimoOperativoInferior),
    porcentajeLlenado,
  };
}

function sortByFechaAsc(items: SimemReservaRegional[]): SimemReservaRegional[] {
  return [...items].sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
}

function getLatestByEmbalse(items: SimemReservaRegional[]): SimemReservaRegional[] {
  const latestMap = new Map<string, SimemReservaRegional>();

  for (const item of items) {
    const current = latestMap.get(item.embalse);
    if (!current || new Date(item.fecha) > new Date(current.fecha)) {
      latestMap.set(item.embalse, item);
    }
  }

  return Array.from(latestMap.values()).sort((a, b) =>
    a.embalse.localeCompare(b.embalse)
  );
}

function getPromedioRegional(items: SimemReservaRegional[]): number {
  if (items.length === 0) return 0;
  const total = items.reduce((acc, item) => acc + item.porcentajeLlenado, 0);
  return Number((total / items.length).toFixed(2));
}

function isTargetEmbalse(row: SimemRawRow): boolean {
  const codigo = normalizeText(row.CodigoEmbalse);
  const nombre = normalizeText(row.NombreEmbalse);

  return TARGET_EMBALSES.some(
    (target) => codigo.includes(target) || nombre.includes(target)
  );
}

export async function getReservasBogotaCundinamarca(
  startDate: string,
  endDate: string
): Promise<SimemReservaRegionalResponse> {
  let response;

try {
  response = await axios.get(API_URL, {
    params: {
      datasetId: DATASET_ID,
      startDate,
      endDate,
    },
    timeout: 20000,
  });
} catch (error: any) {
  console.error("Error consultando SIMEM:", error.message);
  throw new Error(`SIMEM no respondió correctamente: ${error.message}`);
}

  const payload = response.data;
  const rows: SimemRawRow[] = payload?.result?.records ?? [];

  console.log(
    "EMBALSES DISPONIBLES:",
    [...new Set(rows.map((r) => `${r.CodigoEmbalse} | ${r.NombreEmbalse}`))].slice(0, 100)
  );

  const filtered = rows.filter((row) => {
    const fecha = row.Fecha ?? "";
    const inRange = fecha >= startDate && fecha <= endDate;
    return inRange && isTargetEmbalse(row);
  });

  const normalized = filtered.map(normalizeRow);

  const soloEmbalses = normalized.filter((item) => {
    const nombre = normalizeText(item.embalse);
    return TARGET_EMBALSES.some((target) => nombre.includes(target));
  });

  const historicoEmbalses = sortByFechaAsc(soloEmbalses);
  const latestEmbalsesDetalle = getLatestByEmbalse(historicoEmbalses);
  const promedioRegional = getPromedioRegional(latestEmbalsesDetalle);

  return {
    fuente: "SIMEM - XM",
    datasetId: DATASET_ID,
    startDate,
    endDate,
    agregadoBogota: null,
    promedioRegional,
    embalsesDetalle: latestEmbalsesDetalle,
    historicoEmbalses,
  };
}