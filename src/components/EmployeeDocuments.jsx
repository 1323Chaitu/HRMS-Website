import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getEmployeeDocuments } from "../services/documentService";
import "../styles/EmployeeDocuments.css";

function EmployeeDocuments() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user?.employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getEmployeeDocuments(user.employeeId);

        setDocuments(
          data.sort(
            (a, b) =>
              new Date(b.uploadedDate || 0) -
              new Date(a.uploadedDate || 0)
          )
        );
      } catch (err) {
        setError("Unable to load your documents.");
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [user?.employeeId]);

  if (loading) {
    return (
      <section className="employee-documents-section">
        <p>Loading your documents...</p>
      </section>
    );
  }

  return (
    <section className="employee-documents-section">
      <div className="employee-documents-heading">
        <div>
          <h2>My Documents</h2>
          <p>Access your employee documents and records.</p>
        </div>
        <span>{documents.length} Documents</span>
      </div>

      {error && <div className="employee-documents-error">{error}</div>}

      {documents.length === 0 ? (
        <div className="employee-documents-empty">
          <h3>No documents available</h3>
          <p>Documents assigned to you by HR will appear here.</p>
        </div>
      ) : (
        <div className="employee-documents-list">
          {documents.map((document) => (
            <article className="employee-document-card" key={document.id}>
              <div className="employee-document-icon">
                <span>DOC</span>
              </div>

              <div className="employee-document-info">
                <h3>{document.title}</h3>
                <span>{document.category}</span>
                {document.description && <p>{document.description}</p>}
                <small>
                  Uploaded: {document.uploadedDate || "Date not available"}
                </small>
              </div>

              <div className="employee-document-action">
                {document.documentUrl ? (
                  <a
                    href={document.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Document
                  </a>
                ) : (
                  <span>Link unavailable</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default EmployeeDocuments;