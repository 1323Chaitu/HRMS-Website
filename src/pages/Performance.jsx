import { useEffect, useMemo, useState } from "react";
import {
  getPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
} from "../services/performanceService";
import { getEmployees } from "../services/employeeService";
import "../styles/Performance.css";

const emptyForm = {
  employeeId: "",
  reviewPeriod: "",
  productivity: 3,
  communication: 3,
  teamwork: 3,
  technicalSkills: 3,
  comments: "",
  improvements: "",
};

const ratingFields = [
  { key: "productivity", label: "Productivity" },
  { key: "communication", label: "Communication" },
  { key: "teamwork", label: "Teamwork" },
  { key: "technicalSkills", label: "Technical Skills" },
];

const getScore = (form) => {
  const total = ratingFields.reduce(
    (sum, field) => sum + Number(form[field.key] || 0),
    0
  );
  return total / ratingFields.length;
};

const getCategory = (score) => {
  if (score >= 4.5) return "Outstanding";
  if (score >= 3.5) return "Good";
  if (score >= 2.5) return "Satisfactory";
  if (score >= 1.5) return "Needs Improvement";
  return "Poor";
};

function Performance() {
  const [reviews, setReviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [reviewData, employeeData] = await Promise.all([
        getPerformanceReviews(),
        getEmployees(),
      ]);

      setReviews(reviewData);
      setEmployees(employeeData);
    } catch (err) {
      setError("Unable to load performance data. Check that JSON Server is running.");
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

  const averageScore =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + Number(review.overallScore || 0),
          0
        ) / reviews.length
      : 0;

  const outstandingCount = reviews.filter(
    (review) => review.category === "Outstanding"
  ).length;

  const improvementCount = reviews.filter(
    (review) =>
      review.category === "Needs Improvement" || review.category === "Poor"
  ).length;

  const filteredReviews = useMemo(() => {
    const term = search.toLowerCase();

    return reviews.filter((review) => {
      const employee = employees.find(
        (item) => item.id === review.employeeId
      );

      const name = employee?.name || review.employeeName || "";
      const matchesSearch =
        name.toLowerCase().includes(term) ||
        (review.employeeId || "").toLowerCase().includes(term) ||
        (review.reviewPeriod || "").toLowerCase().includes(term);

      const matchesCategory =
        filterCategory === "All" || review.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [reviews, employees, search, filterCategory]);

  const openCreateModal = () => {
    setEditingReview(null);
    setForm({
      ...emptyForm,
      employeeId: employees[0]?.id || "",
      reviewPeriod: new Date().toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
      }),
    });
    setShowModal(true);
  };

  const openEditModal = (review) => {
    setEditingReview(review);
    setForm({
      employeeId: review.employeeId || "",
      reviewPeriod: review.reviewPeriod || "",
      productivity: Number(review.productivity || 3),
      communication: Number(review.communication || 3),
      teamwork: Number(review.teamwork || 3),
      technicalSkills: Number(review.technicalSkills || 3),
      comments: review.comments || "",
      improvements: review.improvements || "",
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

      const overallScore = Number(getScore(form).toFixed(2));

      const reviewData = {
        employeeId: form.employeeId,
        employeeName: employee.name,
        reviewPeriod: form.reviewPeriod.trim(),
        productivity: Number(form.productivity),
        communication: Number(form.communication),
        teamwork: Number(form.teamwork),
        technicalSkills: Number(form.technicalSkills),
        overallScore,
        category: getCategory(overallScore),
        comments: form.comments.trim(),
        improvements: form.improvements.trim(),
        reviewDate: new Date().toISOString().split("T")[0],
      };

      if (editingReview) {
        await updatePerformanceReview(editingReview.id, reviewData);
      } else {
        await createPerformanceReview({
          ...reviewData,
          id: `REV${Date.now()}`,
        });
      }

      setShowModal(false);
      setEditingReview(null);
      await loadData();
    } catch (err) {
      alert(err.message || "Unable to save the performance review.");
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm("Delete this performance review?")) return;

    try {
      await deletePerformanceReview(review.id);
      await loadData();
    } catch (err) {
      alert("Unable to delete the review.");
    }
  };

  if (loading) {
    return <div className="performance-loading">Loading performance reviews...</div>;
  }

  return (
    <div className="performance-page">
      <div className="performance-heading">
        <div>
          <h1>Performance Management</h1>
          <p>Review employee performance and track professional growth.</p>
        </div>
        <button
          className="performance-primary-btn"
          onClick={openCreateModal}
          disabled={employees.length === 0}
        >
          + Add Performance Review
        </button>
      </div>

      {error && <div className="performance-error">{error}</div>}

      <div className="performance-stats">
        <div className="performance-stat-card">
          <span>Total Reviews</span>
          <strong>{reviews.length}</strong>
        </div>
        <div className="performance-stat-card">
          <span>Average Score</span>
          <strong>{averageScore.toFixed(2)} / 5</strong>
        </div>
        <div className="performance-stat-card">
          <span>Outstanding</span>
          <strong>{outstandingCount}</strong>
        </div>
        <div className="performance-stat-card">
          <span>Need Improvement</span>
          <strong>{improvementCount}</strong>
        </div>
      </div>

      <div className="performance-toolbar">
        <input
          placeholder="Search employee, ID or review period..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={filterCategory}
          onChange={(event) => setFilterCategory(event.target.value)}
        >
          <option value="All">All Performance Categories</option>
          <option value="Outstanding">Outstanding</option>
          <option value="Good">Good</option>
          <option value="Satisfactory">Satisfactory</option>
          <option value="Needs Improvement">Needs Improvement</option>
          <option value="Poor">Poor</option>
        </select>
      </div>

      <div className="performance-table-wrapper">
        <table className="performance-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Review Period</th>
              <th>Productivity</th>
              <th>Communication</th>
              <th>Teamwork</th>
              <th>Technical</th>
              <th>Overall</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review.id}>
                <td>
                  <strong>{getEmployeeName(review.employeeId)}</strong>
                  <small>{review.employeeId}</small>
                </td>
                <td>{review.reviewPeriod}</td>
                <td>{review.productivity}/5</td>
                <td>{review.communication}/5</td>
                <td>{review.teamwork}/5</td>
                <td>{review.technicalSkills}/5</td>
                <td>
                  <strong>{Number(review.overallScore || 0).toFixed(2)}/5</strong>
                </td>
                <td>
                  <span className="performance-category">
                    {review.category || "Not rated"}
                  </span>
                </td>
                <td>
                  <div className="performance-actions">
                    <button onClick={() => openEditModal(review)}>Edit</button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(review)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="9" className="performance-empty">
                  No performance reviews found. Add your first review.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="performance-modal-overlay">
          <div className="performance-modal">
            <div className="performance-modal-heading">
              <div>
                <h2>
                  {editingReview ? "Edit Performance Review" : "New Performance Review"}
                </h2>
                <p>Rate each category from 1 (Poor) to 5 (Excellent).</p>
              </div>
              <button
                type="button"
                className="performance-close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="performance-form-grid">
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
                  Review Period *
                  <input
                    name="reviewPeriod"
                    value={form.reviewPeriod}
                    onChange={handleChange}
                    placeholder="e.g. November 2026"
                    required
                  />
                </label>

                {ratingFields.map((field) => (
                  <label key={field.key}>
                    {field.label} *
                    <select
                      name={field.key}
                      value={form[field.key]}
                      onChange={handleChange}
                      required
                    >
                      <option value="1">1 - Poor</option>
                      <option value="2">2 - Below Expectations</option>
                      <option value="3">3 - Satisfactory</option>
                      <option value="4">4 - Good</option>
                      <option value="5">5 - Excellent</option>
                    </select>
                  </label>
                ))}

                <div className="performance-score-preview">
                  <span>Overall Score</span>
                  <strong>{getScore(form).toFixed(2)} / 5</strong>
                  <span>{getCategory(getScore(form))}</span>
                </div>

                <label className="performance-full-width">
                  Review Comments
                  <textarea
                    name="comments"
                    value={form.comments}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe the employee's achievements and performance..."
                  />
                </label>

                <label className="performance-full-width">
                  Improvement Suggestions
                  <textarea
                    name="improvements"
                    value={form.improvements}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Mention areas where the employee can improve..."
                  />
                </label>
              </div>

              <div className="performance-modal-actions">
                <button
                  type="button"
                  className="performance-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="performance-primary-btn">
                  {editingReview ? "Save Changes" : "Save Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Performance;