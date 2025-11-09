import React from "react";
import { useUser } from "./user";
import MDEditor from "@uiw/react-md-editor";

export default function UserStats() {
  const { userDetails, loading, error } = useUser();

  if (loading || !userDetails)
    return <div className="text-center text-info fs-4">Loading...</div>;
  if (error)
    return (
      <div className="text-center text-danger fs-4">Error: {error.message}</div>
    );

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        {/* About Section */}
        <div className="col-lg-6 col-md-8 col-sm-12 mb-4">
          <div className="card shadow-lg border-light rounded p-4">
            <div className="card-body">
              <h3 className="card-title text-primary mb-3">About</h3>
              <div className="card-text fs-5 text-muted capitalize-first-letter">
                <MDEditor.Markdown
                  source={userDetails.aboutMe}
                  // style={{ whiteSpace: "pre-wrap" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="col-lg-6 col-md-8 col-sm-12 mb-4">
          <div className="card shadow-lg border-light rounded p-4">
            <div className="card-body">
              <h3 className="card-title text-primary mb-3">Stats</h3>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Questions Count:</strong>
                  <span>{userDetails?.questionsCount}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between">
                  <strong>Comments Count:</strong>
                  <span>{userDetails?.commentsCount}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
