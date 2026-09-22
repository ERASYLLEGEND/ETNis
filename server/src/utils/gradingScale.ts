export type LetterGrade = 'A*' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';

export interface GradeThresholds {
  gradeAStar: number; // Percentage, default 90% -> 54 pts
  gradeA: number;     // Percentage, default 80% -> 48 pts
  gradeB: number;     // Percentage, default 70% -> 42 pts
  gradeC: number;     // Percentage, default 55% -> 33 pts
  gradeD: number;     // Percentage, default 40% -> 24 pts
  gradeE: number;     // Percentage, default 25% -> 15 pts
}

export const DEFAULT_THRESHOLDS: GradeThresholds = {
  gradeAStar: 90,
  gradeA: 80,
  gradeB: 70,
  gradeC: 55,
  gradeD: 40,
  gradeE: 25,
};

/**
 * Calculates letter grade based on total score (out of 60 by default)
 */
export function calculateNISGrade(
  totalScore: number,
  maxScore: number = 60,
  thresholds: GradeThresholds = DEFAULT_THRESHOLDS
): {
  percentage: number;
  letterGrade: LetterGrade;
  description: string;
  badgeClass: string;
} {
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  if (percentage >= thresholds.gradeAStar) {
    return {
      percentage,
      letterGrade: 'A*',
      description: 'Өте үздік / Үздік нәтиже (90-100%)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }
  if (percentage >= thresholds.gradeA) {
    return {
      percentage,
      letterGrade: 'A',
      description: 'Үздік нәтиже (80-89%)',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (percentage >= thresholds.gradeB) {
    return {
      percentage,
      letterGrade: 'B',
      description: 'Жақсы нәтиже (70-79%)',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  }
  if (percentage >= thresholds.gradeC) {
    return {
      percentage,
      letterGrade: 'C',
      description: 'Қанағаттанарлық / Орташа нәтиже (55-69%)',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  }
  if (percentage >= thresholds.gradeD) {
    return {
      percentage,
      letterGrade: 'D',
      description: 'Төменгі деңгей (40-54%)',
      badgeClass: 'bg-orange-100 text-orange-800 border-orange-300',
    };
  }
  if (percentage >= thresholds.gradeE) {
    return {
      percentage,
      letterGrade: 'E',
      description: 'Ең төменгі шекті деңгей (25-39%)',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    };
  }
  return {
    percentage,
    letterGrade: 'U',
    description: 'Есептелмеген / Төмен деңгей (0-24%)',
    badgeClass: 'bg-gray-200 text-gray-800 border-gray-300',
  };
}
