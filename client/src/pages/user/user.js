import React, {
  useEffect,
  useContext,
  createContext,
  useState,
  useMemo,
} from "react";
import { useUserContext } from "../../contexts/userContext";
import { useAsyncFn } from "../../hooks/useAsync";
import { getUserDetails } from "../../services/user";
import {
  Routes,
  Route,
  NavLink,
  useParams,
  useLocation,
} from "react-router-dom";

import UserQuestions from "./userQuestions";
import UserComments from "./userComments";
import UserVotes from "./userVotes";
import Settings from "../settings/settings";
import UserProfile from "./userProfile";
import UserStats from "./userStats";
import { ProtectedRoute } from "../ProtectedRoute";

const UserPageContext = createContext();
export const useUser = () => useContext(UserPageContext);

export function User() {
  const { userId } = useParams();
  const parsedUserId = parseInt(userId, 10);
  const { userDetails: loggedInUser } = useUserContext();

  const [userDetails, setUserDetails] = useState(null);
  const location = useLocation();

  const {
    loading,
    error,
    value: response,
    execute,
  } = useAsyncFn(getUserDetails);

  // Fetch user data when ID changes
  useEffect(() => {
    if (!isNaN(parsedUserId)) {
      execute({ id: parsedUserId });
    }
  }, [parsedUserId]);

  // Store response
  useEffect(() => {
    if (response?.data) {
      setUserDetails(response.data);
    }
  }, [response?.data]);

  // Memoize routes for clarity
  const tabs = useMemo(
    () => [
      { to: "home", label: "Home" },
      { to: "questions", label: "Questions" },
      { to: "comments", label: "Comments" },
      { to: "votes", label: "Votes" },
      ...(parsedUserId === loggedInUser.id
        ? [{ to: "settings", label: "Settings" }]
        : []),
    ],
    [parsedUserId, loggedInUser.id]
  );

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-msg">Error: {error.message}</div>;

  return (
    <UserPageContext.Provider
      value={{ userId: parsedUserId, userDetails, loading, error }}
    >
      <UserProfile userDetails={userDetails} />

      <nav className="mt-4 mb-3">
        <div className="nav nav-tabs">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="tab-content">
        <Routes>
          <Route index element={<UserStats />} />
          <Route path="home" element={<UserStats />} />
          <Route path="questions" element={<UserQuestions />} />
          <Route path="comments" element={<UserComments />} />
          <Route path="votes" element={<UserVotes />} />
          <Route
            path="settings/*"
            element={
              <ProtectedRoute allowedUserId={parsedUserId}>
                <Settings userId={userId} userDetails={userDetails} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </UserPageContext.Provider>
  );
}
