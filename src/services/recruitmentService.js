const API_URL = "http://localhost:5000";

export const getJobs = async () => {
  const response = await fetch(`${API_URL}/jobs`);
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return response.json();
};

export const createJob = async (jobData) => {
  const response = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) throw new Error("Failed to create job");
  return response.json();
};

export const updateJob = async (jobId, jobData) => {
  const response = await fetch(`${API_URL}/jobs/${jobId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });

  if (!response.ok) throw new Error("Failed to update job");
  return response.json();
};

export const deleteJob = async (jobId) => {
  const response = await fetch(`${API_URL}/jobs/${jobId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete job");
  return true;
};

export const getApplications = async () => {
  const response = await fetch(`${API_URL}/applications`);
  if (!response.ok) throw new Error("Failed to fetch applications");
  return response.json();
};

export const createApplication = async (applicationData) => {
  const response = await fetch(`${API_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) throw new Error("Failed to submit application");
  return response.json();
};

export const updateApplicationStatus = async (applicationId, status) => {
  const response = await fetch(
    `${API_URL}/applications/${applicationId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }
  );

  if (!response.ok) throw new Error("Failed to update application status");
  return response.json();
};