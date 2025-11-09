import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dateFormatter } from "./Comment";
import { BiLike } from "react-icons/bi";
import { PiEyeBold } from "react-icons/pi";
import { Icon } from "./IconBtn";
import SearchByTags from "./searchByTags";

const Spinner = () => (
  <div className="d-flex justify-content-center align-items-center my-5">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="alert alert-danger text-center my-5" role="alert">
    Error: {message}
  </div>
);

const QuestionCard = ({ question }) => (
  <div className="card mb-3 shadow-sm border-0">
    <div className="card-body">
      <Link
        to={`/questions/${question.questionId}`}
        className="card-title fs-5 fw-bold text-decoration-none text-dark question-title"
      >
        {question.title}
      </Link>
      <article className="card-text text-muted question-body mt-2">
        {question.body}
      </article>
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="d-flex align-items-center gap-2">
          <Link
            to={`/users/${question.userName}`}
            className="text-decoration-none fw-medium text-primary"
          >
            {question.userName}
          </Link>
          <span className="text-muted small">
            {dateFormatter(question.createdAt)}
          </span>
        </div>
        <div className="d-flex gap-3">
          <Icon
            Icon={BiLike}
            color="text-secondary"
            children={<span className="ms-1 small">{question.likesCount}</span>}
          />
          <Icon
            Icon={PiEyeBold}
            color="text-secondary"
            children={<span className="ms-1 small">{question.viewsCount}</span>}
          />
        </div>
      </div>
    </div>
  </div>
);

export function QuestionsComp({
  setFilters = () => {},
  showFilters = true,
  loading,
  error,
  orderBy = "",
  response,
  tags = [],
}) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (response?.data?.questions) {
      setQuestions(response.data.questions);
    }
  }, [response]);

  const handleSort = (orderBy) => {
    setFilters({ orderBy });
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error.message} />;

  return (
    <div className="container-lg my-5">
      <div className="row">
        <div className={`col-lg-${showFilters ? "8" : "12"}`}>
          {showFilters && (
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0">
                {questions.length}{" "}
                {questions.length === 1 ? "Result" : "Results"}
              </h5>
              <div
                className="btn-group p-1 border rounded-2 gap-2"
                role="group"
              >
                <button
                  type="button"
                  className={`tab ${orderBy === "new" ? "active" : ""}`}
                  onClick={() => handleSort("new")}
                >
                  Newest
                </button>
                <button
                  type="button"
                  className={`tab ${orderBy === "votes" ? "active" : ""}`}
                  onClick={() => handleSort("votes")}
                >
                  Most Votes
                </button>
                <button
                  type="button"
                  className={`tab ${orderBy === "Unanswered" ? "active" : ""}`}
                  onClick={() => handleSort("Unanswered")}
                >
                  Unanswered
                </button>
              </div>
            </div>
          )}
          {questions.length === 0 ? (
            <div className="alert alert-info text-center">
              No questions found. Try adjusting your filters!
            </div>
          ) : (
            questions.map((question) => (
              <QuestionCard key={question.questionId} question={question} />
            ))
          )}
        </div>

        {showFilters && (
          <div className="col-lg-4">
            <SearchByTags tags={tags} setFilters={setFilters} />
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionsComp;
