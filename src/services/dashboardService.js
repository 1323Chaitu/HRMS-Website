
const API_URL = "http://localhost:5000";

export const getDashboardData = async () => {
  try {
    const endpoints = [
      "employees",
      "attendance",
      "leaves",
      "payroll"
    ];

    const responses = await Promise.all(
      endpoints.map((endpoint) =>
        fetch(`${API_URL}/${endpoint}`)
      )
    );

    if (responses.some((response) => !response.ok)) {
      throw new Error("Failed to fetch dashboard data");
    }

    const [
      employees,
      attendance,
      leaves,
      payroll
    ] = await Promise.all(
      responses.map((response) => response.json())
    );

    return {
      employees,
      attendance,
      leaves,
      payroll
    };

  } catch (error) {
    throw new Error(
      error.message || "Unable to load dashboard"
    );
  }
};
