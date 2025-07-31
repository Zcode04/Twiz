// lib/excel-utils.ts

// تحسين دالة التنظيف
export const clean = (txt: unknown): string => {
  if (txt == null) return ""
  const str = String(txt).trim()
  return str.length > 50 ? `${str.substring(0, 50)}...` : str
}

// تحسين دالة تطبيع المفاتيح مع ذاكرة تخزين مؤقت
export const normalizeKey = (() => {
  const cache = new Map<string, string>()
  return (k: string): string => {
    if (cache.has(k)) return cache.get(k)!
    const normalized = String(k)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
    cache.set(k, normalized)
    return normalized
  }
})()

// خريطة المفاتيح المحسنة
export const KEY_MAP = {
  Num_Bepc: new Set(["num_bepc", "رقم_الطالب", "رقم", "code", "id", "numero", "number"]),
  NOM: new Set(["nom", "الاسم", "اسم_الطالب", "name", "student_name", "full_name"]),
  LIEU_NAISS: new Set(["lieu_naiss", "lieu_nais", "مكان_الميلاد", "مكان_الولادة", "birth_place", "place_of_birth"]),
  DATE_NAISS: new Set(["date_naiss", "تاريخ_الميلاد", "تاريخ_الولادة", "dob", "birth_date", "date_of_birth"]),
  WILAYA: new Set(["wilaya", "الولاية", "province", "state", "region"]),
  Ecole: new Set(["ecole", "المدرسة", "school", "institution", "etablissement"]),
  Centre: new Set(["centre", "المركز", "center", "exam_center", "centre_examen"]),
  Moyenne_Bepc: new Set(["moyenne_bepc", "المعدل", "moyenne", "average", "grade", "score", "note"]),
  Decision: new Set(["decision", "القرار", "result", "status", "resultat", "outcome"]),
} as const // Use as const for better type inference
