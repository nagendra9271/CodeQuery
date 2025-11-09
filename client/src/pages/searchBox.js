import React from "react";
import { useNavigate } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { useDataContext } from "../contexts/DataContext";

function SearchBox() {
  const { query, setQuery } = useDataContext();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    if (!query?.trim()) {
      alert("Please enter a valid search query.");
      return;
    }
    document.getElementById("searchBox").blur();
    navigate(`/search?query=${query}`);
  };

  return (
    <Form className="d-flex " style={{ width: "35%" }} onSubmit={handleSearch}>
      <Form.Control
        type="search"
        id="searchBox"
        value={query}
        onChange={handleChange}
        placeholder="Search"
        className="mr-auto"
        aria-label="Search"
      />
    </Form>
  );
}

export default SearchBox;
