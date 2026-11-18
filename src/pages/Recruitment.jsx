import { useEffect, useMemo, useState } from "react";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getApplications,
  updateApplicationStatus,
} from "../services/recruitmentService";
import "../styles/Recruitment.css";

const emptyJob = {
  title: "",
  department: "",
  location: "",
  type: "Full-time",
  salary: "",
  description: "",
  requirements: "",
  status: "Active",
};

function Recruitment() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobModal, setJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [jobData, applicationData] = await Promise.all([
        getJobs(),
        getApplications(),
      ]);

      setJobs(jobData);
      setApplications(applicationData);
    } catch (err) {
      setError("Unable to load recruitment data. Check that JSON Server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeJobs = jobs.filter((job) => job.status === "Active").length;
  const pendingApplications = applications.filter(
    (application) => application.status === "Applied"
  ).length;
  const shortlistedApplications = applications.filter(
    (application) => application.status === "Shortlisted"
  ).length;

  const filteredJobs = useMemo(() => {
    const term = search.toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        (job.title || "").toLowerCase().includes(term) ||
        (job.department || "").toLowerCase().includes(term) ||
        (job.location || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, statusFilter]);

  const filteredApplications = useMemo(() => {
    const term = search.toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        (application.candidateName || "").toLowerCase().includes(term) ||
        (application.email || "").toLowerCase().includes(term) ||
        (application.jobTitle || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const openCreateModal = () => {
    setEditingJob(null);
    setJobForm(emptyJob);
    setJobModal(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "Full-time",
      salary: job.salary || "",
      description: job.description || "",
      requirements: job.requirements || "",
      status: job.status || "Active",
    });
    setJobModal(true);
  };

  const handleJobChange = (event) => {
    const { name, value } = event.target;
    setJobForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();

    try {
      const jobData = {
        ...jobForm,
        salary: Number(jobForm.salary) || 0,
      };

      if (editingJob) {
        await updateJob(editingJob.id, jobData);
      } else {
        await createJob({
          ...jobData,
          id: `JOB${Date.now()}`,
          postedDate: new Date().toISOString().split("T")[0],
        });
      }

      setJobModal(false);
      setJobForm(emptyJob);
      setEditingJob(null);
      await loadData();
    } catch (err) {
      alert(err.message || "Unable to save job opening.");
    }
  };

  const handleDeleteJob = async (job) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${job.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteJob(job.id);
      await loadData();
    } catch (err) {
      alert("Unable to delete this job.");
    }
  };

  const handleApplicationStatus = async (applicationId, status) => {
    try {
      await updateApplicationStatus(applicationId, status);
      await loadData();
    } catch (err) {
      alert("Unable to update application status.");
    }
  };

  if (loading) {
    return <div className="recruitment-loading">Loading recruitment data...</div>;
  }

  return (
    <div className="recruitment-page">
      <div className="recruitment-heading">
        <div>
          <h1>Recruitment Management</h1>
          <p>Manage job openings and track candidate applications.</p>
        </div>

        <button className="recruitment-primary-btn" onClick={openCreateModal}>
          + Create Job Opening
        </button>
      </div>

      {error && <div className="recruitment-error">{error}</div>}

      <div className="recruitment-stats">
        <div className="recruitment-stat-card">
          <span>Total Job Openings</span>
          <strong>{jobs.length}</strong>
        </div>
        <div className="recruitment-stat-card">
          <span>Active Jobs</span>
          <strong>{activeJobs}</strong>
        </div>
        <div className="recruitment-stat-card">
          <span>Total Applications</span>
          <strong>{applications.length}</strong>
        </div>
        <div className="recruitment-stat-card">
          <span>Awaiting Review</span>
          <strong>{pendingApplications}</strong>
        </div>
        <div className="recruitment-stat-card">
          <span>Shortlisted</span>
          <strong>{shortlistedApplications}</strong>
        </div>
      </div>

      <div className="recruitment-tabs">
        <button
          className={activeTab === "jobs" ? "active" : ""}
          onClick={() => {
            setActiveTab("jobs");
            setSearch("");
            setStatusFilter("All");
          }}
        >
          Job Openings ({jobs.length})
        </button>

        <button
          className={activeTab === "applications" ? "active" : ""}
          onClick={() => {
            setActiveTab("applications");
            setSearch("");
            setStatusFilter("All");
          }}
        >
          Applications ({applications.length})
        </button>
      </div>

      <div className="recruitment-toolbar">
        <input
          type="text"
          placeholder={
            activeTab === "jobs"
              ? "Search jobs, departments or locations..."
              : "Search candidates or job titles..."
          }
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          {activeTab === "jobs" ? (
            <>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
            </>
          ) : (
            <>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </>
          )}
        </select>
      </div>

      {activeTab === "jobs" ? (
        <div className="recruitment-table-wrapper">
          <table className="recruitment-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Department</th>
                <th>Location</th>
                <th>Job Type</th>
                <th>Applications</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <strong>{job.title}</strong>
                    <small>{job.id}</small>
                  </td>
                  <td>{job.department}</td>
                  <td>{job.location}</td>
                  <td>{job.type}</td>
                  <td>
                    {applications.filter(
                      (application) => application.jobId === job.id
                    ).length}
                  </td>
                  <td>
                    <span
                      className={`recruitment-status ${job.status?.toLowerCase()}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className="recruitment-actions">
                      <button onClick={() => openEditModal(job)}>Edit</button>
                      <button
                        className="delete"
                        onClick={() => handleDeleteJob(job)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan="7" className="recruitment-empty">
                    No job openings found. Create your first job opening.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="recruitment-table-wrapper">
          <table className="recruitment-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Applied For</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Applied Date</th>
                <th>Application Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredApplications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <strong>{application.candidateName}</strong>
                    <small>{application.id}</small>
                  </td>
                  <td>{application.jobTitle}</td>
                  <td>{application.email}</td>
                  <td>{application.phone}</td>
                  <td>{application.experience || "Not specified"}</td>
                  <td>{application.appliedDate || "—"}</td>
                  <td>
                    <select
                      className="application-status-select"
                      value={application.status || "Applied"}
                      onChange={(event) =>
                        handleApplicationStatus(
                          application.id,
                          event.target.value
                        )
                      }
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan="7" className="recruitment-empty">
                    No applications found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {jobModal && (
        <div
          className="recruitment-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setJobModal(false);
          }}
        >
          <div className="recruitment-modal">
            <div className="recruitment-modal-heading">
              <div>
                <h2>{editingJob ? "Edit Job Opening" : "Create Job Opening"}</h2>
                <p>Enter the details for this position.</p>
              </div>
              <button
                type="button"
                className="recruitment-close-btn"
                onClick={() => setJobModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJobSubmit}>
              <div className="recruitment-form-grid">
                <label>
                  Job Title *
                  <input
                    name="title"
                    value={jobForm.title}
                    onChange={handleJobChange}
                    placeholder="e.g. React Developer"
                    required
                  />
                </label>

                <label>
                  Department *
                  <input
                    name="department"
                    value={jobForm.department}
                    onChange={handleJobChange}
                    placeholder="e.g. IT"
                    required
                  />
                </label>

                <label>
                  Location *
                  <input
                    name="location"
                    value={jobForm.location}
                    onChange={handleJobChange}
                    placeholder="e.g. Hyderabad"
                    required
                  />
                </label>

                <label>
                  Job Type
                  <select
                    name="type"
                    value={jobForm.type}
                    onChange={handleJobChange}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Remote</option>
                  </select>
                </label>

                <label>
                  Annual Salary (₹)
                  <input
                    type="number"
                    min="0"
                    name="salary"
                    value={jobForm.salary}
                    onChange={handleJobChange}
                    placeholder="e.g. 500000"
                  />
                </label>

                <label>
                  Job Status
                  <select
                    name="status"
                    value={jobForm.status}
                    onChange={handleJobChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                  </select>
                </label>

                <label className="recruitment-full-width">
                  Job Description *
                  <textarea
                    name="description"
                    value={jobForm.description}
                    onChange={handleJobChange}
                    rows="4"
                    placeholder="Describe the role and responsibilities..."
                    required
                  />
                </label>

                <label className="recruitment-full-width">
                  Requirements
                  <textarea
                    name="requirements"
                    value={jobForm.requirements}
                    onChange={handleJobChange}
                    rows="3"
                    placeholder="List the skills and qualifications required..."
                  />
                </label>
              </div>

              <div className="recruitment-modal-actions">
                <button
                  type="button"
                  className="recruitment-cancel-btn"
                  onClick={() => setJobModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="recruitment-primary-btn">
                  {editingJob ? "Save Changes" : "Publish Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recruitment;