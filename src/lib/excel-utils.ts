// lib/excel-utils.ts

import type { Student } from './types'

// Clean and normalize text data
export function clean(value: unknown): string {
  if (value === null || value === undefined) return ""
  
  const str = String(value).trim()
  
  // Remove extra whitespace and normalize
  return str
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
    .trim()
}

// Normalize column names for matching
export function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_") // Replace spaces with underscores
    .replace(/[^\w\u0600-\u06FF_]/g, "") // Keep only letters, numbers, underscores, and Arabic characters
    .replace(/^_+|_+$/g, "") // Remove leading/trailing underscores
}

// Enhanced KEY_MAP for Baccalaureate data structure
export const KEY_MAP: Record<keyof Student, Set<string>> = {
  NODOSS: new Set([
    'nodoss', 'رقم_الملف', 'numero_dossier', 'dossier_number', 'رقم_ملف',
    'num_dossier', 'dossier_id', 'student_id', 'رقم_طالب'
  ]),
  
  SERIE: new Set([
    'serie', 'السلسلة', 'series', 'section', 'شعبة', 'فرع',
    'stream', 'branch', 'specialization', 'تخصص'
  ]),
  
  TYPEC: new Set([
    'typec', 'النوع', 'type', 'category', 'صنف', 'فئة',
    'classification', 'group', 'مجموعة'
  ]),
  
  NOM_FR: new Set([
    'nom_fr', 'الاسم_فرنسية', 'name_french', 'nom_francais',
    'french_name', 'nom_latin', 'اسم_فرنسي', 'اسم_لاتيني'
  ]),
  
  NOM_AR: new Set([
    'nom_ar', 'الاسم_عربية', 'name_arabic', 'nom_arabe',
    'arabic_name', 'اسم_عربي', 'الاسم_العربي', 'اسم'
  ]),
  
  DATN: new Set([
    'datn', 'تاريخ_الميلاد', 'date_naissance', 'birth_date',
    'date_of_birth', 'dob', 'تاريخ_ولادة', 'ميلاد'
  ]),
  
  LIEUN_FR: new Set([
    'lieun_fr', 'مكان_الميلاد_فرنسية', 'lieu_naissance_fr', 'birthplace_french',
    'place_of_birth_fr', 'مكان_ولادة_فرنسي', 'محل_الميلاد_فرنسي'
  ]),
  
  LIEUN_AR: new Set([
    'lieun_ar', 'مكان_الميلاد_عربية', 'lieu_naissance_ar', 'birthplace_arabic',
    'place_of_birth_ar', 'مكان_ولادة_عربي', 'محل_الميلاد', 'مكان_الميلاد'
  ]),
  
  Moy_Bac: new Set([
    'moy_bac', 'معدل_البكالوريا', 'moyenne_bac', 'bac_average',
    'baccalaureate_average', 'معدل_عام', 'المعدل', 'moyenne',
    'average', 'نتيجة', 'درجة'
  ]),
  
  Decision: new Set([
    'decision', 'القرار', 'resultat', 'result', 'النتيجة',
    'status', 'الحالة', 'verdict', 'outcome', 'حكم'
  ]),
  
  Wilaya_FR: new Set([
    'wilaya_fr', 'الولاية_فرنسية', 'province_french', 'wilaya_french',
    'state_fr', 'ولاية_فرنسي', 'محافظة_فرنسية'
  ]),
  
  Wilaya_AR: new Set([
    'wilaya_ar', 'الولاية_عربية', 'province_arabic', 'wilaya_arabic',
    'state_ar', 'ولاية_عربي', 'الولاية', 'ولاية', 'محافظة'
  ]),
  
  Centre_Ex: new Set([
    'centre_ex', 'مركز_الامتحان', 'exam_center', 'centre_examen',
    'test_center', 'مركز_اختبار', 'مركز_تقييم', 'centre'
  ]),
  
  Etablissement: new Set([
    'etablissement', 'المؤسسة', 'school', 'institution',
    'مدرسة', 'ثانوية', 'lycee', 'college', 'معهد'
  ]),
  
  Etablissement_AR: new Set([
    'etablissement_ar', 'المؤسسة_عربية', 'school_arabic', 'institution_arabic',
    'مدرسة_عربي', 'ثانوية_عربي', 'معهد_عربي', 'مؤسسة_تعليمية'
  ])
}

