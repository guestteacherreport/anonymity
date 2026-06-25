import { openai } from "./openai";

export async function analyzeReport(report: any) {
  const response = await openai.responses.create({
    model: "gpt-5-mini",

    input: `
Analyze this school feedback report.

Ratings:
${JSON.stringify(report.ratings)}

Feedback:
${report.feedback}

Tags:
${report.selectedTags?.join(", ")}

Final Thoughts:

Return to teacher: ${report.returnToTeacher}

Teacher/Class Feedback: ${report.teacherComment}

Return to school: ${report.returnToSchool}

School Feedback: ${report.schoolComment}

Return JSON only:

{
  "sentiment":"Positive|Neutral|Negative",
  "risk_level":"Low|Medium|High",

  "teacher_strengths":[],
  "teacher_issues":[],

  "school_strengths":[],
  "school_issues":[]
}
`,
  });

  return JSON.parse(response.output_text);
}