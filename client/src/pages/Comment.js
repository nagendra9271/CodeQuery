import { IconBtn } from "./IconBtn";
import { FaEdit, FaReply, FaTrash } from "react-icons/fa";
import { usePost } from "../contexts/PostContext";
import { CommentList } from "./CommentList";
import { useState, useEffect, useRef } from "react";
// import { BiUpvote } from "react-icons/bi";
import {
  TbTriangle,
  TbTriangleInverted,
  TbTriangleInvertedFilled,
  TbTriangleFilled,
} from "react-icons/tb";
import { useAsyncFn } from "../hooks/useAsync";
import {
  createComment,
  deleteComment,
  toggleCommentLike,
  updateComment,
} from "../services/comments";
import { CommentForm } from "./CommentForm";
import { useUserContext } from "../contexts/userContext";

export const dateFormatter = (data) => {
  if (data) {
    const date = new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    });
    return date.format(Date.parse(data));
  }
  return;
};

export function Comment({
  id,
  body,
  user,
  createdAt,
  likesCount,
  likedByMe = 0,
  dislikedByMe = 0,
}) {
  const [areChildrenHidden, setAreChildrenHidden] = useState(true);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const {
    post,
    getReplies,
    createLocalComment,
    updateLocalComment,
    deleteLocalComment,
    toggleLocalCommentLike,
    commentFocusId,
  } = usePost();
  const { userDetails: userInfo, isLoggedIn } = useUserContext();
  const createCommentFn = useAsyncFn(createComment);
  const updateCommentFn = useAsyncFn(updateComment);
  const deleteCommentFn = useAsyncFn(deleteComment);
  const toggleCommentLikeFn = useAsyncFn(toggleCommentLike);
  const childComments = getReplies(id);
  const currentUser = userInfo;
  function onCommentReply(body) {
    return createCommentFn
      .execute({
        postId: post.id,
        body: body,
        parentId: id,
        accessToken: userInfo.accessToken,
      })
      .then((response) => {
        const comment = response.data.comments;
        setIsReplying(false);
        setAreChildrenHidden(false);
        createLocalComment(comment);
      });
  }

  function onCommentUpdate(body) {
    return updateCommentFn
      .execute({
        postId: post.id,
        body: body,
        id,
        accessToken: userInfo.accessToken,
      })
      .then((response) => {
        const comment = response.data.comments;
        setIsEditing(false);
        updateLocalComment(id, comment.body);
      });
  }

  function onCommentDelete() {
    return deleteCommentFn
      .execute({ postId: post.id, id, accessToken: userInfo.accessToken })
      .then((response) => {
        const comment = response.data.comments;
        deleteLocalComment(comment.id);
      });
  }

  function onToggleCommentLike(voteStatus) {
    if (!isLoggedIn) {
      alert("please Login to Like the comment!!");
      return;
    }
    if (
      (likedByMe && voteStatus === 1) ||
      (dislikedByMe && voteStatus === -1)
    ) {
      voteStatus = 0;
    }
    return toggleCommentLikeFn
      .execute({
        id,
        postId: post.id,
        accessToken: userInfo.accessToken,
        voteStatus,
      })
      .then((response) => {
        voteStatus = response.data.voteStatus;
        toggleLocalCommentLike(id, voteStatus);
      });
  }
  const divRef = useRef(null);

  useEffect(() => {
    if (id === commentFocusId && divRef.current) {
      divRef.current.focus();
    }
  }, [id, commentFocusId]);
  return (
    <>
      <div
        className="comment"
        tabIndex={0} // Makes the div focusable
        ref={divRef}
      >
        <div className="header">
          <span className="name">{user.name}</span>
          <span className="date">{dateFormatter(createdAt)}</span>
        </div>
        {isEditing ? (
          <CommentForm
            autoFocus
            initialValue={body}
            onSubmit={onCommentUpdate}
            loading={updateCommentFn.loading}
            error={updateCommentFn.error}
          />
        ) : (
          <div className="message">{body}</div>
        )}
        <div className="footer">
          {/* <IconBtn
            onClick={onToggleCommentLike}
            disabled={toggleCommentLikeFn.loading}
            Icon={likedByMe ? FaHeart : FaRegHeart}
            aria-label={likedByMe ? "Unlike" : "Like"}
            title={likedByMe ? "Unlike" : "Like"}
          >
            {likesCount}
          </IconBtn> */}
          <IconBtn
            onClick={() => onToggleCommentLike(1)}
            disabled={toggleCommentLikeFn.loading}
            Icon={likedByMe ? TbTriangleFilled : TbTriangle}
            title="Upvote"
          />
          <span className="fs-5 p-1">{likesCount}</span>
          <IconBtn
            onClick={() => onToggleCommentLike(-1)}
            disabled={toggleCommentLikeFn.loading}
            Icon={dislikedByMe ? TbTriangleInvertedFilled : TbTriangleInverted}
            title="Downvote"
          />
          <IconBtn
            onClick={() => setIsReplying((prev) => !prev)}
            isActive={isReplying}
            Icon={FaReply}
            aria-label={isReplying ? "Cancel Reply" : "Reply"}
            title={isReplying ? "Cancel Reply" : "Reply"}
          />
          {user.id === currentUser.id && (
            <>
              <IconBtn
                onClick={() => setIsEditing((prev) => !prev)}
                isActive={isEditing}
                Icon={FaEdit}
                aria-label={isEditing ? "Cancel Edit" : "Edit"}
                title={isEditing ? "Cancel Edit" : "Edit"}
              />
              <IconBtn
                disabled={deleteCommentFn.loading}
                onClick={onCommentDelete}
                Icon={FaTrash}
                aria-label="Delete"
                title="Delete"
                color="danger"
              />
            </>
          )}
        </div>
        {deleteCommentFn.error && (
          <div className="error-msg mt-1">{deleteCommentFn.error}</div>
        )}
      </div>
      {isReplying && (
        <div className="mt-1 ml-3">
          <CommentForm
            autoFocus
            onSubmit={onCommentReply}
            loading={createCommentFn.loading}
            error={createCommentFn.error}
          />
        </div>
      )}
      {childComments?.length > 0 && (
        <>
          <div
            className={`nested-comments-stack ${
              areChildrenHidden ? "hide" : ""
            }`}
          >
            <button
              className="collapse-line"
              aria-label="Hide Replies"
              onClick={() => setAreChildrenHidden(true)}
            />
            <div className="nested-comments">
              <CommentList comments={childComments} />
            </div>
          </div>
          <button
            className={`btn mt-1 ${!areChildrenHidden ? "hide" : ""}`}
            onClick={() => setAreChildrenHidden(false)}
          >
            Show Replies
          </button>
        </>
      )}
    </>
  );
}
