import React, { useState, useContext, useRef } from "react";
import { nanoid } from "nanoid";
import TextEditor from "./texteditor";
import { MyContext } from "../App";
import { Link } from "react-router-dom";

export default function AskQuestion({ handleQuestionSubmit }) {
  const context = useContext(MyContext);
  const tags = context.askQuestion.tags;
  const [editTag, setEditTag] = useState({ name: "", id: nanoid() });
  const editTagName = useRef("");

  const handleDiscard = () => {
    context.setAskQuestion({ title: "", tag: "", body: "" });
  };

  const handleChange = (event) => {
    context.setAskQuestion((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  const handleDeleteTags = (e, id) => {
    e.stopPropagation();
    context.setAskQuestion((prev) => ({
      ...prev,
      tags: tags.filter((tag) => tag.id !== id),
    }));
  };

  const handleUpdateTag = (e, id) => {
    if (e.key === "Enter" || e.type === "blur") {
      console.log(editTagName);
      const newName = editTagName.current.value.trim();
      if (newName) {
        context.setAskQuestion((prev) => {
          const tagExists = tags.some((tag) => tag.id === id);
          let updatedTags;

          if (tagExists) {
            updatedTags = tags.map((tag) =>
              tag.id === id ? { ...tag, name: newName } : tag
            );
          } else {
            const newTag = { id, name: newName };
            updatedTags = [...tags, newTag];
          }

          return {
            ...prev,
            tags: updatedTags,
          };
        });
        setEditTag({ name: "", id: nanoid() });
      }
    }
  };

  const InputTag = () => (
    <input
      id="tag"
      key={editTag.id}
      ref={editTagName}
      name="tag"
      type="text"
      maxLength="300"
      className="border-0 bg-transparent flex-grow-1 outline-transparent"
      onBlur={(e) => handleUpdateTag(e, editTag)} // Trigger update on blur
      onKeyDown={(e) => handleUpdateTag(e, editTag)} // Trigger update on enter
      style={{ border: "none", outline: "1px solid transparent" }}
      data-min-length="15"
      data-max-length="150"
    />
  );

  const handleTags = () => {
    return tags.map((tag) => (
      <span
        className="bg-secondary-subtle p-1 m-1"
        onClick={(e) => handleUpdateTag(e, tag.id)}
        key={tag.id}
      >
        {tag.name}
        <button
          className="border-0 bg-transparent"
          type="button"
          title="Remove tag dynamic"
          onClick={(e) => handleDeleteTags(e, tag.id)}
        >
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M12 3.41L10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7z"></path>
          </svg>
        </button>
      </span>
    ));
  };

  // const TagComponent = () => {};

  console.log(editTag);
  return (
    <div className="container-lg">
      <form
        onSubmit={handleQuestionSubmit}
        className="d-flex flex-column justify-content-between align-items-stretch vh-100"
      >
        <div className="d-flex flex-column justify-content-between ">
          <div className="d-flex flex-column align-items-stretch">
            <label htmlFor="title" className="fw-bold fs-20">
              Title
            </label>
            <p
              onClick={() => document.getElementById("title").focus()}
              style={{ cursor: "pointer", color: "inherit" }}
            >
              Be specific and imagine you’re asking a question to another
              person.
            </p>
          </div>
          <input
            id="title"
            name="title"
            type="text"
            maxLength="300"
            placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
            value={context.askQuestion.title}
            data-min-length="15"
            data-max-length="150"
            onChange={handleChange}
          />
        </div>

        <div className="d-flex flex-column ">
          <h3 id="problem-details" className="fw-bolder">
            What are the details of your problem?
          </h3>
          <p
            className="mb-6 mt-1 fw-normal"
            onClick={() => document.getElementById("problem-details").focus()}
            style={{ cursor: "pointer", color: "inherit" }}
          >
            Introduce the problem and expand on what you put in the title.
            Minimum 20 characters.
          </p>
          <TextEditor id="problem-details" />
        </div>

        <div className="d-flex flex-column justify-content-between">
          <div className="d-flex flex-column align-items-stretch">
            <label htmlFor="tag" className="fw-bold fs-20">
              Tag
            </label>
            <p
              onClick={() => document.getElementById("tag").focus()}
              style={{ cursor: "pointer", color: "inherit" }}
            >
              Add up to 5 tags to describe what your question is about. Start
              typing to see suggestions.
            </p>
          </div>
          <div className="d-flex border border-black rounded-3 p-2">
            <span>{handleTags()}</span>
            <InputTag />
          </div>
        </div>

        <div className="d-flex align-items-center align-self-center gap-2">
          <button type="submit" name="submit" className="btn btn-primary">
            Post your question
          </button>
          <Link
            type="button"
            onClick={handleDiscard}
            to="/"
            name="discard"
            className="btn btn-outline-danger"
          >
            Discard draft
          </Link>
        </div>
      </form>
    </div>
  );
}