// Validate and parse numeric values (for scores and IDs)
export function parseNumericValue(value: unknown): number {
  if (typeof value === 'number') return value
  
  const str = String(value).trim()
  if (!str) return 0
  
  // Handle different decimal separators and clean numeric values
  const cleaned = str
    .replace(/[,،]/g, ".") // Replace Arabic and French commas with dots
    .replace(/[^\d.-]/g, "") // Remove non-numeric characters except dots and minus
    .replace(/\.+/g, ".") // Replace multiple dots with single dot
  
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

// Validate date format and convert to standardized format
export function parseDate(value: unknown): string {
  if (!value) return ""
  
  const str = String(value).trim()
  if (!str) return ""
  
  // Try to parse various date formats
  const datePatterns = [
    /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/, // DD/MM/YYYY or DD-MM-YYYY
    /^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/, // YYYY/MM/DD or YYYY-MM-DD
    /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2})$/,  // DD/MM/YY or DD-MM-YY
  ]
  
  for (const pattern of datePatterns) {
    const match = str.match(pattern)
    if (match) {
      let day, month, year
      
      if (pattern === datePatterns[1]) { // YYYY/MM/DD format
        [, year, month, day] = match
      } else if (pattern === datePatterns[2]) { // DD/MM/YY format
        [, day, month, year] = match
        year = parseInt(year) < 50 ? `20${year}` : `19${year}` // Assume 00-49 is 2000s, 50-99 is 1900s
      } else { // DD/MM/YYYY format
        [, day, month, year] = match
      }
      
      // Validate ranges
      const dayNum = parseInt(day)
      const monthNum = parseInt(month)
      const yearNum = parseInt(year)
      
      if (dayNum >= 1 && dayNum <= 31 && monthNum >= 1 && monthNum <= 12 && yearNum >= 1900) {
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
      }
    }
  }
  
  return str // Return original if no pattern matches
}

// Validate and clean text fields
export function cleanTextField(value: unknown): string {
  const cleaned = clean(value)
  
  // Additional cleaning for name fields
  return cleaned
    .replace(/\s+/g, " ") // Normalize spaces
    .replace(/[^\w\s\u0600-\u06FF'.-]/g, "") // Keep only letters, numbers, spaces, and basic punctuation
    .trim()
}

// Generate statistics from student data
export function generateStatistics(students: Student[]) {
  if (!students.length) {
    return {
      totalStudents: 0,
      admittedCount: 0,
      rejectedCount: 0,
      averageScore: 0,
      topScore: 0,
      bottomScore: 0,
      seriesDistribution: {},
      wilayaDistribution: {},
      decisionDistribution: {},
    }
  }

  const validScores = students
    .map(s => s.Moy_Bac)
    .filter(score => score > 0)

  const seriesDistribution: Record<string, number> = {}
  const wilayaDistribution: Record<string, number> = {}
  const decisionDistribution: Record<string, number> = {}

  students.forEach(student => {
    // Series distribution
    if (student.SERIE) {
      seriesDistribution[student.SERIE] = (seriesDistribution[student.SERIE] || 0) + 1
    }

    // Wilaya distribution
    const wilaya = student.Wilaya_AR || student.Wilaya_FR
    if (wilaya) {
      wilayaDistribution[wilaya] = (wilayaDistribution[wilaya] || 0) + 1
    }

    // Decision distribution
    if (student.Decision) {
      decisionDistribution[student.Decision] = (decisionDistribution[student.Decision] || 0) + 1
    }
  })

  const admittedCount = students.filter(s => 
    s.Decision && (s.Decision.toLowerCase().includes('admis') || s.Decision.toLowerCase().includes('نجح'))
  ).length

  return {
    totalStudents: students.length,
    admittedCount,
    rejectedCount: students.length - admittedCount,
    averageScore: validScores.length ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0,
    topScore: validScores.length ? Math.max(...validScores) : 0,
    bottomScore: validScores.length ? Math.min(...validScores) : 0,
    seriesDistribution,
    wilayaDistribution,
    decisionDistribution,
  }
}

// Export students data to different formats
export function exportStudentsData(students: Student[], format: 'csv' | 'excel' = 'csv'): string | Blob {
  if (format === 'csv') {
    const headers = [
      'رقم الملف', 'السلسلة', 'النوع', 'الاسم (فرنسي)', 'الاسم (عربي)',
      'تاريخ الميلاد', 'مكان الميلاد (فرنسي)', 'مكان الميلاد (عربي)',
      'معدل البكالوريا', 'القرار', 'الولاية (فرنسي)', 'الولاية (عربي)',
      'مركز الامتحان', 'المؤسسة', 'المؤسسة (عربي)'
    ]

    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.NODOSS,
        `"${student.SERIE}"`,
        `"${student.TYPEC}"`,
        `"${student.NOM_FR}"`,
        `"${student.NOM_AR}"`,
        `"${student.DATN}"`,
        `"${student.LIEUN_FR}"`,
        `"${student.LIEUN_AR}"`,
        student.Moy_Bac,
        `"${student.Decision}"`,
        `"${student.Wilaya_FR}"`,
        `"${student.Wilaya_AR}"`,
        `"${student.Centre_Ex}"`,
        `"${student.Etablissement}"`,
        `"${student.Etablissement_AR}"`
      ].join(','))
    ].join('\n')

    return csvContent
  }

  // For Excel format, you would need additional libraries like xlsx
  throw new Error('Excel export not implemented yet')
}