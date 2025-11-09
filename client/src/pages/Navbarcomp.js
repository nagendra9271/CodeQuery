import React, { useContext } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import SearchBox from "./searchBox";
import { useUserContext } from "../contexts/userContext";
import "../styles/NavbarComp.css";
function NavbarComp(props) {
  const { userDetails: userInfo } = useUserContext();
  const userlink = userInfo.id
    ? { name: userInfo.name, to: `/u/${userInfo.id}` }
    : { name: "Login", to: "/login" };

  return (
    <Navbar
      expand="lg"
      className="bg-custom-dark navbar-dark sticky-top"
      style={{ minHeight: "60px" }}
    >
      <Container fluid>
        <Link to="/" className="navbar-brand text-white">
          Home
        </Link>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Link to="/questions" className="nav-link text-white">
              Questions
            </Link>
            <Link to="/askquestion" className="nav-link text-white">
              Ask a question
            </Link>
          </Nav>
          <SearchBox />
          <Nav className="ms-auto">
            <Link
              to={userlink.to}
              className="nav-link text-white fw-semibold"
              style={{ fontSize: "1.1rem" }}
            >
              {userlink.name}
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavbarComp;
