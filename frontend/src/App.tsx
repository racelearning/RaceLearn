import React, { useState, useEffect } from 'react';

interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  courseId: string;
  title: string;
  questions: Question[];
}

function App() {
  const [course, setCourse] = useState<Partial<Course>>({ title: '', description: '' });
  const [courses, setCourses] = useState<Course[]>([]);
  const [editCourseId, setEditCourseId] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<Partial<Quiz>>({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }] });
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetch('/api/courses', { headers: { 'authorization': token } })
        .then(res => res.json())
        .then(data => setCourses(data))
        .catch(error => console.error('Error fetching courses:', error));
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Please log in first');
      return;
    }
    try {
      const url = editCourseId ? `/api/courses/${editCourseId}` : '/api/courses';
      const method = editCourseId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'authorization': token },
        body: JSON.stringify({ title: course.title, description: course.description }),
      });
      if (response.ok) {
        const updatedCourse = await response.json();
        setCourses(courses.map(c => c._id === (editCourseId || updatedCourse._id) ? updatedCourse : c));
        setCourse({ title: '', description: '' });
        setEditCourseId(null);
      } else {
        alert('Error saving/updating course');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const handleEdit = (id: string) => {
    const courseToEdit = courses.find(c => c._id === id);
    if (courseToEdit) {
      setCourse(courseToEdit);
      setEditCourseId(id);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      alert('Please log in first');
      return;
    }
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetch(`/api/courses/${id}`, { method: 'DELETE', headers: { 'authorization': token } });
        if (response.ok) {
          setCourses(courses.filter(c => c._id !== id));
        } else {
          alert('Error deleting course');
        }
      } catch (error) {
        alert('Network error');
      }
    }
  };

  const handleLogin = async () => {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    if (username && password) {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        const { token } = await response.json();
        setToken(token);
        localStorage.setItem('token', token);
      } else {
        alert('Login failed');
      }
    }
  };

  const handleRegister = async () => {
    const username = prompt('Enter username:');
    const password = prompt('Enter password:');
    if (username && password) {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        alert('Registration successful, please log in');
      } else {
        alert('Registration failed');
      }
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedCourseId) {
      alert('Please log in and select a course first');
      return;
    }
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'authorization': token },
        body: JSON.stringify({ courseId: selectedCourseId, ...quiz }),
      });
      if (response.ok) {
        const newQuiz = await response.json();
        setQuizzes([...quizzes, newQuiz]);
        setQuiz({ title: '', questions: [{ question: '', options: ['', '', '', ''], correctAnswer: '' }] });
        setSelectedCourseId(null);
      } else {
        alert('Error creating quiz');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  const fetchQuizzes = async (courseId: string) => {
    if (token) {
      const response = await fetch(`/api/quizzes/${courseId}`, { headers: { 'authorization': token } });
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>RaceLearn</h1>
      {!token ? (
        <>
          <button onClick={handleRegister} style={{ padding: '5px 10px', marginRight: '10px' }}>Register</button>
          <button onClick={handleLogin} style={{ padding: '5px 10px' }}>Login</button>
        </>
      ) : (
        <>
          <h2>Create a Course</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Course Title"
              value={course.title || ''}
              onChange={(e) => setCourse({ ...course, title: e.target.value })}
              style={{ margin: '10px 0', padding: '5px', width: '200px' }}
            />
            <br />
            <textarea
              placeholder="Course Description"
              value={course.description || ''}
              onChange={(e) => setCourse({ ...course, description: e.target.value })}
              style={{ margin: '10px 0', padding: '5px', width: '200px', height: '100px' }}
            />
            <br />
            <button type="submit" style={{ padding: '5px 10px' }}>
              {editCourseId ? 'Update Course' : 'Save Course'}
            </button>
          </form>
          <button onClick={handleLogout} style={{ padding: '5px 10px', marginTop: '10px' }}>Logout</button>

          <h2>Saved Courses</h2>
          <ul>
            {courses.map((c) => (
              <li key={c._id} style={{ margin: '10px 0' }}>
                {c.title} - {c.description} (Created: {new Date(c.createdAt).toLocaleDateString()})
                <button
                  onClick={() => handleEdit(c._id)}
                  style={{ marginLeft: '10px', padding: '2px 5px', background: '#ffd700' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c._id)}
                  style={{ marginLeft: '5px', padding: '2px 5px', background: '#ff4444', color: 'white' }}
                >
                  Delete
                </button>
                <button
                  onClick={() => { setSelectedCourseId(c._id); fetchQuizzes(c._id); }}
                  style={{ marginLeft: '5px', padding: '2px 5px', background: '#4CAF50', color: 'white' }}
                >
                  View Quizzes
                </button>
              </li>
            ))}
          </ul>

          {selectedCourseId && (
            <div style={{ marginTop: '20px' }}>
              <h2>Create Quiz for Course</h2>
              <form onSubmit={handleQuizSubmit}>
                <input
                  type="text"
                  placeholder="Quiz Title"
                  value={quiz.title || ''}
                  onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                  style={{ margin: '10px 0', padding: '5px', width: '200px' }}
                />
                <br />
                {quiz.questions?.map((q, qIndex) => (
                  <div key={qIndex} style={{ margin: '10px 0' }}>
                    <input
                      type="text"
                      placeholder="Question"
                      value={q.question || ''}
                      onChange={(e) => {
                        const newQuestions = [...(quiz.questions || [])];
                        newQuestions[qIndex] = { ...q, question: e.target.value };
                        setQuiz({ ...quiz, questions: newQuestions });
                      }}
                      style={{ padding: '5px', width: '200px' }}
                    />
                    {q.options.map((opt, optIndex) => (
                      <input
                        key={optIndex}
                        type="text"
                        placeholder={`Option ${optIndex + 1}`}
                        value={opt || ''}
                        onChange={(e) => {
                          const newQuestions = [...(quiz.questions || [])];
                          newQuestions[qIndex] = { ...q, options: [...q.options] };
                          newQuestions[qIndex].options[optIndex] = e.target.value;
                          setQuiz({ ...quiz, questions: newQuestions });
                        }}
                        style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
                      />
                    ))}
                    <input
                      type="text"
                      placeholder="Correct Answer"
                      value={q.correctAnswer || ''}
                      onChange={(e) => {
                        const newQuestions = [...(quiz.questions || [])];
                        newQuestions[qIndex] = { ...q, correctAnswer: e.target.value };
                        setQuiz({ ...quiz, questions: newQuestions });
                      }}
                      style={{ marginLeft: '10px', padding: '5px', width: '150px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newQuestions = [...(quiz.questions || [])];
                        newQuestions.splice(qIndex, 1);
                        setQuiz({ ...quiz, questions: newQuestions });
                      }}
                      style={{ marginLeft: '10px', padding: '2px 5px', background: '#ff4444', color: 'white' }}
                    >
                      Remove Question
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setQuiz({ ...quiz, questions: [...(quiz.questions || []), { question: '', options: ['', '', '', ''], correctAnswer: '' }] })}
                  style={{ marginTop: '10px', padding: '5px 10px' }}
                >
                  Add Question
                </button>
                <br />
                <button type="submit" style={{ marginTop: '10px', padding: '5px 10px' }}>Save Quiz</button>
              </form>
              <h3>Quizzes for Selected Course</h3>
              <ul>
                {quizzes.map((q) => (
                  <li key={q._id} style={{ margin: '10px 0' }}>
                    {q.title} - {q.questions.length} questions
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;