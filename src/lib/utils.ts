
// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'ممتاز';
  if (percentage >= 80) return 'جيد جداً';
  if (percentage >= 70) return 'جيد';
  if (percentage >= 60) return 'مقبول';
  return 'راسب';
}

export function getSuccessMessage(percentage: number, studentName: string): string {
  const messages = [
    `🎉 مبارك ${studentName}! لقد حققت نجاحاً باهراً بنسبة ${percentage}%`,
    `🌟 تهانينا ${studentName}! أثبتت جدارتك وحصلت على ${percentage}%`,
    `🎊 ألف مبارك ${studentName}! نجحت بتفوق وحصلت على ${percentage}%`,
    `🏆 أحسنت ${studentName}! نجاحك المستحق بنسبة ${percentage}%`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getFailureMessage(percentage: number, studentName: string): string {
  const messages = [
    `💙 لا تيأس ${studentName}، النجاح ينتظرك في المحاولة القادمة. حصلت على ${percentage}%`,
    `🌸 ${studentName}، كل عثرة لها نهوض. ستنجح في المرة القادمة إن شاء الله`,
    `🌱 ${studentName}، هذه بداية جديدة وليس نهاية. العام القادم سيكون أفضل`,
    `💪 ${studentName}، لا تستسلم أبداً. النجاح يحتاج صبر ومثابرة`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

