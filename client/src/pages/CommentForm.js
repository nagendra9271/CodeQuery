import { useState } from "react";

export function CommentForm({
  loading,
  error,
  onSubmit,
  autoFocus = false,
  initialValue = "",
}) {
  const [body, setBody] = useState(initialValue);

  async function handleSubmit(e) {
    e.preventDefault();
    const result = await onSubmit(body);
    if (result) {
      setBody("");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="comment-form-row">
        <textarea
          autoFocus={autoFocus}
          minLength={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="message-input"
        />
        <button
          className="btn"
          type="submit"
          disabled={loading}
          aria-label="Post"
        >
          {loading ? "Loading" : "Post"}
        </button>
      </div>
      <div className="error-msg">{error}</div>
    </form>
  );
}
