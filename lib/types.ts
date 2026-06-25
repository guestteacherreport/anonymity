export type ObjectType = {
  [key: string]: any;
};

export interface DashboardStats {
  totalReports: number;
  positiveReports: number,
  neutralReports: number,
  totalReportsCurrentMonth: number;
  totalReportsLastMonth: number;
  reportsThisWeek: number;
  reportsLastWeek: number;
  negativeReportsCurrentMonth: number;
  negativeReportsLastMonth: number;
  negativeReports: number;
  schoolChange: number;
  totalSchools: number;
  negativeByClassroomBehavior: number;
  negativeByLessonPreparedness: number;
  negativeByStaffFriendliness: number;
  negativeBySchoolCleanliness: number;
  negativeBySupportLevel: number;
}

export type Sentiment = "Positive" | "Negative" | "Neutral";


export interface Report {
  id: string;
  school_name: string;
  grade_level: string;
  teacher_name: string;
  post_as: number;
  created_at: string;
  sentiment: Sentiment;
  status: number;
  school_association: string;
  score: number;
  ratings: { label: string; value: number; max: number }[];
  reviewText: string;
  tags: string[];
  your_name: string;
  feedback: string;
  classroom_behavior: number;
  lesson_preparedness: number;
  staff_friendliness: number;
  school_cleanliness: number;
  support_level: number;
  return_to_school: number;
  school_comment: string;
  return_to_teacher: number;
  teacher_comment: string;
}