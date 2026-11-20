export interface AtividadeSn {
  codigo: string;
  descricao: string;
  rotuloAnexo: string;
  rotuloCurtoAnexo: string;
  sujeitaFatorR: boolean;
  disponivel: boolean;
}
export interface ItemRtcRequest {
  numero: number;
  cAtivSN?: string;
  cClassTrib: string;
  baseCalculo: string;
  valorImpostoSeletivo: string;
  pIBSSN?: string;
  pCBSSN?: string;
}
export interface OperacaoRtcRequest {
  id: string;
  versao: string;
  data: string;
  tpDoc: string;
  CRT: string;
  tpRegimeIBSCBS?: string;
  itens: ItemRtcRequest[];
}
export interface TributosRtc {
  vRBSNitem?: number;
  vBC?: number;
  pIBSSN?: number;
  vIBSSN?: number;
  pCBSSN?: number;
  vCBSSN?: number;
  totalItem?: number;
  IS?: { valor?: number };
}
export interface ObjetoRtc {
  nObj: number;
  estadoItem: string;
  tribCalc?: TributosRtc;
  erros?: { code?: string; codigo?: string; message?: string }[];
}
export interface ResultadoRtc {
  objetos: ObjetoRtc[];
  total?: {
    vRBSNtot?: number;
    vIBSSNtot?: number;
    vCBSSNtot?: number;
    totalIs?: number;
    totalTributos?: number;
  };
}
export interface ErroVsn {
  codigo: string;
  titulo: string;
  descricao: string;
}
