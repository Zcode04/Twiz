"use client"

import SearchInputAndResults from "@/components/search-input-and-results"
import StudentDetailsDisplay from "@/components/student-details-display"
import { useStudentData } from "@/components/student-data-provider"

export default function SearchPage() {
  const { students, searchQuery, setSearchQuery, searchResults, selectedStudent, highlightText } = useStudentData()

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8 border border-white/20">
        <SearchInputAndResults
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          selectedStudent={selectedStudent}
          highlightText={highlightText}
          studentsCount={students.length}
        />
      </div>
      {selectedStudent && (
        <div className="mt-8">
          <StudentDetailsDisplay selectedStudent={selectedStudent} />
        </div>
      )}
    </>
  )
}
