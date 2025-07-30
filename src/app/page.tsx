import { createClient } from "@/utils/supabase/server";
import StudentResultsApp from "@/components/student-results-app";

// تحديد نوع للبيانات التي تتوقعها من قاعدة البيانات
interface Student {
  id: number;
  name: string;
  // أضف الحقول الأخرى التي تتوقعها هنا
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // تحميل بيانات المستخدم إذا كان مسجلًا
  let savedStudents: Student[] = [];

  if (user) {
    const { data, error } = await supabase
      .from("students_data")
      .select("*")
      .eq("user_id", user.id);

    if (!error) {
      savedStudents = data || [];
    }
  }

  return <StudentResultsApp user={user} />;
}
