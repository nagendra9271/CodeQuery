import React from "react";
import { Link } from "react-router-dom";
import { usePost } from "../contexts/PostContext";
import { useAsyncFn } from "../hooks/useAsync";
import { createComment } from "../services/comments";
import { toggleQuestionLike } from "../services/posts";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { dateFormatter } from "./Comment";
import {
  TbTriangle,
  TbTriangleInverted,
  TbTriangleInvertedFilled,
  TbTriangleFilled,
} from "react-icons/tb";
import { PiEyeBold } from "react-icons/pi";
import { BiLike } from "react-icons/bi";
import { FaUserCircle } from "react-icons/fa";
import { Icon, IconBtn } from "./IconBtn";
import { useUserContext } from "../contexts/userContext";
import "../styles/Post.css";
import MDEditor from "@uiw/react-md-editor";

export function Post() {
  const { isLoggedIn } = useUserContext();
  const {
    post,
    rootComments,
    createLocalComment,
    accessToken,
    toggleLocalQuestionLike,
  } = usePost();
  const {
    loading: commentLoading,
    error: commentError,
    execute: createCommentFn,
  } = useAsyncFn(createComment);
  const { loading: likeLoading, execute: toggleQuestionLikeFn } =
    useAsyncFn(toggleQuestionLike);

  const handleCommentCreate = (message) => {
    if (!isLoggedIn) {
      alert("Please login to comment!!");
      return;
    }
    return createCommentFn({
      postId: post.id,
      body: message,
      accessToken,
    }).then((response) => {
      createLocalComment(response.data.comments);
      return true;
    });
  };

  const handleToggleQuestionLike = (voteStatus) => {
    if (!isLoggedIn) {
      alert("Please login to like the question!!");
      return;
    }
    if (
      (post.likedByMe && voteStatus === 1) ||
      (post.dislikedByMe && voteStatus === -1)
    ) {
      voteStatus = 0;
    }
    return toggleQuestionLikeFn({ id: post.id, accessToken, voteStatus }).then(
      (response) => {
        toggleLocalQuestionLike(response.data.voteStatus);
      }
    );
  };

  const renderPostDetails = () => (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h1 className="card-title mb-3">{post.title}</h1>
        <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
          <div className="d-flex align-items-center gap-2">
            <Icon Icon={FaUserCircle} color="text-primary" title="Author" />
            <Link
              className="text-decoration-none fw-medium text-primary"
              to={`/u/${post.userId}`}
            >
              {post.userName}
            </Link>
            <span className="ms-2">•</span>
            <span>{dateFormatter(post.createdAt)}</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <Icon Icon={PiEyeBold} color="text-secondary" title="Views">
              <span className="ms-1">{post.viewsCount}</span>
            </Icon>
            <Icon Icon={BiLike} color="text-secondary" title="Likes">
              <span className="ms-1">{post.likesCount}</span>
            </Icon>
          </div>
        </div>
        <hr className="my-3" />
        <div className="d-flex">
          <div className="d-flex flex-column align-items-center gap-2 me-3">
            <IconBtn
              Icon={post.likedByMe ? TbTriangleFilled : TbTriangle}
              onClick={() => handleToggleQuestionLike(1)}
              disabled={likeLoading}
              title="Upvote"
              className="bg-light rounded-circle p-2"
            />
            <span className="fs-5">{post.likesCount}</span>
            <IconBtn
              Icon={
                post.dislikedByMe
                  ? TbTriangleInvertedFilled
                  : TbTriangleInverted
              }
              onClick={() => handleToggleQuestionLike(-1)}
              disabled={likeLoading}
              title="Downvote"
              className="bg-light rounded-circle p-2"
            />
          </div>
          <div className="flex-grow-1">
            <article className="post-body">
              <MDEditor.Markdown
                source={post.body}
                style={{ whiteSpace: "pre-wrap" }}
              />
            </article>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-lg py-4">
      {renderPostDetails()}
      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="card-title mb-4">Comments</h3>
          <CommentForm
            loading={commentLoading}
            error={commentError}
            onSubmit={handleCommentCreate}
          />
          {rootComments?.length > 0 && (
            <div className="mt-4">
              <CommentList comments={rootComments} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
