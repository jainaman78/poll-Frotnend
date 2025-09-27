import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./StudentPage.css";

const socket = io("https://poll-backend-tte0.onrender.com", {
  transports: ["websocket"],
});

export default function StudentPage() {
  const [name, setName] = useState(() => sessionStorage.getItem("student_name") || "");
  const [joined, setJoined] = useState(Boolean(sessionStorage.getItem("student_name")));
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    socket.on("poll:new", (p) => {
      setPoll(p);
      setSelectedOption(null);
      setSubmitted(false);
      startTimer(p);
    });

    socket.on("poll:ended", (p) => {
      setPoll({ ...p, active: false });
      setTimeLeft(0);
    });

    socket.on("poll:waiting", () => {
      setPoll(null);
    });

    return () => {
      socket.off("poll:new");
      socket.off("poll:ended");
      socket.off("poll:waiting");
    };
  }, []);

  const join = () => {
    if (!name.trim()) return alert("Enter name");
    sessionStorage.setItem("student_name", name);
    setJoined(true);
    socket.emit("join_as_student", name);
  };

  const startTimer = (p) => {
    if (!p?.startAt) return;
    const end = p.startAt + p.timeoutSeconds * 1000;
    const id = setInterval(() => {
      const left = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) clearInterval(id);
    }, 300);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return alert("Select an option");
    if (submitted) return;
    socket.emit("student:submit", selectedOption);
    setSubmitted(true);
  };

  if (!joined) {
    return (
      <div className="container">
        <div className="card student-start">
          <button className="ask-btn">Intervue Poll</button>
          <div className="h1">Let's <b>Get Started</b></div>
          <div className="lead"> If you’re a student, you’ll be able to submit your answers, participate in live polls, and see how your responses compare with your classmates</div>

          <div className="center-card">
            <h4 style={{marginRight:"190px"}}>Enter your name</h4>
            <input className="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
            <br></br>
            <button className="ask-btn" onClick={join}style={{marginTop:"20px"}}>Continue</button>
          </div>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="container">
        <div className="card waiting">
          <h3>Waiting for teacher to ask a question...</h3>
          <p>You are logged in as <b>{name}</b></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{width:"800px"}}>
      <div className="card poll-card">
        <div className="poll-header pollques">
          <div className="">{poll.question}</div>
          <div>{poll.active ? `⏱ ${timeLeft}s` : "Ended"}</div>
        </div>

        <div className="options-container">
          {poll.options.map((opt, idx) => (
            <div
              key={idx}
              className={`option-box ${selectedOption === idx ? "selected" : ""}`}
              onClick={() => !submitted && setSelectedOption(idx)}
            >
              {opt.text}
            </div>
          ))}

          {poll.active && !submitted && (
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={selectedOption === null}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
