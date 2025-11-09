import { makeRequest } from "./makeRequest";

const headers = (accessToken) => {
  return {
    "Content-Type": "application/json",
    authorization: `Bearer ${accessToken}`,
  };
};

export function createComment({ postId, body, parentId, accessToken }) {
  parentId = parentId ?? null;
  console.log("Creating comment payload:", { postId, body, parentId });
  return makeRequest(`/questions/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ body, parentId }),
    headers: headers(accessToken),
  });
}

export function updateComment({ postId, body, id, accessToken }) {
  return makeRequest(`/questions/${postId}/comments/${id}`, {
    method: "PUT",
    body: JSON.stringify({ body }),
    headers: headers(accessToken),
  });
}

export function deleteComment({ postId, id, accessToken }) {
  return makeRequest(`/questions/${postId}/comments/${id}`, {
    method: "DELETE",
    body: null,
    headers: { authorization: headers(accessToken).authorization },
  });
}

export function toggleCommentLike({ id, postId, accessToken, voteStatus }) {
  return makeRequest(`/questions/${postId}/comments/${id}/toggleLike`, {
    method: "POST",
    body: JSON.stringify({ voteStatus }),
    headers: headers(accessToken),
  });
}
