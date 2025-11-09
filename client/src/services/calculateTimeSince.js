export function calculateTimeSince(dateString) {
  if (!dateString) return "Unknown";
  const updatedDate = new Date(dateString);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - updatedDate); // Time difference in milliseconds

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
  if (diffDays > 0) return `${diffDays} days ago`;

  const diffHours = Math.floor(diffTime / (1000 * 60 * 60)); // Convert to hours
  if (diffHours > 0) return `${diffHours} hours ago`;

  const diffMinutes = Math.floor(diffTime / (1000 * 60)); // Convert to minutes
  if (diffMinutes > 0) return `${diffMinutes} minutes ago`;

  return "Just now";
}
