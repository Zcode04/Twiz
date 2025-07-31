"use client"

import type { Student } from "@/lib/types"

interface GeneralStatisticsDisplayProps {
  students: Student[]
}

export default function GeneralStatisticsDisplay({ students }: GeneralStatisticsDisplayProps) {
  if (students.length === 0) return null

  const successfulStudents = students.filter(
    (s) =>
      s.Decision.toLowerCase().includes("admis") || s.Decision.toLowerCase().includes("ناجح") || s.Moyenne_Bepc >= 10,
  ).length

  const averageMoyenne =
    students.length > 0 ? (students.reduce((sum, s) => sum + s.Moyenne_Bepc, 0) / students.length).toFixed(2) : "0.00"

  return (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="text-center">
          <p className="text-3xl font-bold text-white mb-2">{students.length.toLocaleString("ar")}</p>
          <p className="text-white/70">إجمالي الطلاب</p>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-400 mb-2">{successfulStudents.toLocaleString("ar")}</p>
          <p className="text-white/70">الناجحون</p>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <div className="text-center">
          <p className="text-3xl font-bold text-blue-400 mb-2">{averageMoyenne}</p>
          <p className="text-white/70">المعدل العام</p>
        </div>
      </div>
    </div>
  )
}
