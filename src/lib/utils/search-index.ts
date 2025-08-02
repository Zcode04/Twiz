import { Student } from '@/lib/types';

export class SearchIndex {
  private records: Student[] = [];

  constructor(students: Student[]) {
    this.records = students;
  }

  /** Full-text search across Arabic & French names, birthplace, school, etc. */
  search(query: string): Student[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return this.records.filter(
      (s) =>
        s.NOM_FR.toLowerCase().includes(q) ||
        s.NOM_AR.includes(q) ||
        s.LIEUN_FR.toLowerCase().includes(q) ||
        s.LIEUN_AR.includes(q) ||
        s.Wilaya_FR.toLowerCase().includes(q) ||
        s.Wilaya_AR.includes(q) ||
        String(s.NODOSS).includes(q)
    );
  }

  /** Lookup by dossier number (unique ID). */
  getById(nodoss: number): Student | null {
    return this.records.find((s) => s.NODOSS === nodoss) ?? null;
  }
}