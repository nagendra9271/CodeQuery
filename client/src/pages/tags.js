import { nanoid } from "nanoid";
import React, { useState } from "react";
import { useAsyncFn } from "../hooks/useAsync";
import { getTags } from "../services/posts";
import { useDataContext } from "../contexts/DataContext";
import AsyncCreatableSelect from "react-select/async-creatable";

function Tags() {
  const { askQuestion, setAskQuestion } = useDataContext();
  // const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const getTagsFn = useAsyncFn(getTags);

  // Load options dynamically
  const loadOptions = async (inputValue, callback) => {
    setIsLoading(true);
    try {
      const response = await getTagsFn.execute({
        label: inputValue.toLowerCase(),
      });
      const tags = response.tags;
      if (Array.isArray(tags)) {
        const options = tags.map((tag) => ({
          value: tag.id,
          label: tag.label,
        }));
        callback(options);
      } else {
        console.error("Invalid API response format. Expected an array.");
        callback([]);
      }
    } catch (error) {
      console.error("Failed to load tags:", error);
      callback([]); // Return empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = (inputValue) => {
    const newOption = { label: inputValue, id: nanoid() }; // Unique value with nanoid
    setAskQuestion((prev) => {
      return {
        ...prev,
        tags: [...prev.tags, newOption],
      };
    });
  };

  const handleChange = (tags) => {
    setAskQuestion((prev) => {
      const temp = tags.map((tag) => {
        return { label: tag.label, id: tag.value };
      });
      return {
        ...prev,
        tags: temp,
      };
    });
  };

  return (
    <AsyncCreatableSelect
      isMulti
      menuPlacement="top"
      loadOptions={loadOptions}
      onChange={handleChange}
      onCreateOption={handleCreate}
      value={askQuestion.tags.map((tag) => {
        return { label: tag.label, value: tag.id };
      })}
      placeholder="Start typing to search or create..."
      isLoading={isLoading} // Show loading state
    />
  );
}

export default Tags;
