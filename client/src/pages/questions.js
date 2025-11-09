import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAsyncFn } from "../hooks/useAsync";
import { getPosts } from "../services/posts";
import QuestionsComp from "./QuestionsComp";

export function Questions() {
  const { loading, error, value: response, execute } = useAsyncFn(getPosts);
  const [searchParams, setSearchParams] = useSearchParams();
  const tags = searchParams.getAll("tag");
  const orderBy = searchParams.get("orderBy") || "new";

  // Fetch questions when filters change
  useEffect(() => {
    const tags = searchParams.getAll("tag");
    const orderBy = searchParams.get("orderBy");
    execute({ tags, orderBy });
  }, [execute, searchParams]);

  const setFilters = ({
    orderBy: newOrderBy = orderBy,
    tags: newTags = tags,
  }) => {
    setSearchParams((params) => {
      // Update `orderBy` only if it's different
      if (newOrderBy && newOrderBy !== orderBy) {
        params.set("orderBy", newOrderBy);
      } else if (!newOrderBy) {
        params.delete("orderBy");
      }
      // Update `tags` only if they're different
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
    <QuestionsComp
      loading={loading}
      error={error}
      response={response}
      tags={tags}
      orderBy={orderBy}
      setFilters={setFilters}
    />
  );
}
