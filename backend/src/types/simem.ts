export interface SimemRawRow {
  FechaPublicacion: string;
  Fecha: string;
  CodigoEmbalse: string;
  RegionHidrologica: string;
  VolumenUtilDiarioEnergia: number | string | null;
  CapacidadUtilEnergia: number | string | null;
  VolumenTotalEnergia: number | string | null;
  VertimientosEnergia: number | string | null;
  MinimoOperativoSuperior: number | string | null;
  MinimoOperativoInferior: number | string | null;
  CodigoDuracion: string;
}

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

export interface SimemBogotaCundinamarcaResponse {
  fuente: string;
  datasetId: string;
  startDate: string;
  endDate: string;
  agregadoBogota: SimemReservaRegional | null;
  embalsesDetalle: SimemReservaRegional[];
}