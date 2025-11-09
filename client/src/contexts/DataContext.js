// src/contexts/DataContext.js
import { createContext, useContext, useState } from "react";

export const DataContext = createContext();

export function useDataContext() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [askQuestion, setAskQuestion] = useState({
    title: "",
    body: "",
    tags: [],
  });

  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <DataContext.Provider
      value={{
        askQuestion,
        setAskQuestion,
        query,
        setQuery,
        loading,
        setLoading,
        error,
        setError,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
