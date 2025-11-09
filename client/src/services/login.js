import { makeRequest } from "./makeRequest";

export function postLoginCrendatials({ email, password }) {
  return makeRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    headers: { "Content-Type": "application/json" },
  });
}

export function postUserDetails(data) {
  return makeRequest("/signup", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });
}
