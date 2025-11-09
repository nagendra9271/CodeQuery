import React, { useEffect } from "react";
import { useAsyncFn } from "../../hooks/useAsync";
import { useUser } from "./user";
import { getUserQuestions } from "../../services/user";
import { dateFormatter } from "../Comment";
import { Link } from "react-router-dom";

// Question Component
function Question({ votes, title, date, id }) {
  return (
    <div className="d-flex border justify-content-between p-2 w-75 rounded-2 m-2">
      <div className="votes">
        <span className="vote-count me-2">{votes}</span>
        <Link to={`/questions/${id}`} className="text-decoration-none">
          {title}
        </Link>
        {/* <span className="vote-label">Votes</span> */}
      </div>
      <div className="question-date">{date}</div>
    </div>
  );
}

export default function UserQuestions() {
  const { userId } = useUser();
  const {
    loading,
    error,
    value: response,
    execute,
  } = useAsyncFn(getUserQuestions);

  useEffect(() => {
    if (userId) {
      execute({ id: userId });
    }
  }, [userId, execute]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">Error: {error.message}</div>;

  const questions = response?.data?.questions;

  return (
    <div className="d-flex align-items-center justify-content-center h-100">
      {questions && questions.length > 0 ? (
        <div className="d-flex flex-column align-items-center w-100 m-2">
          {questions.map((question, index) => (
            <Question
              key={index}
              id={question.questionId}
              votes={question.likesCount}
              title={question.title}
              date={dateFormatter(question.updatedAt)}
            />
          ))}
        </div>
      ) : (
        <p>No questions available.</p>
      )}
    </div>
  );
}
