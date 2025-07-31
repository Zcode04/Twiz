"use client"

import FileUploadSection from "@/components/file-upload-section"
import GeneralStatisticsDisplay from "@/components/general-statistics-display"
import { useStudentData } from "@/components/student-data-provider"

export default function HomePage() {
  const { students, processing, handleFileUpload, user } = useStudentData()

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
      <FileUploadSection
        processing={processing}
        handleFileUpload={handleFileUpload}
        user={user}
        studentsCount={students.length}
      />
      <GeneralStatisticsDisplay students={students} />
    </div>
  )
}
