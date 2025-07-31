export interface Student {
  Num_Bepc: number;
  NOM: string;
  LIEU_NAISS: string;
  DATE_NAISS: string;
  WILAYA: string;
  Ecole: string;
  Centre: string;
  Moyenne_Bepc: number;
  Decision: string;
}

export interface ProcessingState {
  isProcessing: boolean;
  stage: "reading" | "parsing" | "indexing" | "saving" | "complete";
  progress: number;
  message: string;
}
