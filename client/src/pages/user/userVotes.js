import React, { useEffect } from "react";
import { useAsyncFn } from "../../hooks/useAsync";
import { useUser } from "./user";
import { getUserVotes } from "../../services/user";
import { dateFormatter } from "../Comment";
import { Link } from "react-router-dom";

// Question Component
function Votes({ value, date, questionId, questionTitle }) {
  return (
    <div className="d-flex border justify-content-between p-2 w-75 rounded-2 m-2">
      <div className="votes">
        <span
          className="vote-count me-2"
          title={value === 1 ? "Upvote" : "Downvote"}
        >
          {value}
        </span>
        <Link to={`/questions/${questionId}`} className="text-decoration-none">
          {questionTitle}
        </Link>
        {/* <span className="vote-label">Votes</span> */}
      </div>
      <div className="vote-date">{date}</div>
    </div>
  );
}

export default function UserVotes() {
  const { userId } = useUser();
  const { loading, error, value: response, execute } = useAsyncFn(getUserVotes);

  useEffect(() => {
    if (userId) {
      execute({ id: userId });
    }
  }, [userId, execute]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">Error: {error.message}</div>;

  const votes = response?.data?.votes;

  return (
    <div className="d-flex align-items-center justify-content-center h-100">
      {votes && votes.length > 0 ? (
        <div className="d-flex flex-column align-items-center w-100 m-2">
          {votes.map((vote, index) => (
            <Votes
              key={index}
              questionId={vote.questionId}
              value={vote.value}
              questionTitle={vote.title}
              date={dateFormatter(vote.createdAt)}
            />
          ))}
        </div>
      ) : (
        <p>No votes available.</p>
      )}
    </div>
  );
}
