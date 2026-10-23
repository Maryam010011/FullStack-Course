// Custom CommonJS module: business rules, separate from the HTTP server.
function validateFeedback(body, courses) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object.' };
  }
  if (typeof body.courseId !== 'string' || !body.courseId.trim()) {
    return { error: 'courseId is required.' };
  }
  const courseId = body.courseId.trim().toUpperCase();
  if (!courses.some(course => course.id === courseId)) {
    return { error: 'Course not found.', status: 404 };
  }
  if (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 5) {
    return { error: 'rating must be an integer from 1 to 5.' };
  }
  if (typeof body.message !== 'string' || body.message.trim().length < 5 || body.message.trim().length > 400) {
    return { error: 'message must contain 5–400 characters.' };
  }
  if (body.student !== undefined && (typeof body.student !== 'string' || body.student.length > 40)) {
    return { error: 'student must be a string of at most 40 characters.' };
  }
  return {
    value: {
      courseId,
      student: typeof body.student === 'string' && body.student.trim() ? body.student.trim() : 'Anonymous',
      rating: body.rating,
      message: body.message.trim()
    }
  };
}
module.exports = { validateFeedback };
