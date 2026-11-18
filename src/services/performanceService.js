const API_URL = "http://localhost:5000";

export const getPerformanceReviews = async () => {
  const response = await fetch(`${API_URL}/performanceReviews`);

  if (!response.ok) {
    throw new Error("Failed to fetch performance reviews");
  }

  return response.json();
};

export const getEmployeePerformanceReviews = async (employeeId) => {
  const response = await fetch(
    `${API_URL}/performanceReviews?employeeId=${encodeURIComponent(employeeId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employee performance reviews");
  }

  return response.json();
};

export const createPerformanceReview = async (reviewData) => {
  const response = await fetch(`${API_URL}/performanceReviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    throw new Error("Failed to create performance review");
  }

  return response.json();
};

export const updatePerformanceReview = async (reviewId, reviewData) => {
  const response = await fetch(
    `${API_URL}/performanceReviews/${reviewId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update performance review");
  }

  return response.json();
};

export const deletePerformanceReview = async (reviewId) => {
  const response = await fetch(
    `${API_URL}/performanceReviews/${reviewId}`,
    { method: "DELETE" }
  );

  if (!response.ok) {
    throw new Error("Failed to delete performance review");
  }

  return true;
};