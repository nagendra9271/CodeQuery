import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAsyncFn } from "../hooks/useAsync";
import { getPostsBySearch } from "../services/posts";
import { useSearchParams } from "react-router-dom";
import QuestionsComp from "./QuestionsComp";
import { useDataContext } from "../contexts/DataContext";

export default function Search() {
  const {
    loading,
    error,
    value: response,
    execute,
  } = useAsyncFn(getPostsBySearch);
  const { setQuery } = useDataContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query");
  const tags = searchParams.getAll("tag");
  const orderBy = searchParams.get("orderBy");

  useEffect(() => {
    const tags = searchParams.getAll("tag");
    const orderBy = searchParams.get("orderBy");
    const query = searchParams.get("query");
    setQuery(query);
    execute({ tags, query, orderBy });
  }, [execute, searchParams, setQuery]);

  const setFilters = ({
    orderBy: newOrderBy = orderBy,
    tags: newTags = tags,
  }) => {
    setSearchParams((params) => {
      if (newOrderBy && newOrderBy !== orderBy) {
        params.set("orderBy", newOrderBy);
      } else if (!newOrderBy) {
        params.delete("orderBy");
      }

      if (
        newTags &&
        JSON.stringify(newTags.sort()) !== JSON.stringify(tags.sort())
      ) {
        params.delete("tag");
        newTags.forEach((tag) => params.append("tag", tag));
      } else if (!newTags || newTags.length === 0) {
        params.delete("tag");
      }

      return params;
    });
  };

  return (
    <div className="container-lg my-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Search Results</h2>
            <Link
              id="ask-question-button"
              to="/askquestion"
              className="btn btn-primary text-white"
              aria-label="Ask a new question"
            >
              Ask Question
            </Link>
          </div>
          {query && (
            <p className="mb-4 text-muted fs-5">Results for "{query}"</p>
          )}
          <QuestionsComp
            setFilters={setFilters}
            response={response}
            tags={tags}
            orderBy={orderBy}
            loading={loading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}
