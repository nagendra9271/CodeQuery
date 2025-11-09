export async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(errorData);
      throw new Error(errorData?.message ?? "Error");
    }
    return await response.json();
  } catch (error) {
    return Promise.reject(error.message ?? "Error");
  }
}
