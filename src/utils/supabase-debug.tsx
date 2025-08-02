"use client"
import { createClient } from "@/lib/supabase-browser"

// دالة مساعدة لفحص قاعدة البيانات وحل المشاكل
export async function debugSupabaseData(userId?: string) {
  const supabase = createClient()

  console.log("🔍 فحص قاعدة البيانات...")

  try {
    // فحص الجداول المطلوبة
    const tables = ["bac_students_data", "user_files", "public_files", "public_students_data"]

    for (const table of tables) {
      console.log(`📋 فحص جدول: ${table}`)

      const { data, error, count } = await supabase.from(table).select("*", { count: "exact" }).limit(1)

      if (error) {
        console.error(`❌ خطأ في جدول ${table}:`, error)
      } else {
        console.log(`✅ جدول ${table} يعمل بشكل صحيح - العدد: ${count}`)
        if (data && data.length > 0) {
          console.log(`📄 مثال على البيانات في ${table}:`, data[0])
        }
      }
    }

    // فحص بيانات المستخدم الحالي
    if (userId) {
      console.log(`👤 فحص بيانات المستخدم: ${userId}`)

      const { data: userData, error: userError } = await supabase
        .from("bac_students_data")
        .select("*")
        .eq("user_id", userId)
        .limit(5)

      if (userError) {
        console.error("❌ خطأ في تحميل بيانات المستخدم:", userError)
      } else {
        console.log(`✅ بيانات المستخدم تم العثور عليها: ${userData?.length || 0} سجل`)
        if (userData && userData.length > 0) {
          console.log("📄 مثال على بيانات المستخدم:", userData[0])
        }
      }

      // فحص ملفات المستخدم
      const { data: userFiles, error: filesError } = await supabase.from("user_files").select("*").eq("user_id", userId)

      if (filesError) {
        console.error("❌ خطأ في تحميل ملفات المستخدم:", filesError)
      } else {
        console.log(`✅ ملفات المستخدم: ${userFiles?.length || 0} ملف`)
        if (userFiles && userFiles.length > 0) {
          console.log("📄 ملفات المستخدم:", userFiles)
        }
      }
    }

    // فحص الاتصال العام
    const { data: authData } = await supabase.auth.getUser()
    console.log("🔐 حالة المصادقة:", authData.user ? "مسجل الدخول" : "غير مسجل")
  } catch (error) {
    console.error("💥 خطأ عام في فحص قاعدة البيانات:", error)
  }
}

// مكون لإضافة زر الفحص في واجهة المستخدم (للاختبار)
export function DebugButton({ userId }: { userId?: string }) {
  return (
    <button
      onClick={() => debugSupabaseData(userId)}
      className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg text-xs z-50"
    >
      🔍 فحص قاعدة البيانات
    </button>
  )
}
