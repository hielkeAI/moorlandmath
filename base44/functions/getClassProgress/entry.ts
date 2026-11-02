import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch((e) => (e.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { classroom_id } = await req.json().catch(() => ({}));
    if (!classroom_id || typeof classroom_id !== 'string') {
      return Response.json({ error: 'classroom_id is required' }, { status: 400 });
    }

    const classroom = await base44.asServiceRole.entities.Classroom.get(classroom_id).catch((e) =>
      e.status === 404 ? null : Promise.reject(e)
    );
    if (!classroom) return Response.json({ error: 'Class not found' }, { status: 404 });
    if (classroom.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [enrollments, homeworks] = await Promise.all([
      base44.asServiceRole.entities.Enrollment.filter({ classroom_id }, { limit: 300 }),
      base44.asServiceRole.entities.Homework.filter({ classroom_id }, { limit: 100 }),
    ]);

    const activeEnrollments = enrollments.items.filter((item) => item.status !== 'invited');
    const studentIds = [...new Set(activeEnrollments.map((item) => item.created_by_id).filter(Boolean))];
    let students = [];
    if (studentIds.length) {
      const profiles = await base44.asServiceRole.entities.Profile.filter(
        { created_by_id: { $in: studentIds } },
        { limit: 300 }
      );
      students = profiles.items.map((profile) => ({
        id: profile.created_by_id,
        name: profile.display_name || 'Student',
        xp: profile.xp || 0,
        answered: profile.total_answered || 0,
        correct: profile.total_correct || 0,
      }));
    }

    const seenNames = new Set(students.map((student) => student.name.trim().toLowerCase()));
    const invited = enrollments.items
      .filter((item) => item.status === 'invited' && item.student_name)
      .filter((item) => {
        const key = item.student_name.trim().toLowerCase();
        if (seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
      })
      .map((item) => ({
        id: item.id,
        name: item.student_name,
        invited: true,
        xp: 0,
        answered: 0,
        correct: 0,
      }));

    students = [...students, ...invited];

    const progress = await base44.asServiceRole.entities.HomeworkProgress.filter(
      { classroom_id },
      { limit: 500 }
    );

    return Response.json({
      classroom,
      students,
      homeworks: homeworks.items,
      progress: progress.items.map((item) => ({
        id: item.id,
        homework_id: item.homework_id,
        student_id: item.created_by_id,
        student_name: item.student_name || '',
        answered: item.answered || 0,
        correct: item.correct || 0,
        question_count: item.question_count || 0,
        status: item.status || 'in_progress',
        completed_date: item.completed_date || null,
      })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}