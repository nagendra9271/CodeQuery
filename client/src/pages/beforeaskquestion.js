import React, { useState, useContext, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import TextEditor from "./texteditor";
import { MyContext } from "../App";
import { Link } from "react-router-dom";
import Tags from "./tags";

export default function AskQuestion({ handleQuestionSubmit, dataLengthRange }) {
  const context = useContext(MyContext);
  const tags = context.askQuestion.tags;
  // const [currentEditTag, setCurrentEditTag] = useState({
  //   name: "",
  //   id: nanoid(),
  // });
  // const tagOptions = [
  //   { value: "javascript", label: "JavaScript" },
  //   { value: "react", label: "React" },
  //   { value: "css", label: "CSS" },
  // ];

  // const tagOptionsFromContext = context.askQuestion.tags.map((tag) => ({
  //   value: tag.name,
  //   label: tag.name,
  // }));
  // const [shouldFocusInputTag, setShouldFocusInputTag] = useState(false);
  const inputRef = useRef("");

  // useEffect(() => {
  //   // Focus the input whenever the current tag is reset
  //   if (shouldFocusInputTag && inputRef.current) {
  //     inputRef.current.focus();
  //   }
  // }, [tags, currentEditTag, shouldFocusInputTag]);

  const handleDiscard = () => {
    context.setAskQuestion({ title: "", tag: [], body: "" });
  };

  const handleChangeTitle = (event) => {
    context.setAskQuestion((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  };

  // const handleDeleteTag = (e, id) => {
  //   e.stopPropagation();
  //   context.setAskQuestion((prev) => ({
  //     ...prev,
  //     tags: tags.filter((tag) => tag.id !== id),
  //   }));
  // };

  // const handleTagChange = (event) => {
  //   setCurrentEditTag((prev) => {
  //     return {
  //       ...prev,
  //       name: event.target.value,
  //     };
  //   });
  // };

  // const handleEditTag = (e, id) => {
  //   const tag = tags.find((tag) => tag.id === id);
  //   setCurrentEditTag(tag);
  // };

  // const handleUpdateTags = (e) => {
  //   if (e.key === "Enter" || e.type === "blur") {
  //     e.preventDefault();
  //     const newName = currentEditTag.name.trim();
  //     const id = currentEditTag.id;
  //     if (newName) {
  //       context.setAskQuestion((prev) => {
  //         const tagExists = tags.some((tag) => tag.id === id);
  //         let updatedTags;

  //         if (tagExists) {
  //           updatedTags = tags.map((tag) =>
  //             tag.id === id ? { ...tag, name: newName } : tag
  //           );
  //         } else {
  //           const newTag = { id, name: newName };
  //           updatedTags = [...tags, newTag];
  //         }

  //         return {
  //           ...prev,
  //           tags: updatedTags,
  //         };
  //       });
  //     }
  //     setCurrentEditTag({ name: "", id: nanoid() });
  //     if (e.type !== "blur") {
  //       setShouldFocusInputTag(true);
  //     } else if (shouldFocusInputTag) {
  //       setShouldFocusInputTag(false);
  //     }
  //   }
  //   // useEffect(()=>{
  //   //   setCurrentEditTag({name:"",id:nanoid()})
  //   // },[tags])
  // };

  // const InputTag = () => {
  //   return (
  //     <input
  //       ref={inputRef}
  //       id="tag"
  //       name="tag"
  //       type="text"
  //       maxLength="300"
  //       className="border-0 bg-transparent  outline-transparent flex-grow-1"
  //       style={{ border: "none", outline: "1px solid transparent" }}
  //       key={currentEditTag.id}
  //       value={currentEditTag.name}
  //       onChange={handleTagChange}
  //       onKeyDown={handleUpdateTags}
  //       onBlur={handleUpdateTags}
  //     />
  //   );
  // };

  // const TagComponent = (tag) => {
  //   return (
  //     <span
  //       className="bg-secondary-subtle p-1 m-1 rounded "
  //       key={tag.id}
  //       onClick={(e) => handleEditTag(e, tag.id)}
  //     >
  //       {tag.name}
  //       <button
  //         className="border-0 bg-transparent"
  //         type="button"
  //         title="Remove tag dynamic"
  //         onClick={(e) => handleDeleteTag(e, tag.id)}
  //       >
  //         <svg width="14" height="14" viewBox="0 0 14 14">
  //           <path d="M12 3.41L10.59 2 7 5.59 3.41 2 2 3.41 5.59 7 2 10.59 3.41 12 7 8.41 10.59 12 12 10.59 8.41 7z"></path>
  //         </svg>
  //       </button>
  //     </span>
  //   );
  // };

  // const handleTags = () => {
  //   let components = [[], [], []];
  //   let tagExists = 0;
  //   for (let tag of tags) {
  //     if (tag.id === currentEditTag.id) {
  //       components[1] = InputTag();
  //       tagExists = 1;
  //     } else if (!tagExists) {
  //       components[0].push(TagComponent(tag));
  //     } else {
  //       components[2].push(TagComponent(tag));
  //     }
  //   }
  //   if (!tagExists) components[1] = InputTag();
  //   return components;
  // };
  // console.log("hello");
  // const [beforeTags, inputTag, afterTags] = handleTags();
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
            maxLength="100"
            placeholder="e.g. Is there an R function for finding the index of an element in a vector?"
            value={context.askQuestion.title}
            onChange={handleChangeTitle}
          />
          <p style={{ color: "red" }}>
            {context.askQuestion.title.length > dataLengthRange.title[1]
              ? `!maximum upto ${dataLengthRange.title[1]} character only.`
              : context.askQuestion.title.length < dataLengthRange.title[0]
              ? `minimum ${dataLengthRange.title[0]} characters required.`
              : ""}
          </p>
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
          <p style={{ color: "red", fontSize: "15px" }}>
            {context.askQuestion.body.length > dataLengthRange.body[1]
              ? `!maximum upto ${dataLengthRange.body[1]} character only.`
              : context.askQuestion.body.length < dataLengthRange.body[0]
              ? `minimum  ${dataLengthRange.body[0]} characters required.`
              : ""}
          </p>
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
              Add up to {dataLengthRange.maxTags} tags to describe what your
              question is about. Start typing to see suggestions.
            </p>
          </div>
          {/* <div className="d-flex flex-row flex-wrap border border-black rounded-3 p-2">
            <span className="">
              {beforeTags === undefined ? "" : beforeTags}
            </span>
            {inputTag}
            <span className="ml-2">
              {afterTags === undefined ? "" : afterTags}
            </span>
          </div> */}
          <Tags />
          <p style={{ color: "red" }}>
            {tags.length > dataLengthRange.maxTags
              ? `!Maximum upto ${dataLengthRange.maxTags} Tags only.`
              : tags.length < 1
              ? "minimum 1 tag required"
              : ""}
          </p>
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
