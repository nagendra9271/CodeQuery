import React from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import "../../styles/Settings.css";
import EditProfile from "./EditProfile";
import DeleteProfile from "./DeleteProfile";
import Logout from "../logout";
import { useUser } from "../user/user";

const ChangePassword = () => (
  <div className="settings-content">
    <div className="settings-header">
      <h3>Change Password</h3>
      <p className="text-muted">
        Update your account password for better security
      </p>
    </div>
    <div className="settings-body">
      <form>
        <div className="form-group mb-3">
          <label htmlFor="currentPassword" className="form-label">
            Current Password
          </label>
          <input
            type="password"
            className="form-control"
            id="currentPassword"
            placeholder="Enter your current password"
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="newPassword" className="form-label">
            New Password
          </label>
          <input
            type="password"
            className="form-control"
            id="newPassword"
            placeholder="Enter new password"
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            Confirm New Password
          </label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            placeholder="Confirm new password"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update Password
        </button>
      </form>
    </div>
  </div>
);

function Settings({ userId, userDetails }) {
  if (!userDetails) {
    return (
      <div className="settings-container">
        <div className="settings-wrapper">
          <div className="settings-header-main">
            <h2>Settings</h2>
            <p>Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-wrapper">
        <div className="settings-header-main">
          <h2>Settings</h2>
          <p>Manage your account preferences and security</p>
        </div>

        <div className="settings-body-wrapper">
          <nav className="settings-nav fixed-sidebar">
            <NavLink
              to="edit"
              className={({ isActive }) =>
                `settings-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="settings-nav-icon">👤</span>
              Edit Profile
            </NavLink>
            <NavLink
              to="delete"
              className={({ isActive }) =>
                `settings-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="settings-nav-icon">🗑️</span>
              Delete Profile
            </NavLink>
            <NavLink
              to="changepassword"
              className={({ isActive }) =>
                `settings-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="settings-nav-icon">🔒</span>
              Change Password
            </NavLink>
            <NavLink
              to="logout"
              className={({ isActive }) =>
                `settings-nav-item ${isActive ? "active" : ""}`
              }
            >
              <span className="settings-nav-icon">🚪</span>
              Logout
            </NavLink>
          </nav>

          <div className="settings-content-wrapper">
            <Routes>
              <Route
                index
                element={<EditProfile userDetails={userDetails} />}
              />
              <Route
                path="edit"
                element={<EditProfile userDetails={userDetails} />}
              />
              <Route
                path="delete"
                element={<DeleteProfile userId={userId} />}
              />
              <Route path="changepassword" element={<ChangePassword />} />
              <Route path="logout" element={<Logout />} />
              <Route
                path="*"
                element={<EditProfile userDetails={userDetails} />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
