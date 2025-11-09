import React, { useEffect, useState, useCallback } from "react";
import { useUserContext } from "../contexts/userContext";
import { useAsyncFn } from "../hooks/useAsync";
import { getPostsBySearchHistory } from "../services/posts";
import { Link } from "react-router-dom";
import QuestionsComp from "./QuestionsComp";
// Mock dependencies for standalone demo

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="my-4">
    {[...Array(3)].map((_, index) => (
      <div
        key={index}
        className="card shadow-sm border mb-4 p-4 animate-pulse-slow"
      >
        <div className="d-flex align-items-start">
          <div
            className="rounded-circle bg-light"
            style={{ width: "48px", height: "48px" }}
          ></div>
          <div className="ms-3 flex-grow-1">
            <div
              className="bg-light rounded mb-2"
              style={{ height: "16px", width: "75%" }}
            ></div>
            <div
              className="bg-light rounded mb-2"
              style={{ height: "12px", width: "50%" }}
            ></div>
            <div
              className="bg-light rounded mb-2"
              style={{ height: "12px", width: "100%" }}
            ></div>
            <div
              className="bg-light rounded"
              style={{ height: "12px", width: "80%" }}
            ></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Error Component
const ErrorAlert = ({ error, onRetry }) => (
  <div
    className="alert alert-danger border border-danger-subtle rounded p-4 mb-4"
    role="alert"
  >
    <div className="d-flex align-items-center">
      <svg
        className="bi flex-shrink-0 me-2"
        width="20"
        height="20"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex-grow-1">
        <h3 className="fs-6 fw-bold text-danger">Error loading posts</h3>
        <p className="text-danger-emphasis small">
          {error?.message || "Something went wrong"}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-outline-danger btn-sm ms-3"
        >
          Try Again
        </button>
      )}
    </div>
  </div>
);

// Enhanced Hero Section Component
const HeroSection = ({ userName, onAskQuestion }) => (
  <div className="hero-section card border border-light-subtle shadow-sm p-5 mb-5">
    <div className="row align-items-center">
      <div className="col-md-8 d-flex align-items-center">
        <div className="position-relative me-4">
          <div
            className="position-absolute top-0 start-0 rounded-circle bg-primary bg-opacity-10 animate-pulse-slow"
            style={{ width: "64px", height: "64px" }}
          ></div>
          <svg
            className="position-relative text-primary"
            width="64"
            height="64"
            viewBox="0 0 48 48"
            fill="currentColor"
          >
            <path
              d="M37.96 1.57c.67-.34 1.5-.07 1.84.6l5.42 10.75a1.37 1.37 0 1 1-2.46 1.23L37.35 3.41c-.34-.67-.07-1.5.6-1.84m-3.2 5.9c.69-.31 1.5 0 1.81.69l2.32 5.15a1.37 1.37 0 0 1-2.5 1.13L34.06 9.3c-.31-.7 0-1.5.69-1.82"
              opacity="0.6"
            />
            <path d="m11.76 34.62.49.58 2.06 2.56.62.74c4.55 5.47 7.93 7.85 12.87 7.85q3.01 0 6.1-1.58c4.66-2.38 6.58-5.1 8.47-10.81l.58-1.86.43-1.4c1.05-3.4 1.86-6.22 2.57-8.98a4.3 4.3 0 0 0-3.14-5.37l-.21-.06a4.6 4.6 0 0 0-5.41 2.96l-1.27 4.39L26.58 2.6l-.05-.1C25.36.55 23.08-.18 21.16.8c-1.97 1-2.48 2.79-1.55 4.99l.15.32c.4.9 1.56 3.97 2.75 7.18l.53 1.44-6.81-11C15.18 1.97 13 1.5 11.2 2.38l-.18.08c-1.77.95-2.48 2.92-1.36 4.83l4.89 8.33-3.91-4.8A4.5 4.5 0 0 0 7.2 9.04c-3.07 0-4.47 3.05-2.78 5.45l1.7 2.33 3.51 4.86 2.14 2.97-5.63-4.41a5 5 0 0 0-3.02-1.16 2.91 2.91 0 0 0-2.57 4.44l.11.18c.5.77 1.38 1.66 3.25 3.37l3.5 3.16.7.65q1.01.93 1.83 1.77q1.04 1.05 1.81 1.97" />
          </svg>
        </div>
        <div>
          <h1 className="display-6 fw-bold text-dark">
            Welcome{userName ? ` back, ${userName}` : " to Q & As"}
          </h1>
          <p className="text-muted fs-5">
            Find answers to your technical questions and help others with
            theirs.
          </p>
          <div className="d-flex align-items-center mt-2">
            <div className="d-flex align-items-center text-muted small me-4">
              <svg
                className="bi me-1"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Community-driven
            </div>
            <div className="d-flex align-items-center text-muted small">
              <svg
                className="bi me-1"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
              Expert answers
            </div>
          </div>
        </div>
      </div>
      <div className="col-md-4 text-md-end mt-3 mt-md-0">
        <Link
          to="/askquestion"
          className="btn btn-primary btn-lg w-100 w-md-auto mb-2 d-flex align-items-center justify-content-center"
        >
          <svg
            className="bi me-2"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Ask Question
        </Link>
        <Link
          to="/questions"
          className="text-primary text-decoration-underline"
        >
          Browse Questions →
        </Link>
      </div>
    </div>
  </div>
);

// Stats Section Component
const StatsSection = ({ stats }) => (
  <div className="row row-cols-1 row-cols-md-3 g-4 mb-5">
    {[
      {
        label: "Questions Asked",
        value: stats?.totalQuestions || "12.5K",
        icon: "❓",
        color: "text-primary",
      },
      {
        label: "Answers Given",
        value: stats?.totalAnswers || "8.2K",
        icon: "💡",
        color: "text-success",
      },
      {
        label: "Active Users",
        value: stats?.activeUsers || "1.8K",
        icon: "👥",
        color: "text-purple",
      },
    ].map((stat, index) => (
      <div key={index} className="col">
        <div
          className={`stat-card card border border-light-subtle shadow-sm p-4 bg-${stat.color.replace(
            "text-",
            ""
          )}-subtle`}
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <p className="text-muted small mb-1">{stat.label}</p>
              <p className="fs-4 fw-bold text-dark">{stat.value}</p>
            </div>
            <div className={`fs-3 ${stat.color}`}>{stat.icon}</div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State Component
const EmptyState = ({ userName }) => (
  <div className="card text-center border border-light-subtle shadow-sm py-5">
    <div
      className="mx-auto rounded-circle bg-light d-flex align-items-center justify-content-center mb-3"
      style={{ width: "96px", height: "96px" }}
    >
      <svg
        className="bi text-muted"
        width="48"
        height="48"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-6-3a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"
        />
      </svg>
    </div>
    <h3 className="fs-5 fw-bold text-dark mb-2">
      {userName ? `Welcome back, ${userName}!` : "Welcome to Q & As!"}
    </h3>
    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: "400px" }}>
      {userName
        ? "We're building personalized recommendations based on your activity. Start by exploring some questions or asking your own!"
        : "No personalized posts available yet. Start by browsing questions or asking your first question!"}
    </p>
    <div className="d-flex justify-content-center gap-3">
      <Link to="/askquestion" className="btn btn-primary">
        Ask Your First Question
      </Link>
      <Link to="/browse" className="btn btn-outline-secondary">
        Browse Questions
      </Link>
    </div>
  </div>
);

// Main Home Component
export default function Home() {
  const { loading: userLoading, userDetails: userInfo } = useUserContext();
  const [retryCount, setRetryCount] = useState(0);
  const {
    loading: postsLoading,
    error: postsError,
    value: postsResponse,
    execute: fetchPosts,
  } = useAsyncFn(getPostsBySearchHistory);

  const handleFetchPosts = useCallback(() => {
    if (userInfo?.accessToken) {
      fetchPosts({ accessToken: userInfo.accessToken });
    }
  }, [userInfo?.accessToken, fetchPosts]);

  useEffect(() => {
    handleFetchPosts();
  }, [handleFetchPosts]);

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
    handleFetchPosts();
  }, [handleFetchPosts]);

  const handleAskQuestion = useCallback(() => {}, []);

  if (userLoading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div
            className="spinner-border text-primary mb-3"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          ></div>
          <p className="text-muted">Loading your personalized experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <div className="container py-5">
        <HeroSection
          userName={userInfo?.name}
          onAskQuestion={handleAskQuestion}
        />
        <StatsSection stats={{}} />
        <div className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="fs-3 fw-bold text-dark">Recommended for you</h2>
              <p className="text-muted">
                Based on your recent activity and interests
              </p>
            </div>
            <Link
              to="/questions"
              className="text-primary text-decoration-underline"
            >
              View All Questions →
            </Link>
          </div>
          <div>
            {postsLoading && <LoadingSkeleton />}
            {postsError && (
              <ErrorAlert error={postsError} onRetry={handleRetry} />
            )}
            {!postsLoading && !postsError && postsResponse && (
              <div className="card border border-light-subtle shadow-sm">
                <QuestionsComp
                  loading={postsLoading}
                  error={postsError}
                  response={postsResponse}
                  showFilters={false}
                />
              </div>
            )}
            {!postsLoading && !postsError && !postsResponse && (
              <EmptyState userName={userInfo?.name} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
