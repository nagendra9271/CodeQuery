import TextEditor from "./texteditor";
import { useDataContext } from "../contexts/DataContext";
import { useUserContext } from "../contexts/userContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Tags from "./tags";
import "../styles/AskQuestion.css";

export default function AskQuestion({ dataLengthRange }) {
  const { askQuestion, setAskQuestion } = useDataContext();
  const { userDetails, isLoggedIn } = useUserContext();
  const navigate = useNavigate();
  const tags = askQuestion.tags;

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    if (
      askQuestion.title.length >= dataLengthRange.title[0] &&
      askQuestion.title.length <= dataLengthRange.title[1] &&
      askQuestion.body.length >= dataLengthRange.body[0] &&
      askQuestion.body.length <= dataLengthRange.body[1] &&
      askQuestion.tags.length <= dataLengthRange.maxTags &&
      askQuestion.tags.length >= 1
    ) {
      if (isLoggedIn === false) {
        alert("Please login to post a question");
        navigate("/login");
        return false;
      }
      const tags = askQuestion.tags.map((tag) => tag.label.toLowerCase());
      let questionDetails = {
        ...askQuestion,
        tags: tags,
        userName: userDetails.name,
      };
      let response = await fetch("/askquestion", {
        method: "POST",
        body: JSON.stringify(questionDetails),
        headers: {
          authorization: `Bearer ${userDetails.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      let data = await response.json();
      if (data.status === "success") {
        alert("Question posted successfully");
        setAskQuestion({ title: "", body: "", tags: [] });
        navigate("/");
        return true;
      }
    }
  };
  const handleDiscard = (e) => {
    const confirmed = window.confirm(
      "Are you sure you want to discard this draft?"
    );
    if (!confirmed) {
      e.preventDefault(); // Stop navigation
      return;
    }
    setAskQuestion({ title: "", tags: [], body: "" });
  };

  const handleBodyChange = (value) => {
    setAskQuestion((prev) => ({
      ...prev,
      body: value || "",
    }));
  };

  const handleChangeTitle = (event) => {
    setAskQuestion((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  return (
    <div className="container-lg my-5">
      <form onSubmit={handleQuestionSubmit} className="card shadow-sm p-4">
        {/* Title Section */}
        <div className="mb-4">
          <label htmlFor="title" className="form-label fw-bold fs-5">
            Title
          </label>
          <p
            className="text-muted mb-2"
            onClick={() => document.getElementById("title").focus()}
            style={{ cursor: "pointer" }}
          >
            Be specific and imagine you're asking a question to another person.
          </p>
          <input
            id="title"
            name="title"
            type="text"
            maxLength="100"
            placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
            value={askQuestion.title}
            onChange={handleChangeTitle}
            className="form-control"
          />
          {askQuestion.title.length > dataLengthRange.title[1] && (
            <p className="text-danger mt-1 small">
              Maximum {dataLengthRange.title[1]} characters allowed.
            </p>
          )}
          {askQuestion.title.length < dataLengthRange.title[0] && (
            <p className="text-danger mt-1 small">
              Minimum {dataLengthRange.title[0]} characters required.
            </p>
          )}
        </div>

        {/* Body Section */}
        <div className="mb-4">
          <h3 className="fw-bold fs-5 mb-2">
            What are the details of your problem?
          </h3>
          <p
            className="text-muted mb-3"
            onClick={() => document.getElementById("problem-details").focus()}
            style={{ cursor: "default" }}
          >
            Introduce the problem and expand on what you put in the title.
            Minimum 20 characters.
          </p>
          <TextEditor
            id="problem-details"
            value={askQuestion.body}
            setValue={handleBodyChange}
            className="border rounded"
          />
          {askQuestion.body.length > dataLengthRange.body[1] && (
            <p className="text-danger mt-2 small">
              Maximum {dataLengthRange.body[1]} characters allowed.
            </p>
          )}
          {askQuestion.body.length < dataLengthRange.body[0] && (
            <p className="text-danger mt-2 small">
              Minimum {dataLengthRange.body[0]} characters required.
            </p>
          )}
        </div>

        {/* Tags Section */}
        <div className="mb-4">
          <label htmlFor="tag" className="form-label fw-bold fs-5">
            Tags
          </label>
          <p
            className="text-muted mb-2"
            onClick={() => document.getElementById("tag").focus()}
            style={{ cursor: "pointer" }}
          >
            Add up to {dataLengthRange.maxTags} tags to describe what your
            question is about. Start typing to see suggestions.
          </p>
          <Tags />
          {tags.length > dataLengthRange.maxTags && (
            <p className="text-danger mt-1 small">
              Maximum {dataLengthRange.maxTags} tags allowed.
            </p>
          )}
          {tags.length < 1 && (
            <p className="text-danger mt-1 small">Minimum 1 tag required.</p>
          )}
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-start gap-3">
          <button type="submit" className="btn btn-primary px-4">
            Post Your Question
          </button>
          <Link
            to="/"
            onClick={handleDiscard}
            className="btn btn-outline-danger px-4"
          >
            Discard Draft
          </Link>
        </div>
      </form>
    </div>
  );
}
