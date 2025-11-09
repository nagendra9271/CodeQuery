// src/contexts/UserContext.js
import { createContext, useContext, useState, useEffect } from "react";

export const UserContext = createContext();

export function useUserContext() {
  return useContext(UserContext);
}

export function UserProvider({ children }) {
  const [userDetails, setUserDetails] = useState({
    accessToken: null,
    name: "",
    email: "",
    id: null,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("userDetails");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUserDetails(parsed);
      setIsLoggedIn(!!parsed.accessToken);
    }
  }, []);

  const handleLoginSuccess = (data) => {
    sessionStorage.setItem("userDetails", JSON.stringify(data));
    setUserDetails(data);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userDetails");
    setUserDetails({
      accessToken: null,
      name: "",
      email: "",
      id: null,
    });
    setIsLoggedIn(false);
  };

  return (
    <UserContext.Provider
      value={{
        userDetails,
        setUserDetails: handleLoginSuccess,
        isLoggedIn,
        setIsLoggedIn,
        handleLogout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
