// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./App.css";

// Pages
import NavbarComp from "./pages/Navbarcomp";
import Login from "./pages/login";
import Home from "./pages/home";
import { Questions } from "./pages/questions";
import AskQuestion from "./pages/askquestion";
import SignUp from "./pages/signup";
import { User } from "./pages/user/user";
import { Post } from "./pages/Posts";
import { PostProvider } from "./contexts/PostContext";
import Search from "./pages/search";

// Context Providers
import { UserProvider } from "./contexts/userContext";
import { DataProvider } from "./contexts/DataContext";

const dataLengthRange = {
  maxTags: 5,
  title: [5, 100],
  body: [20, 1000],
};

export function App() {
  return (
    <UserProvider>
      <DataProvider>
        <NavbarComp />

        <Routes>
          <Route index element={<Home />} />

          <Route path="/login" element={<Login />} />

          <Route path="/signup" element={<SignUp />} />

          <Route path="/questions" element={<Questions />} />

          <Route
            path="/askquestion"
            element={<AskQuestion dataLengthRange={dataLengthRange} />}
          />

          <Route
            path="/questions/:id"
            element={
              <PostProvider>
                <Post />
              </PostProvider>
            }
          />

          <Route path="/search" element={<Search />} />

          <Route path="/u/:userId/*" element={<User />} />
        </Routes>
      </DataProvider>
    </UserProvider>
  );
}
