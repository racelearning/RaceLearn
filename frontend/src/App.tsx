import React, { useState } from 'react';

function App() {
  const [course, setCourse] = useState({ title: '', description: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(course),
      });
      if (response.ok) {
        alert('Course saved to database!');
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
          value={course.title}
          onChange={(e) => setCourse({ ...course, title: e.target.value })}
          style={{ margin: '10px 0', padding: '5px', width: '200px' }}
        />
        <br />
        <textarea
          placeholder="Course Description"
          value={course.description}
          onChange={(e) => setCourse({ ...course, description: e.target.value })}
          style={{ margin: '10px 0', padding: '5px', width: '200px', height: '100px' }}
        />
        <br />
        <button type="submit" style={{ padding: '5px 10px' }}>Save Course</button>
      </form>
    </div>
  );
}

export default App;