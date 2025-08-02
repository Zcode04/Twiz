"use client"

import { UserIcon, MapPin, Calendar, School, CheckCircle, XCircle, Download } from "lucide-react"
import { useRef } from "react"
import type { Student } from "@/lib/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface StudentDetailsDisplayProps {
  selectedStudent: Student
  logoUrl?: string
}

export default function StudentDetailsDisplay({ selectedStudent, logoUrl }: StudentDetailsDisplayProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  if (!selectedStudent) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-4xl mx-auto">
        <div className="text-gray-500">
          <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold mb-2">لا توجد بيانات طالب</h3>
          <p>يرجى اختيار طالب لعرض تفاصيله</p>
        </div>
      </div>
    )
  }

  const downloadAsImage = async () => {
    if (!cardRef.current) return
    try {
      const html2canvas = (await import("html2canvas")).default
      const buttons = cardRef.current.querySelector(".action-buttons")
      if (buttons) (buttons as HTMLElement).style.display = "none"

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      if (buttons) (buttons as HTMLElement).style.display = "flex"

      const link = document.createElement("a")
      link.download = `نتيجة_${selectedStudent.NOM_FR || "طالب"}_${selectedStudent.NODOSS}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.9)
      link.click()
    } catch (error) {
      console.error("خطأ في تحويل البطاقة إلى صورة:", error)
      alert("حدث خطأ في تحويل البطاقة إلى صورة. يرجى المحاولة مرة أخرى.")
    }
  }

  // دالة مساعدة لتحديد لون القرار
  const getDecisionColor = (decision: string) => {
    const normalized = decision?.toLowerCase()
    if (normalized?.includes("admis") || normalized?.includes("ناجح") || normalized?.includes("reçu")) {
      return "text-green-600"
    }
    return "text-red-600"
  }

  const getDecisionText = (decision: string) => {
    const normalized = decision?.toLowerCase()
    if (normalized?.includes("admis") || normalized?.includes("ناجح") || normalized?.includes("reçu")) {
      return "ناجح"
    }
    return "غير ناجح"
  }

  return (
    <div
      ref={cardRef}
      className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl mx-auto"
      style={{ colorScheme: "light" }}
    >
      {/* Header مع الشعار */}
      <div
        className="text-white p-8 relative"
        style={{ 
          background: "linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #059669 100%)",
          fontFamily: "'Tajawal', sans-serif"
        }}
      >
        {logoUrl && (
          <div className="absolute top-4 right-4">
            <Image 
              src={logoUrl} 
              width={80} 
              height={80} 
              alt="Logo" 
              className="rounded-full object-cover"
            />
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-white/20">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">
              {selectedStudent.NOM_AR || selectedStudent.NOM_FR || "اسم الطالب"}
            </h2>
            <p className="text-lg opacity-90">
              رقم الملف: {selectedStudent.NODOSS}
            </p>
            <p className="opacity-75">{selectedStudent.Wilaya_AR || selectedStudent.Wilaya_FR}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* المعلومات الشخصية */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-200 pb-2 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              المعلومات الشخصية
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">تاريخ الميلاد</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.DATN || "غير محدد"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">مكان الميلاد</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedStudent.LIEUN_AR || selectedStudent.LIEUN_FR || "غير محدد"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* المعلومات الأكاديمية */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-green-200 pb-2 flex items-center gap-2">
              <School className="w-5 h-5" />
              المعلومات الأكاديمية
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <School className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">المؤسسة</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedStudent.Etablissement_AR || selectedStudent.Etablissement || "غير محدد"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">مركز الامتحان</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent.Centre_Ex || "غير محدد"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* النتيجة */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-yellow-200 pb-2">النتيجة النهائية</h3>
            <div className="rounded-2xl p-6 border-2 shadow-lg bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 border-blue-200">
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">معدل البكالوريا</p>
                  <p className="text-5xl font-bold text-blue-600 mb-2">
                    {selectedStudent.Moy_Bac?.toFixed(2) || "0.00"}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(((selectedStudent.Moy_Bac || 0) / 20) * 100, 100)}%`,
                        background: "linear-gradient(to right, #3b82f6, #10b981)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {getDecisionText(selectedStudent.Decision) === "ناجح" ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">ناجح</p>
                        <p className="text-sm text-green-500">مبروك النجاح!</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-red-100 p-2 rounded-full">
                        <XCircle className="w-8 h-8 text-red-600" />
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">غير ناجح</p>
                        <p className="text-sm text-red-500">نتمنى لك التوفيق في المرة القادمة</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* معلومات إضافية */}
        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              تفاصيل إضافية
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">الولاية:</span>
                <span className="font-medium">{selectedStudent.Wilaya_AR || selectedStudent.Wilaya_FR || "غير محدد"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">السلسلة:</span>
                <span className="font-medium">{selectedStudent.SERIE || "غير محدد"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">القرار:</span>
                <span className={cn("font-medium", getDecisionColor(selectedStudent.Decision))}>
                  {selectedStudent.Decision || "غير محدد"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 border bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              إحصائيات سريعة
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">المعدل المطلوب:</span>
                <span className="font-medium">10.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الفرق:</span>
                <span
                  className={cn(
                    "font-medium",
                    (selectedStudent.Moy_Bac || 0) >= 10 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {(selectedStudent.Moy_Bac || 0) >= 10 ? "+" : ""}
                  {((selectedStudent.Moy_Bac || 0) - 10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">النسبة المئوية:</span>
                <span className="font-medium">{(((selectedStudent.Moy_Bac || 0) / 20) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center action-buttons">
          <button
            onClick={downloadAsImage}
            className="text-white px-8 py-4 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Download className="w-5 h-5" />
            تحميل كصورة
          </button>
        </div>
      </div>

      {logoUrl && (
        <div className="p-4 border-t border-gray-200 text-center bg-gray-50">
          <Image 
            src={logoUrl} 
            width={60} 
            height={60} 
            alt="Logo" 
            className="rounded-full mx-auto"
          />
        </div>
      )}
    </div>
  )
}