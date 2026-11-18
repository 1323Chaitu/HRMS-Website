import { useEffect, useMemo, useState } from "react";
import {
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../services/documentService";
import { getEmployees } from "../services/employeeService";
import "../styles/Documents.css";

const emptyForm = {
  title: "",
  category: "Identity",
  employeeId: "",
  documentUrl: "",
  description: "",
};

const categories = [
  "Identity",
  "Education",
  "Employment",
  "Salary",
  "Tax",
  "Other",
];

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [employeeFilter, setEmployeeFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [documentData, employeeData] = await Promise.all([
        getDocuments(),
        getEmployees(),
      ]);

      setDocuments(documentData);
      setEmployees(employeeData);
    } catch (err) {
      setError("Unable to load documents. Check that JSON Server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((item) => item.id === employeeId);
    return employee?.name || "Unknown Employee";
  };

  const filteredDocuments = useMemo(() => {
    const term = search.toLowerCase();

    return documents.filter((document) => {
      const employeeName = getEmployeeName(document.employeeId);

      const matchesSearch =
        (document.title || "").toLowerCase().includes(term) ||
        (document.category || "").toLowerCase().includes(term) ||
        employeeName.toLowerCase().includes(term) ||
        (document.employeeId || "").toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "All" ||
        document.category === categoryFilter;

      const matchesEmployee =
        employeeFilter === "All" ||
        document.employeeId === employeeFilter;

      return matchesSearch && matchesCategory && matchesEmployee;
    });
  }, [documents, employees, search, categoryFilter, employeeFilter]);

  const openCreateModal = () => {
    setEditingDocument(null);
    setForm({
      ...emptyForm,
      employeeId: employees[0]?.id || "",
    });
    setShowModal(true);
  };

  const openEditModal = (document) => {
    setEditingDocument(document);
    setForm({
      title: document.title || "",
      category: document.category || "Other",
      employeeId: document.employeeId || "",
      documentUrl: document.documentUrl || "",
      description: document.description || "",
    });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const employee = employees.find(
        (item) => item.id === form.employeeId
      );

      if (!employee) {
        alert("Please select an employee.");
        return;
      }

      const documentData = {
        ...form,
        employeeName: employee.name,
        updatedAt: new Date().toISOString(),
      };

      if (editingDocument) {
        await updateDocument(editingDocument.id, documentData);
      } else {
        await createDocument({
          ...documentData,
          id: `DOC${Date.now()}`,
          uploadedDate: new Date().toISOString().split("T")[0],
        });
      }

      setShowModal(false);
      setEditingDocument(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      alert(err.message || "Unable to save document.");
    }
  };

  const handleDelete = async (document) => {
    if (!window.confirm(`Delete "${document.title}"?`)) return;

    try {
      await deleteDocument(document.id);
      await loadData();
    } catch (err) {
      alert("Unable to delete document.");
    }
  };

  if (loading) {
    return <div className="documents-loading">Loading documents...</div>;
  }

  return (
    <div className="documents-page">
      <div className="documents-heading">
        <div>
          <h1>Document Management</h1>
          <p>Organize and manage employee documents in one place.</p>
        </div>

        <button
          className="documents-primary-btn"
          onClick={openCreateModal}
          disabled={employees.length === 0}
        >
          + Add Document
        </button>
      </div>

      {error && <div className="documents-error">{error}</div>}

      <div className="documents-stats">
        <div className="documents-stat-card">
          <span>Total Documents</span>
          <strong>{documents.length}</strong>
        </div>
        <div className="documents-stat-card">
          <span>Employees Covered</span>
          <strong>
            {new Set(documents.map((item) => item.employeeId)).size}
          </strong>
        </div>
        <div className="documents-stat-card">
          <span>Categories</span>
          <strong>
            {new Set(documents.map((item) => item.category)).size}
          </strong>
        </div>
      </div>

      <div className="documents-toolbar">
        <input
          placeholder="Search documents or employees..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={employeeFilter}
          onChange={(event) => setEmployeeFilter(event.target.value)}
        >
          <option value="All">All Employees</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name}
            </option>
          ))}
        </select>
      </div>

      <div className="documents-table-wrapper">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Document</th>
              <th>Employee</th>
              <th>Category</th>
              <th>Uploaded Date</th>
              <th>Document Link</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocuments.map((document) => (
              <tr key={document.id}>
                <td>
                  <strong>{document.title}</strong>
                  <small>{document.id}</small>
                </td>
                <td>
                  <strong>{getEmployeeName(document.employeeId)}</strong>
                  <small>{document.employeeId}</small>
                </td>
                <td>
                  <span className="documents-category">
                    {document.category}
                  </span>
                </td>
                <td>{document.uploadedDate || "—"}</td>
                <td>
                  {document.documentUrl ? (
                    <a
                      href={document.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Document
                    </a>
                  ) : (
                    <span className="documents-no-link">No link</span>
                  )}
                </td>
                <td>
                  <div className="documents-actions">
                    <button onClick={() => openEditModal(document)}>
                      Edit
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(document)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan="6" className="documents-empty">
                  No documents found. Add your first employee document.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="documents-modal-overlay">
          <div className="documents-modal">
            <div className="documents-modal-heading">
              <div>
                <h2>
                  {editingDocument ? "Edit Document" : "Add Employee Document"}
                </h2>
                <p>Enter the document information and employee details.</p>
              </div>

              <button
                type="button"
                className="documents-close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="documents-form-grid">
                <label className="documents-full-width">
                  Document Title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Aadhaar Card"
                    required
                  />
                </label>

                <label>
                  Employee *
                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.id})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Category *
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="documents-full-width">
                  Document URL *
                  <input
                    type="url"
                    name="documentUrl"
                    value={form.documentUrl}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/..."
                    required
                  />
                </label>

                <label className="documents-full-width">
                  Description
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Add a short description..."
                  />
                </label>
              </div>

              <div className="documents-modal-actions">
                <button
                  type="button"
                  className="documents-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="documents-primary-btn">
                  {editingDocument ? "Save Changes" : "Add Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;