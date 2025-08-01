"use client"

import { UserIcon, MapPin, Calendar, School, CheckCircle, XCircle, Download } from "lucide-react"
import { useRef } from "react"
import type { Student } from "@/lib/types"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface StudentDetailsDisplayProps {
  selectedStudent: Student
  logoUrl?: string // URL للشعار
}

export default function StudentDetailsDisplay({ selectedStudent, logoUrl }: StudentDetailsDisplayProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // التحقق من وجود بيانات الطالب
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

  // دالة تحويل البطاقة إلى صورة
  const downloadAsImage = async () => {
    if (!cardRef.current) return
    try {
      // إستيراد html2canvas بشكل ديناميكي
      const html2canvas = (await import("html2canvas")).default
      // إخفاء أزرار التحكم مؤقتاً
      const buttons = cardRef.current.querySelector(".action-buttons")
      if (buttons) {
        ;(buttons as HTMLElement).style.display = "none"
      }
      // تحويل العنصر إلى canvas مع إعدادات محسنة
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // جودة أعلى
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          // تجاهل العناصر التي قد تسبب مشاكل
          return element.classList?.contains("action-buttons") || false
        },
        onclone: (clonedDoc) => {
          // تحويل الألوان المعقدة إلى ألوان بسيطة في النسخة المستنسخة
          const clonedElement = clonedDoc.querySelector("[data-html2canvas-ignore]")
          if (clonedElement) {
            clonedElement.remove()
          }
          // استبدال التدرجات المعقدة بألوان صلبة إذا لزم الأمر
          const gradientElements = clonedDoc.querySelectorAll('[style*="gradient"]')
          gradientElements.forEach((el) => {
            const element = el as HTMLElement
            if (element.style.background?.includes("lab(") || element.style.background?.includes("oklch(")) {
              element.style.background = "#3b82f6" // لون أزرق بسيط
            }
          })
        },
      })
      // إظهار الأزرار مرة أخرى
      if (buttons) {
        ;(buttons as HTMLElement).style.display = "flex"
      }
      // تحويل إلى صورة وتنزيلها
      const link = document.createElement("a")
      link.download = `نتيجة_${selectedStudent?.NOM || "طالب"}_${selectedStudent?.Num_Bepc || "غير_محدد"}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.9)
      link.click()
    } catch (error) {
      console.error("خطأ في تحويل البطاقة إلى صورة:", error)
      alert("حدث خطأ في تحويل البطاقة إلى صورة. يرجى المحاولة مرة أخرى.")
    }
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
        style={{ background: "linear-gradient(to right, #2563eb, #7c3aed, #059669)" }}
      >
        {/* الشعار */}
        {logoUrl && (
          <div className="absolute top-4 right-4">
            <Image src={logoUrl || "/placeholder.svg"} width={100} height={100} alt="Logo" className="rounded-full" />
          </div>
        )}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-1">{selectedStudent?.NOM || "اسم الطالب"}</h2>
            <p className="text-lg" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
              رقم الطالب: {selectedStudent?.Num_Bepc || "غير محدد"}
            </p>
            <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>{selectedStudent?.WILAYA || "الولاية"}</p>
          </div>
        </div>
      </div>
      <div className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* المعلومات الشخصية */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-blue-200 pb-2">المعلومات الشخصية</h3>
            <div className="space-y-4">
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "linear-gradient(to right, #eff6ff, #eef2ff)", borderColor: "#bfdbfe" }}
              >
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">تاريخ الميلاد</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent?.DATE_NAISS || "غير محدد"}</p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "linear-gradient(to right, #fdf4ff, #fdf2f8)", borderColor: "#d8b4fe" }}
              >
                <MapPin className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">مكان الميلاد</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent?.LIEU_NAISS || "غير محدد"}</p>
                </div>
              </div>
            </div>
          </div>
          {/* المعلومات الأكاديمية */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-green-200 pb-2">المعلومات الأكاديمية</h3>
            <div className="space-y-4">
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "linear-gradient(to right, #f0fdf4, #ecfdf5)", borderColor: "#bbf7d0" }}
              >
                <School className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">المدرسة</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent?.Ecole || "غير محدد"}</p>
                </div>
              </div>
              <div
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ background: "linear-gradient(to right, #fffbeb, #fef3c7)", borderColor: "#fcd34d" }}
              >
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">مركز الامتحان</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedStudent?.Centre || "غير محدد"}</p>
                </div>
              </div>
            </div>
          </div>
          {/* النتيجة */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 border-b-2 border-yellow-200 pb-2">النتيجة النهائية</h3>
            <div
              className="rounded-2xl p-6 border-2 shadow-lg"
              style={{ background: "linear-gradient(135deg, #eff6ff, #faf5ff, #f0fdf4)", borderColor: "#bfdbfe" }}
            >
              <div className="text-center space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">المعدل العام</p>
                  <p className="text-5xl font-bold text-blue-600 mb-2">
                    {selectedStudent?.Moyenne_Bepc?.toFixed(2) || "0.00"}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${Math.min(((selectedStudent?.Moyenne_Bepc || 0) / 20) * 100, 100)}%`,
                        background: "linear-gradient(to right, #60a5fa, #34d399)",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {selectedStudent?.Decision?.toLowerCase().includes("admis") ||
                  selectedStudent?.Decision?.toLowerCase().includes("ناجح") ? (
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
                        <p className="text-2xl font-bold text-red-600">مافيه لك خير</p>
                        <p className="text-sm text-red-500">عوضك لله خيرا منها </p>
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
            <h4 className="font-semibold text-gray-900 mb-4">تفاصيل إضافية</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">الولاية:</span>
                <span className="font-medium">{selectedStudent?.WILAYA || "غير محدد"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">المركز:</span>
                <span className="font-medium">{selectedStudent?.Centre || "غير محدد"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">القرار:</span>
                <span
                  className={cn(
                    "font-medium",
                    selectedStudent?.Decision?.toLowerCase().includes("admis") ||
                      selectedStudent?.Decision?.toLowerCase().includes("ناجح")
                      ? "text-green-600"
                      : "text-red-600",
                  )}
                >
                  {selectedStudent?.Decision || "غير محدد"}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-6 border" style={{ backgroundColor: "#f9fafb", borderColor: "#e5e7eb" }}>
            <h4 className="font-semibold text-gray-900 mb-4">إحصائيات سريعة</h4>
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
                    (selectedStudent?.Moyenne_Bepc || 0) >= 10 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {(selectedStudent?.Moyenne_Bepc || 0) >= 10 ? "+" : ""}
                  {((selectedStudent?.Moyenne_Bepc || 0) - 10).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">النسبة المئوية:</span>
                <span className="font-medium">{(((selectedStudent?.Moyenne_Bepc || 0) / 20) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
        {/* أزرار التحكم */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center action-buttons">
          <button
            onClick={downloadAsImage}
            className="text-white px-8 py-4 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3"
            style={{ background: "linear-gradient(to right, #4f46e5, #2563eb)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #4338ca, #1d4ed8)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(to right, #4f46e5, #2563eb)"
            }}
          >
            <Download className="w-5 h-5" />
            تحميل كصورة
          </button>
        </div>
      </div>
      {/* Footer مع الشعار */}
      {logoUrl && (
        <div className="p-4 border-t border-gray-200 text-center">
          <Image src={logoUrl || "/placeholder.svg"} width={100} height={100} alt="Logo" className="rounded-full" />
        </div>
      )}
    </div>
  )
}
