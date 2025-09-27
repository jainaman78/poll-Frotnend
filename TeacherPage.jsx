// frontend/src/TeacherPage.jsx
import React, { useEffect, useState } from "react";
import { socket } from "./socket";

export default function TeacherPage({ onLogout }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([]);
  const [timeoutSeconds, setTimeoutSeconds] = useState(60);
  const [liveResults, setLiveResults] = useState(null);
  const [students, setStudents] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);

  useEffect(() => {
    socket.on("poll:update", (data) => setLiveResults(data));
    socket.on("poll:ended", (poll) => {
      setLiveResults({ options: poll.options, ended: true });
    });
    socket.on("students:update", (list) => setStudents(list));
    socket.on("poll:new", (poll) => {
      setLiveResults({ options: poll.options, startedAt: poll.startAt });
    });

    return () => {
      socket.off("poll:update");
      socket.off("poll:ended");
      socket.off("students:update");
      socket.off("poll:new");
    };
  }, []);

  function changeOption(val, idx) {
    const arr = [...options];
    arr[idx] = val;
    setOptions(arr);
  }
  function addOption() {
    setOptions([...options, ""]);
  }

  function askQuestion() {
    if (!question.trim()) return alert("Enter a question");
    const opts = options.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) return alert("Add at least 2 options");

    socket.emit("teacher:create_poll", { question, options: opts, timeoutSeconds });
    setLiveResults(null);
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <button className="ask-btn" style={{ marginBottom: 20 }}>
            Intervue Poll
          </button>
          <div className="h1">
            Let's <span className="bold">Get Started</span>
          </div>
          <div className="lead">
            you’ll have the ability to create and manage polls, ask questions, and monitor <br></br>your students' responses in real-time.
          </div>
        </div>
      </div>

      {/* --- QUESTION CREATION --- */}
      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <label className="label"><b>Enter your question</b></label>
          <div style={{ width: 150 }}>
            <select
              className="select"
              value={timeoutSeconds}
              onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>60 seconds</option>
              <option value={90}>90 seconds</option>
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
          <textarea
            className="textarea"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={200}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div className="label">Edit Options</div>
          </div>

          {options.map((opt, idx) => (
            <div className="option-row" key={idx}>
              <div className="option-number">{idx + 1}</div>
              <input
                className="option-input"
                value={opt}
                onChange={(e) => changeOption(e.target.value, idx)}
              />
            </div>
          ))}

          <div style={{ marginTop: 8 }}>
            <div className="add-option" onClick={addOption}>
              + Add More option
            </div>
          </div>

          <div className="footer" style={{ marginTop: 12 }}>
            <button className="ask-btn" onClick={askQuestion}>
              Ask Question
            </button>
          </div>
        </div>
      </div>

      {/* --- LIVE RESULTS --- */}
      <div style={{ marginTop: 20 }} className="card">
        <h3>{question}</h3>
        {!liveResults && (
          <div style={{ color: "#6b7280" }}>
          </div>
        )}
        {liveResults && liveResults.options && (
          <div>
            {liveResults.options.map((o, i) => {
              const total =
                liveResults.options.reduce((s, x) => s + x.votes, 0) || 1;
              const pct = Math.round((o.votes / total) * 100);
              return (
                <div className="result-row" key={i}>
                  <div className="option-label">
                    {i + 1}. {o.text}
                  </div>
                  <div className="bar">
                    <div className="fill" style={{ width: `${pct}%` }}>
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- FLOATING PARTICIPANT BUTTON --- */}
      <button
        onClick={() => setShowParticipants(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: "#2563eb",
          color: "white",
          fontSize: 22,
          border: "none",
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
          cursor: "pointer",
        }}
      >
        👥
      </button>

      {/* --- PARTICIPANT LIST MODAL --- */}
      {showParticipants && (
  <div
    style={{
      position: "fixed",
      bottom: 90, // 👈 sits above the circle button
      right: 20,
      width: 280,
      Height: 800,
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
      padding: "12px 16px",
      overflowY: "auto",
      zIndex: 1000,
      animation: "fadeInUp 0.25s ease-in-out",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: 6,
      }}
    >
      <h4 style={{ margin: 0, fontSize: 16 }}>👥 Participants ({students.length})</h4>
      <button
        onClick={() => setShowParticipants(false)}
        style={{
          background: "transparent",
          border: "none",
          fontSize: 18,
          cursor: "pointer",
          color: "#6b7280",
        }}
      >
        ✖
      </button>
    </div>

    {students.length === 0 ? (
      <div style={{ color: "#6b7280", fontSize: 14 }}>No students connected</div>
    ) : (
      <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
        {students.map((s, idx) => (
          <li
            key={idx}
            style={{
              padding: "6px 0",
              borderBottom: "1px solid #f3f4f6",
              fontSize: 14,
            }}
          >
            👤 {s}
          </li>
        ))}
      </ul>
    )}
  </div>
)}
    </div>
  );
}
