import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';

export const globalSearch = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        query: q,
        results: {
          students: [],
          teachers: [],
          courses: [],
          subjects: [],
        },
        totalMatches: 0,
      });
    }

    const regex = new RegExp(q, 'i');

    const canViewStudents = req.user?.role === 'ADMIN' || req.user?.role === 'TEACHER';

    const [students, teachers, courses, subjects] = await Promise.all([
      canViewStudents
        ? Student.find({
            $or: [
              { firstName: regex },
              { lastName: regex },
              { studentId: regex },
              { email: regex },
              { department: regex },
            ],
          })
            .limit(5)
            .select('studentId firstName lastName department semester status email')
        : Promise.resolve([]),

      Teacher.find({
        $or: [
          { firstName: regex },
          { lastName: regex },
          { teacherId: regex },
          { email: regex },
          { department: regex },
          { specialization: regex },
        ],
      })
        .limit(5)
        .select('teacherId firstName lastName department specialization status email'),

      Course.find({
        $or: [
          { courseName: regex },
          { courseCode: regex },
          { department: regex },
        ],
      })
        .limit(5)
        .select('courseCode courseName department duration status'),

      Subject.find({
        $or: [
          { subjectName: regex },
          { subjectCode: regex },
          { department: regex },
        ],
      })
        .limit(5)
        .select('subjectCode subjectName department credits semester'),
    ]);

    const formattedStudents = students.map((s) => ({
      id: s._id,
      title: `${s.firstName} ${s.lastName}`,
      subtitle: `${s.studentId} • ${s.department} (Sem ${s.semester})`,
      category: 'Student',
      status: s.status,
      link: '/students',
    }));

    const formattedTeachers = teachers.map((t) => ({
      id: t._id,
      title: `Prof. ${t.firstName} ${t.lastName}`,
      subtitle: `${t.teacherId} • ${t.department}`,
      category: 'Teacher',
      status: t.status,
      link: '/teachers',
    }));

    const formattedCourses = courses.map((c) => ({
      id: c._id,
      title: c.courseName,
      subtitle: `${c.courseCode} • ${c.department}`,
      category: 'Course',
      status: c.status,
      link: '/courses',
    }));

    const formattedSubjects = subjects.map((sub) => ({
      id: sub._id,
      title: sub.subjectName,
      subtitle: `${sub.subjectCode} • ${sub.credits} Credits • Sem ${sub.semester}`,
      category: 'Subject',
      link: '/subjects',
    }));

    const totalMatches =
      formattedStudents.length +
      formattedTeachers.length +
      formattedCourses.length +
      formattedSubjects.length;

    res.status(200).json({
      success: true,
      query: q,
      results: {
        students: formattedStudents,
        teachers: formattedTeachers,
        courses: formattedCourses,
        subjects: formattedSubjects,
      },
      totalMatches,
    });
  } catch (error) {
    next(error);
  }
};
