import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const DeleteProfile = ({ userId }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleDelete = () => {
    alert("deleted the profile");
  };

  return (
    <div className="settings-content">
      <div className="card shadow p-4">
        <h1 className="card-title">Delete Profile</h1>
        <p className="mt-3">
          Before confirming that you would like your profile deleted, we'd like
          to take a moment to explain the implications of deletion:
        </p>
        <ul className="mt-3">
          <li>
            Deletion is irreversible, and you will have no way to regain any of
            your original content, should this deletion be carried out and you
            change your mind later on.
          </li>
          <li className="mt-2">
            Your questions and comments will remain on the site, but will be
            disassociated and anonymized (the author will be listed as "user
            {userId}
            ") and will not indicate your authorship even if you later return to
            the site.
          </li>
        </ul>

        <div className="form-check mt-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="confirmDelete"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
          <label className="form-check-label" htmlFor="confirmDelete">
            I have read the information stated above and understand the
            implications of having my profile deleted. I wish to proceed with
            the deletion of my profile.
          </label>
        </div>

        <button
          className="btn btn-danger mt-4 w-25"
          disabled={!isChecked}
          onClick={handleDelete}
        >
          Delete profile
        </button>
      </div>
    </div>
  );
};

export default DeleteProfile;
