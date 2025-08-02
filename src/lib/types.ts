// تحديث أنواع البيانات
export interface ProcessingState {
  isProcessing: boolean
  stage: "reading" | "parsing" | "indexing" | "saving" | "complete"
  progress: number
  message: string
}

export interface Student {
  NODOSS: number
  SERIE: string
  TYPEC: string
  NOM_FR: string
  NOM_AR: string
  DATN: string
  LIEUN_FR: string
  LIEUN_AR: string
  Moy_Bac: number
  Decision: string
  Wilaya_FR: string
  Wilaya_AR: string
  Centre_Ex: string
  Etablissement: string
  Etablissement_AR: string
}

export interface PublicFile {
  file_name: string
  students_count: number
  uploader_name: string
  uploaded_at: string
}

export interface UserFile {
  file_name: string
  students_count: number
  uploaded_at: string
}
