import React, { useState, useMemo, useCallback } from "react";
import AsyncSelect from "react-select/async";
import { useAsyncFn } from "../hooks/useAsync";
import { getTags } from "../services/posts";
import _ from "lodash";
import PropTypes from "prop-types";

function SearchByTags({ setFilters, tags }) {
  const [isLoading, setIsLoading] = useState(false);
  const getTagsFn = useAsyncFn(getTags);

  // Memoize the loadOptions function
  const loadOptions = useCallback(
    async (inputValue) => {
      setIsLoading(true);
      try {
        if (!inputValue.trim()) {
          return [];
        }
        const response = await getTagsFn.execute({
          label: inputValue.toLowerCase(),
        });
        if (Array.isArray(response.tags)) {
          return response.tags.map((tag) => ({
            value: tag.id,
            label: tag.label,
          }));
        } else {
          console.error("Invalid API response format. Expected an array.");
          return [];
        }
      } catch (error) {
        console.error("Failed to load tags:", error);
        return []; // Return empty array on error
      } finally {
        setIsLoading(false);
      }
    },
    [getTagsFn.execute]
  );

  // Debounce the loadOptions function to avoid excessive API calls
  const debouncedLoadOptions = useMemo(
    () =>
      _.debounce((inputValue, callback) => {
        loadOptions(inputValue).then(callback);
      }, 300),
    [loadOptions] // Recreate debounced function only when loadOptions changes
  );

  // Handle changes in selected tags
  const handleChange = (selectedTags) => {
    setFilters({
      tags: selectedTags.map((tag) => tag.label),
    });
  };

  // Format the current tags for the AsyncSelect component
  const formattedTags = useMemo(
    () => tags.map((tag, index) => ({ label: tag, value: index })),
    [tags]
  );

  return (
    <div
      className=" m-2 border border-1 p-2 rounded-2"
      style={{ flex: "2", maxHeight: "400px" }}
    >
      <h2>Tags</h2>
      <div className="d-flex">
        <div className="flex-grow-1">
          <AsyncSelect
            isMulti
            loadOptions={debouncedLoadOptions}
            onChange={handleChange}
            value={formattedTags}
            placeholder="Search for tags"
            isLoading={isLoading} // Show loading state
            noOptionsMessage={() => "No tags found"} // Custom message when no options are available
            loadingMessage={() => "Loading..."} // Custom message while loading
            cacheOptions // Enable caching for loadOptions
          />
        </div>
      </div>
    </div>
  );
}

// PropTypes for type checking
SearchByTags.propTypes = {
  setFilters: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(SearchByTags);
