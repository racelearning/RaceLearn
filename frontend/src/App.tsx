import React, { useState, useEffect } from 'react';

interface Course {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
}

function App() {
  // Use a partial type for initial state since _id and createdAt are set by MongoDB
  const [course, setCourse] = useState<Partial<Course>>({ title: '', description: '' });
  const [courses, setCourses] = useState<Course[]>([]);

  // Fetch courses on load
  useEffect(() => {
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(error => console.error('Error fetching courses:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: course.title, description: course.description }),
      });
      if (response.ok) {
        const newCourse = await response.json() as Course;
        setCourses([...courses, newCourse]);
        setCourse({ title: '', description: '' }); // Clear form
      } else {
        alert('Error saving course');
      }
    } catch (error) {
      alert('Network error');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>RaceLearn - Create a Course</h1>
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
        <button type="submit" style={{ padding: '5px 10px' }}>Save Course</button>
      </form>
      <h2>Saved Courses</h2>
      <ul>
        {courses.map((c) => (
          <li key={c._id}>
            {c.title} - {c.description} (Created: {new Date(c.createdAt).toLocaleDateString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;