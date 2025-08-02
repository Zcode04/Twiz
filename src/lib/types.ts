// lib/types.ts

// Updated Student interface for Baccalaureate results
export interface Student {
  NODOSS: number        // رقم الملف
  SERIE: string         // السلسلة (CL, M, LO, SN, etc.)
  TYPEC: string         // النوع 
  NOM_FR: string        // الاسم بالفرنسية
  NOM_AR: string        // الاسم بالعربية
  DATN: string          // تاريخ الميلاد (DD/MM/YYYY)
  LIEUN_FR: string      // مكان الميلاد بالفرنسية
  LIEUN_AR: string      // مكان الميلاد بالعربية
  Moy_Bac: number       // معدل البكالوريا
  Decision: string      // القرار (Admis, Ajourné(e), etc.)
  Wilaya_FR: string     // الولاية بالفرنسية
  Wilaya_AR: string     // الولاية بالعربية
  Centre_Ex: string     // مركز الامتحان
  Etablissement: string // المؤسسة
  Etablissement_AR: string // المؤسسة بالعربية
}

export interface ProcessingState {
  isProcessing: boolean
  stage: "reading" | "parsing" | "indexing" | "saving" | "complete"
  progress: number
  message: string
}

// Search result interface
export interface SearchResult extends Student {
  score?: number        // Search relevance score
  matchedFields?: string[] // Fields that matched the search query
}

// Statistics interface for data analysis
export interface StudentStatistics {
  totalStudents: number
  admittedCount: number
  rejectedCount: number
  averageScore: number
  topScore: number
  bottomScore: number
  seriesDistribution: Record<string, number>
  wilayaDistribution: Record<string, number>
  decisionDistribution: Record<string, number>
}

// Filter options for advanced search
export interface FilterOptions {
  serie?: string[]
  wilaya?: string[]
  decision?: string[]
  minScore?: number
  maxScore?: number
  etablissement?: string[]
  centre?: string[]
}

// Pagination interface
export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: keyof Student
  sortOrder?: 'asc' | 'desc'
}

// Export format options
export interface ExportOptions {
  format: 'excel' | 'csv' | 'pdf'
  fields?: (keyof Student)[]
  includeStatistics?: boolean
}