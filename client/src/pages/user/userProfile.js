import React from "react";
import { calculateTimeSince } from "../../services/calculateTimeSince";
import avatar from "../../assests/avatar.jpeg";
import { FaLocationDot } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
export default function UserProfile({ userDetails }) {
  return (
    <div className="user-profile">
      <img
        src={avatar || "default-avatar.png"}
        alt="User Avatar"
        className="user-avatar"
      />
      <div className="user-info">
        <h2 className="user-name">{userDetails?.userName || "Unknown User"}</h2>
        <div className="user-meta">
          <span>
            Created:{" "}
            {userDetails?.createdAt
              ? calculateTimeSince(userDetails.createdAt)
              : "Date not available"}
          </span>
          <span>
            <FaLocationDot /> {userDetails?.location || "Location not set"}
          </span>
        </div>
        <div className="user-links">
          {userDetails?.github && (
            <a
              href={userDetails.github}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub /> GitHub Profile
            </a>
          )}
          {userDetails?.leetcode && (
            <a
              href={userDetails.leetcode}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SiLeetcode /> LeetCode Profile
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
