import React, { useEffect } from "react";
import { useAsyncFn } from "../../hooks/useAsync";
import { useUser } from "./user";
import { getUserComments } from "../../services/user";
import { dateFormatter } from "../Comment";
import { Link } from "react-router-dom";

// Question Component
function Comments({ votes, body, date, questionId, id }) {
  return (
    <div className="d-flex border justify-content-between p-2 w-75 rounded-2 m-2">
      <div className="votes">
        <span className="vote-count me-2">{votes}</span>
        <Link
          to={`/questions/${questionId}?onFocus=${id}`}
          className="text-decoration-none"
        >
          {body}
        </Link>
        {/* <span className="vote-label">Votes</span> */}
      </div>
      <div className="comment-date">{date}</div>
    </div>
  );
}

export default function UserComments() {
  const { userId } = useUser();
  const {
    loading,
    error,
    value: response,
    execute,
  } = useAsyncFn(getUserComments);

  useEffect(() => {
    if (userId) {
      execute({ id: userId });
    }
  }, [userId, execute]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">Error: {error.message}</div>;

  const comments = response?.data?.comments;

  return (
    <div className="d-flex align-items-center justify-content-center h-100">
      {comments && comments.length > 0 ? (
        <div className="d-flex flex-column align-items-center w-100 m-2">
          {comments.map((comment, index) => (
            <Comments
              key={index}
              questionId={comment.questionId}
              id={comment.id}
              votes={comment.likesCount}
              body={comment.body}
              date={dateFormatter(comment.updatedAt)}
            />
          ))}
        </div>
      ) : (
        <p>No comments available.</p>
      )}
    </div>
  );
}
