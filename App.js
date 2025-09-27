// frontend/src/App.js
import React, { useState } from "react";
import TeacherPage from "./TeacherPage";
import StudentPage from "./StudentPage";
import "./index.css";

function App() {
  const [role, setRole] = useState(null); // actual role after continue
  const [selectedRole, setSelectedRole] = useState(null); // temporary selected role

  if (!role) {
    return (
      <div className="container">
        <div
          className="card"
          style={{ textAlign: "center", padding: "60px 40px" }}
        >
          <button className="ask-btn" style={{ marginBottom: 20 }}>
            Intervue Poll
          </button>
          <div className="h1">
            Welcome to the <b>Live Polling System</b>
          </div>
          <div className="lead" style={{ margin: "12px 0 24px" }}>
            Please select your role to begin using the live polling system
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginBottom: 20,
            }}
          >
            <button
              className={`ask-btn1 ${
                selectedRole === "teacher" ? "selected" : ""
              }`}
              onClick={() => setSelectedRole("teacher")}
            >
              <b>I'm a Teacher </b> <br></br>Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </button>
            <button
              className={`ask-btn1 ${
                selectedRole === "student" ? "selected" : ""
              }`}
              onClick={() => setSelectedRole("student")}
            >
              <b>I'm a Student  </b> <br></br>Lorem Ipsum is simply dummy text of the printing and typesetting industry
            </button>
          </div>

          <button
            className="ask-btn"
            onClick={() => {
              if (!selectedRole) return alert("Please select a role");
              setRole(selectedRole);
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return role === "teacher" ? (
    <TeacherPage onLogout={() => setRole(null)} />
  ) : (
    <StudentPage onLogout={() => setRole(null)} />
  );
}

export default App;
