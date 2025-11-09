import { makeRequest } from "./makeRequest";
const headers = (accessToken) => {
  return {
    "Content-Type": "application/json",
    authorization: `Bearer ${accessToken}`,
  };
};

export function getUserDetails({ id }) {
  return makeRequest(`/user/${id}/profile`);
}

export function getUserQuestions({ id }) {
  return makeRequest(`/user/${id}/questions`);
}

export function getUserComments({ id }) {
  return makeRequest(`/user/${id}/comments`);
}

export function getUserVotes({ id }) {
  return makeRequest(`/user/${id}/votes`);
}

export function editProfile(data, accessToken) {
  return makeRequest("/user/editprofile", {
    method: "PUT",
    headers: headers(accessToken),
    body: JSON.stringify(data),
  });
}

export function deleteProfile(accessToken) {
  return makeRequest("user/deleteprofile", {
    method: "DELETE",
    body: null,
    headers: { authorization: headers(accessToken).authorization },
  });
}
