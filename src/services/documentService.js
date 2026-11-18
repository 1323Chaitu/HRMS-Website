const API_URL = "http://localhost:5000";

export const getDocuments = async () => {
  const response = await fetch(`${API_URL}/documents`);
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
};

export const getEmployeeDocuments = async (employeeId) => {
  const response = await fetch(
    `${API_URL}/documents?employeeId=${encodeURIComponent(employeeId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employee documents");
  }

  return response.json();
};

export const createDocument = async (documentData) => {
  const response = await fetch(`${API_URL}/documents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(documentData),
  });

  if (!response.ok) throw new Error("Failed to create document");
  return response.json();
};

export const updateDocument = async (documentId, documentData) => {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(documentData),
  });

  if (!response.ok) throw new Error("Failed to update document");
  return response.json();
};

export const deleteDocument = async (documentId) => {
  const response = await fetch(`${API_URL}/documents/${documentId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete document");
  return true;
};