import { makeRequest } from "./makeRequest";
const headers = (accessToken) => {
  return {
    "Content-Type": "application/json",
    authorization: `Bearer ${accessToken}`,
  };
};
export function getPosts(questionVariables) {
  console.log("questionvariables:", questionVariables);
  return makeRequest(`/questions?orderBy=${questionVariables.orderBy}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags: questionVariables.tags }),
  });
}

export function getPostsBySearchHistory({ accessToken }) {
  return makeRequest(`/questions/history`, {
    method: "GET",
    headers: headers(accessToken),
  });
}

export function getPostsBySearch({ query, tags, orderBy }) {
  return makeRequest(
    `/search?${query ? `query=${query}` : ""}${
      orderBy ? `&orderBy=${orderBy}` : ""
    }`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: tags }),
    }
  );
}

export function getPost(id, accessToken) {
  const headers = accessToken
    ? { authorization: `Bearer ${accessToken}` }
    : undefined;
  return makeRequest(`/questions/${id}`, { headers });
}

export function toggleQuestionLike({ id, accessToken, voteStatus }) {
  return makeRequest(`/questions/${id}/toggleLike`, {
    method: "POST",
    body: JSON.stringify({ voteStatus }),
    headers: headers(accessToken),
  });
}

export function getTags({ label }) {
  return makeRequest("/question/tags", {
    method: "POST",
    body: JSON.stringify({ label }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
