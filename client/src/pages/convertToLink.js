export function convertToLinkOrValidate(input, platform = "github") {
  // Base URLs for different platforms
  const platformUrls = {
    github: "https://github.com/",
    leetcode: "https://leetcode.com/u/",
  };

  const baseUrl = platformUrls[platform.toLowerCase()];

  if (input.startsWith(baseUrl)) {
    return { link: input, isCorrect: true };
  } else if (validateUsernameFormat(input, platform)) {
    // Otherwise, treat the input as a username and construct the link
    return { link: `${baseUrl}${input}`, isCorrect: true };
  }
  return {
    isCorrect: false,
  };
}

function validateUsernameFormat(username, platform = "github") {
  const usernamePatterns = {
    github: /^[a-zA-Z0-9-]{1,39}$/, // GitHub: Alphanumeric, hyphens, max 39 characters
    leetcode: /^[a-zA-Z0-9_.]{1,30}$/, // LeetCode: Alphanumeric, underscores, dots, max 30 characters
  };

  // Get the pattern for the platform
  const pattern = usernamePatterns[platform.toLowerCase()];
  if (!pattern) {
    return false;
  }

  // Test the username against the pattern
  if (pattern.test(username)) {
    return true;
  } else {
    return false;
  }
}
