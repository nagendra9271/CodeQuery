import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { getPost } from "../services/posts";
import { useUserContext } from "./userContext";
const Context = React.createContext();

export function usePost() {
  return useContext(Context);
}

export function PostProvider({ children }) {
  const { id } = useParams();
  const {
    userDetails: { accessToken },
  } = useUserContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const commentFocusId = parseInt(searchParams.get("onFocus"), 10);
  const {
    loading,
    error,
    value: tempPost,
  } = useAsync(() => getPost(id, accessToken), [id, accessToken]);
  const [post, setPost] = useState(tempPost?.data?.question);
  const [comments, setComments] = useState([]);
  useEffect(() => {
    const post = tempPost?.data?.question;
    if (post == null) return;
    setPost(post);
    if (post?.comments == null) return;
    setComments(post?.comments);
  }, [tempPost]);

  const commentsByParentId = useMemo(() => {
    const group = {};
    comments.forEach((comment) => {
      group[comment.parentId] ||= [];
      group[comment.parentId].push(comment);
    });
    return group;
  }, [comments]);

  function getReplies(parentId) {
    return commentsByParentId[parentId];
  }

  function createLocalComment(comment) {
    console.log("Creating comment new:", comment);
    setComments((prevComments) => {
      return [comment, ...prevComments];
    });
  }

  function updateLocalComment(id, body) {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (comment.id === id) {
          return { ...comment, body };
        } else {
          return comment;
        }
      });
    });
  }

  function deleteLocalComment(id) {
    setComments((prevComments) => {
      return prevComments.filter((comment) => comment.id !== id);
    });
  }
  function toggleLocalQuestionLike(voteStatus) {
    setPost((post) => {
      if (voteStatus) {
        let count = voteStatus;
        if (post.likedByMe || post.dislikedByMe) count = 2 * voteStatus;
        return {
          ...post,
          likesCount: post.likesCount + count,
          likedByMe: voteStatus === 1 ? true : false,
          dislikedByMe: voteStatus === -1 ? true : false,
        };
      } else {
        const value = post.likedByMe ? -1 : 1;
        return {
          ...post,
          likesCount: post.likesCount + value,
          likedByMe: false,
          dislikedByMe: false,
        };
      }
    });
  }
  function toggleLocalCommentLike(id, voteStatus) {
    setComments((prevComments) => {
      return prevComments.map((comment) => {
        if (id === comment.id) {
          console.log("liked comment:", comment, "vote:", voteStatus);
          if (voteStatus) {
            let count = voteStatus;
            if (comment.likedByMe || comment.dislikedByMe)
              count = 2 * voteStatus;
            return {
              ...comment,
              likesCount: comment.likesCount + count,
              likedByMe: voteStatus === 1 ? true : false,
              dislikedByMe: voteStatus === -1 ? true : false,
            };
          } else {
            const value = comment.likedByMe ? -1 : 1;
            return {
              ...comment,
              likesCount: comment.likesCount + value,
              likedByMe: false,
              dislikedByMe: false,
            };
          }
        } else {
          return comment;
        }
      });
    });
  }

  return (
    <Context.Provider
      value={{
        post: { id, ...post },
        toggleLocalQuestionLike,
        rootComments: commentsByParentId[null],
        getReplies,
        createLocalComment,
        updateLocalComment,
        deleteLocalComment,
        toggleLocalCommentLike,
        accessToken,
        commentFocusId,
      }}
    >
      {loading ? (
        <h1>Loading</h1>
      ) : error ? (
        <h1 className="error-msg">{error}</h1>
      ) : (
        children
      )}
    </Context.Provider>
  );
}
