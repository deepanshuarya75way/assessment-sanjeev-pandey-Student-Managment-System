export const calculateGrade = (internalMarks, externalMarks, maxInternal = 30, maxExternal = 70) => {
  const safeInternal = Math.max(0, Math.min(Number(internalMarks) || 0, maxInternal));
  const safeExternal = Math.max(0, Math.min(Number(externalMarks) || 0, maxExternal));

  const totalMarks = Math.round((safeInternal + safeExternal) * 100) / 100;
  const maxTotal = maxInternal + maxExternal;
  const percentage = maxTotal > 0 ? Math.round((totalMarks / maxTotal) * 100) : 0;

  let grade = 'F';
  let gradePoint = 0;
  let isPassed = false;

  if (percentage >= 90) {
    grade = 'A+';
    gradePoint = 10;
    isPassed = true;
  } else if (percentage >= 80) {
    grade = 'A';
    gradePoint = 9;
    isPassed = true;
  } else if (percentage >= 70) {
    grade = 'B+';
    gradePoint = 8;
    isPassed = true;
  } else if (percentage >= 60) {
    grade = 'B';
    gradePoint = 7;
    isPassed = true;
  } else if (percentage >= 50) {
    grade = 'C';
    gradePoint = 6;
    isPassed = true;
  } else if (percentage >= 40) {
    grade = 'D';
    gradePoint = 5;
    isPassed = true;
  } else {
    grade = 'F';
    gradePoint = 0;
    isPassed = false;
  }

  return {
    internalMarks: safeInternal,
    externalMarks: safeExternal,
    maxInternal,
    maxExternal,
    totalMarks,
    maxTotal,
    percentage,
    grade,
    gradePoint,
    isPassed,
  };
};