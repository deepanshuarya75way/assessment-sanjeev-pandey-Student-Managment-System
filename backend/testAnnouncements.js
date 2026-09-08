const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  console.log('=== STAGE 8: ANNOUNCEMENT SYSTEM TESTS ===\n');

  try {
    // 1. Logins
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@sms.edu', password: 'password123' }),
    });
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;
    console.log('✓ Admin login successful');

    const teacherLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@sms.edu', password: 'password123' }),
    });
    const teacherData = await teacherLoginRes.json();
    const teacherToken = teacherData.token;
    console.log('✓ Teacher login successful');

    const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@sms.edu', password: 'password123' }),
    });
    const studentData = await studentLoginRes.json();
    const studentToken = studentData.token;
    console.log('✓ Student login successful');

    // 2. Audience Isolation: Check visibility
    const studentGetRes = await fetch(`${BASE_URL}/announcements`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentAnnouncements = await studentGetRes.json();
    if (!studentAnnouncements.success) throw new Error('Student failed to fetch announcements');
    const hasTeacherOnlyForStudent = studentAnnouncements.data.some(
      (a) => a.targetAudience === 'Teachers'
    );
    if (hasTeacherOnlyForStudent) throw new Error('Student should not see Teachers-only announcements!');
    console.log(`✓ Student fetches ${studentAnnouncements.data.length} visible announcements (Teachers-only properly filtered)`);

    const teacherGetRes = await fetch(`${BASE_URL}/announcements`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    const teacherAnnouncements = await teacherGetRes.json();
    if (!teacherAnnouncements.success) throw new Error('Teacher failed to fetch announcements');
    const hasStudentOnlyForTeacher = teacherAnnouncements.data.some(
      (a) => a.targetAudience === 'Students'
    );
    if (hasStudentOnlyForTeacher) throw new Error('Teacher should not see Students-only announcements!');
    console.log(`✓ Teacher fetches ${teacherAnnouncements.data.length} visible announcements (Students-only properly filtered)`);

    // 3. Admin creates Draft announcement
    const createDraftRes = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Spring Break Facility Hours (Draft)',
        description: 'Facility timings will be adjusted during the upcoming spring break period.',
        targetAudience: 'Students',
        priority: 'Normal',
        status: 'Draft',
        category: 'General',
      }),
    });
    const createDraftData = await createDraftRes.json();
    if (!createDraftData.success) throw new Error(`Draft creation failed: ${createDraftData.message}`);
    const draftId = createDraftData.announcement._id;
    console.log('✓ Admin created Draft announcement');

    // 4. Verify Draft is NOT visible to student
    const studentCheckDraftRes = await fetch(`${BASE_URL}/announcements`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentAfterDraft = await studentCheckDraftRes.json();
    const canStudentSeeDraft = studentAfterDraft.data.some((a) => a._id === draftId);
    if (canStudentSeeDraft) throw new Error('Student can see Draft announcement!');
    console.log('✓ Draft announcement is hidden from student');

    // 5. Admin publishes the announcement and updates title
    const updateRes = await fetch(`${BASE_URL}/announcements/${draftId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        title: 'Spring Break Facility Hours (Published)',
        status: 'Published',
        priority: 'High',
      }),
    });
    const updateData = await updateRes.json();
    if (!updateData.success || updateData.announcement.status !== 'Published') {
      throw new Error(`Admin update/publish failed: ${updateData.message}`);
    }
    console.log('✓ Admin published and updated the announcement');

    // 6. Verify Student can now see it and it is marked unread
    const studentCheckPubRes = await fetch(`${BASE_URL}/announcements`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const studentAfterPub = await studentCheckPubRes.json();
    const publishedItemForStudent = studentAfterPub.data.find((a) => a._id === draftId);
    if (!publishedItemForStudent) throw new Error('Published announcement not visible to student!');
    if (publishedItemForStudent.isRead !== false) throw new Error('New published announcement should be unread for student!');
    const initialUnread = studentAfterPub.unreadCount;
    console.log(`✓ Student can see published notice; unreadCount: ${initialUnread}`);

    // 7. Student marks single notice as read
    const markReadRes = await fetch(`${BASE_URL}/announcements/${draftId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const markReadData = await markReadRes.json();
    if (!markReadData.success || !markReadData.isRead) throw new Error('Failed to mark announcement as read');
    
    // Verify it is now read
    const verifyReadRes = await fetch(`${BASE_URL}/announcements`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const verifyReadData = await verifyReadRes.json();
    const verifiedItem = verifyReadData.data.find((a) => a._id === draftId);
    if (!verifiedItem || verifiedItem.isRead !== true) throw new Error('Item should be marked isRead: true');
    console.log('✓ Student successfully marked single announcement as read');

    // 8. Student marks all announcements as read
    const markAllRes = await fetch(`${BASE_URL}/announcements/mark-all-read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const markAllData = await markAllRes.json();
    if (!markAllData.success) throw new Error('Mark all read failed');

    const verifyAllReadRes = await fetch(`${BASE_URL}/announcements`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const verifyAllReadData = await verifyAllReadRes.json();
    if (verifyAllReadData.unreadCount !== 0) {
      throw new Error(`Expected unreadCount to be 0 after mark-all-read, got ${verifyAllReadData.unreadCount}`);
    }
    console.log('✓ Student successfully marked all announcements as read (unreadCount: 0)');

    // 9. RBAC: Non-admin cannot create announcement
    const unauthorizedCreateRes = await fetch(`${BASE_URL}/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        title: 'Hacked Notice',
        description: 'Unauthorized',
      }),
    });
    if (unauthorizedCreateRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for student creation, got ${unauthorizedCreateRes.status}`);
    }
    console.log('✓ RBAC: Student forbidden from creating announcements (403)');

    // 10. Admin deletes announcement
    const deleteRes = await fetch(`${BASE_URL}/announcements/${draftId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const deleteData = await deleteRes.json();
    if (!deleteData.success) throw new Error('Failed to delete announcement');
    console.log('✓ Admin deleted announcement successfully');

    console.log('\n>>> ALL 10 STAGE 8 ANNOUNCEMENT TESTS PASSED! <<<\n');
  } catch (err) {
    console.error('\n❌ STAGE 8 TEST FAILED:', err.message);
    process.exit(1);
  }
};

runTests();
