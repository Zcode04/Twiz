// lib/search-index.ts
import type { Student } from "./types"

/**
 * مؤشر بحث متقدم للطلاب
 * يدعم البحث برقم الملف (NODOSS) أو الاسم (عربي/فرنسي)
 */
export class SearchIndex {
  private byId = new Map<number, Student>()
  private byNameFr = new Map<string, Student[]>()
  private byNameAr = new Map<string, Student[]>()
  private nameTokensFr = new Map<string, Set<number>>()
  private nameTokensAr = new Map<string, Set<number>>()

  constructor(students: Student[]) {
    this.buildIndex(students)
  }

  private buildIndex(students: Student[]) {
    students.forEach((student) => {
      // 1. فهرسة بالرقم (NODOSS)
      if (student.NODOSS) {
        this.byId.set(student.NODOSS, student)
      }

      // 2. فهرسة الاسم الفرنسي
      const nameFr = student.NOM_FR?.toLowerCase().trim() || ''
      if (nameFr) {
        if (!this.byNameFr.has(nameFr)) {
          this.byNameFr.set(nameFr, [])
        }
        this.byNameFr.get(nameFr)!.push(student)
        
        // رموز الاسم الفرنسي
        const tokensFr = nameFr.split(/\s+/)
        tokensFr.forEach((token) => {
          if (token.length > 1) {
            if (!this.nameTokensFr.has(token)) {
              this.nameTokensFr.set(token, new Set())
            }
            this.nameTokensFr.get(token)!.add(student.NODOSS)
          }
        })
      }

      // 3. فهرسة الاسم العربي
      const nameAr = student.NOM_AR?.trim() || ''
      if (nameAr) {
        const nameArLower = nameAr.toLowerCase()
        if (!this.byNameAr.has(nameArLower)) {
          this.byNameAr.set(nameArLower, [])
        }
        this.byNameAr.get(nameArLower)!.push(student)
        
        // رموز الاسم العربي
        const tokensAr = nameAr.split(/\s+/)
        tokensAr.forEach((token) => {
          if (token.length > 1) {
            const tokenLower = token.toLowerCase()
            if (!this.nameTokensAr.has(tokenLower)) {
              this.nameTokensAr.set(tokenLower, new Set())
            }
            this.nameTokensAr.get(tokenLower)!.add(student.NODOSS)
          }
        })
      }
    })
  }

  /**
   * البحث المتقدم
   * @param query نص البحث (رقم أو اسم)
   * @returns مصفوفة من الطلاب المطابقين (حد أقصى 20)
   */
  search(query: string): Student[] {
    const qTrim = query.trim()
    if (!qTrim) return []

    const qLow = qTrim.toLowerCase()
    const qNum = Number(qTrim)
    const results = new Set<Student>()

    // 1. البحث بالرقم (NODOSS)
    if (!isNaN(qNum) && qNum > 0) {
      const student = this.byId.get(qNum)
      if (student) results.add(student)
    }

    // 2. البحث بالاسم (فرنسي أو عربي)
    if (isNaN(qNum) || qNum <= 0) {
      // أ. البحث في الرموز المميزة (فرنسي)
      for (const [token, ids] of this.nameTokensFr) {
        if (token.includes(qLow)) {
          ids.forEach((id) => {
            const student = this.byId.get(id)
            if (student) results.add(student)
          })
        }
      }

      // ب. البحث في الرموز المميزة (عربي)
      for (const [token, ids] of this.nameTokensAr) {
        if (token.includes(qLow)) {
          ids.forEach((id) => {
            const student = this.byId.get(id)
            if (student) results.add(student)
          })
        }
      }

      // ج. البحث في الأسماء الكاملة
      for (const [name, students] of this.byNameFr) {
        if (name.includes(qLow)) {
          students.forEach((student) => results.add(student))
        }
      }

      for (const [name, students] of this.byNameAr) {
        if (name.includes(qLow)) {
          students.forEach((student) => results.add(student))
        }
      }
    }

    // 3. ترتيب النتائج: المطابقات الكاملة أولاً
    const sorted = Array.from(results)
    sorted.sort((a, b) => {
      const aName = (a.NOM_AR || a.NOM_FR).toLowerCase()
      const bName = (b.NOM_AR || b.NOM_FR).toLowerCase()
      
      if (aName === qLow) return -1
      if (bName === qLow) return 1
      
      return aName.localeCompare(bName, 'ar')
    })

    return sorted.slice(0, 20)
  }

  /**
   * الحصول على طالب بواسطة رقم الملف
   * @param id رقم الملف (NODOSS)
   * @returns الطالب أو null
   */
  getById(id: number): Student | null {
    return this.byId.get(id) || null
  }

  /**
   * الحصول على عدد الطلاب المفهرسين
   */
  get count(): number {
    return this.byId.size
  }
}