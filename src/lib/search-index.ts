// lib/search-index.ts
import type { Student } from "./types"

// مؤشر البحث المحسن
export class SearchIndex {
  private byId = new Map<number, Student>()
  private byName = new Map<string, Student[]>()
  private nameTokens = new Map<string, Set<number>>()

  constructor(students: Student[]) {
    this.buildIndex(students)
  }

  private buildIndex(students: Student[]) {
    students.forEach((student) => {
      // فهرسة بالرقم
      if (student.Num_Bepc) {
        this.byId.set(student.Num_Bepc, student)
      }
      // فهرسة بالاسم
      const nameKey = student.NOM.toLowerCase()
      if (!this.byName.has(nameKey)) {
        this.byName.set(nameKey, [])
      }
      this.byName.get(nameKey)!.push(student)
      // فهرسة الرموز المميزة للبحث السريع
      const tokens = nameKey.split(/\s+/)
      tokens.forEach((token) => {
        if (token.length > 1) {
          if (!this.nameTokens.has(token)) {
            this.nameTokens.set(token, new Set())
          }
          this.nameTokens.get(token)!.add(student.Num_Bepc)
        }
      })
    })
  }

  search(query: string): Student[] {
    const qTrim = query.trim()
    if (!qTrim) return []

    const qLow = qTrim.toLowerCase()
    const qNum = Number(qTrim)
    const results = new Set<Student>()

    // البحث بالرقم أولاً
    if (!isNaN(qNum) && qNum !== 0) {
      const student = this.byId.get(qNum)
      if (student) results.add(student)
    }

    // البحث بالاسم
    if (isNaN(qNum) || qNum === 0) {
      // البحث في الرموز المميزة
      for (const [token, ids] of this.nameTokens) {
        if (token.includes(qLow)) {
          ids.forEach((id) => {
            const student = this.byId.get(id)
            if (student) results.add(student)
          })
        }
      }
      // البحث في الأسماء الكاملة
      for (const [name, students] of this.byName) {
        if (name.includes(qLow)) {
          students.forEach((student) => results.add(student))
        }
      }
    }
    return Array.from(results).slice(0, 20) // حد أقصى 20 نتيجة
  }

  getById(id: number): Student | null {
    return this.byId.get(id) || null
  }
}
