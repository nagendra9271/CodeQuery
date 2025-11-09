export function accessToken({ accessToken, userName, userId }) {
  sessionStorage.setItem("accessToken", accessToken);
  sessionStorage.setItem("userName", userName);
  sessionStorage.setItem("userId", userId);
  return;
}
