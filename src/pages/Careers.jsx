import { useEffect, useState } from "react";
import {
  getJobs,
  createApplication,
} from "../services/recruitmentService";
import "../styles/Careers.css";

const initialForm = {
  candidateName: "",
  email: "",
  phone: "",
  experience: "",
  resumeLink: "",
  coverLetter: "",
};

function Careers() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data.filter((job) => job.status === "Active"));
      } catch (error) {
        setMessage("Unable to load job openings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedJob) return;

    try {
      setSubmitting(true);
      setMessage("");

      await createApplication({
        id: `APP${Date.now()}`,
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        candidateName: form.candidateName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        experience: form.experience.trim(),
        resumeLink: form.resumeLink.trim(),
        coverLetter: form.coverLetter.trim(),
        status: "Applied",
        appliedDate: new Date().toISOString().split("T")[0],
      });

      setSelectedJob(null);
      setForm(initialForm);
      setMessage("Your application has been submitted successfully!");
    } catch (error) {
      setMessage("Application submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="careers-page">
      <header className="careers-header">
        <div className="careers-header-content">
          <span className="careers-eyebrow">CAREERS AT OUR COMPANY</span>
          <h1>Find your next opportunity.</h1>
          <p>
            Explore our open positions and take the next step in your career.
          </p>
        </div>
      </header>

      <main className="careers-content">
        <div className="careers-section-heading">
          <div>
            <h2>Open Positions</h2>
            <p>Discover roles where you can learn, contribute and grow.</p>
          </div>
          <span>{jobs.length} available positions</span>
        </div>

        {message && (
          <div className="careers-message" role="status">
            {message}
          </div>
        )}

        {loading ? (
          <p className="careers-empty">Loading available positions...</p>
        ) : jobs.length === 0 ? (
          <div className="careers-empty">
            <h3>No open positions right now</h3>
            <p>Please check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="careers-job-grid">
            {jobs.map((job) => (
              <article className="careers-job-card" key={job.id}>
                <div className="careers-job-top">
                  <span className="careers-job-type">{job.type}</span>
                  <span className="careers-job-department">
                    {job.department}
                  </span>
                </div>

                <h3>{job.title}</h3>

                <div className="careers-job-meta">
                  <span>📍 {job.location}</span>
                  {job.salary > 0 && (
                    <span>
                      ₹{Number(job.salary).toLocaleString("en-IN")} / year
                    </span>
                  )}
                </div>

                <p className="careers-job-description">
                  {job.description}
                </p>

                {job.requirements && (
                  <div className="careers-requirements">
                    <strong>Requirements</strong>
                    <p>{job.requirements}</p>
                  </div>
                )}

                <button
                  className="careers-apply-btn"
                  onClick={() => {
                    setSelectedJob(job);
                    setForm(initialForm);
                    setMessage("");
                  }}
                >
                  Apply Now
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      {selectedJob && (
        <div className="careers-modal-overlay">
          <div className="careers-modal">
            <div className="careers-modal-heading">
              <div>
                <h2>Apply for {selectedJob.title}</h2>
                <p>
                  {selectedJob.department} · {selectedJob.location}
                </p>
              </div>
              <button
                type="button"
                className="careers-close-btn"
                onClick={() => setSelectedJob(null)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="careers-form">
              <label>
                Full Name *
                <input
                  name="candidateName"
                  value={form.candidateName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </label>

              <label>
                Email Address *
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </label>

              <label>
                Phone Number *
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </label>

              <label>
                Experience
                <input
                  name="experience"
                  value={form.experience}
                  onChange={handleChange}
                  placeholder="e.g. Fresher or 2 years"
                />
              </label>

              <label>
                Resume Link
                <input
                  type="url"
                  name="resumeLink"
                  value={form.resumeLink}
                  onChange={handleChange}
                  placeholder="Paste your Google Drive or portfolio link"
                />
              </label>

              <label>
                Cover Letter
                <textarea
                  name="coverLetter"
                  value={form.coverLetter}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us briefly why you are suitable for this role..."
                />
              </label>

              <div className="careers-form-actions">
                <button
                  type="button"
                  className="careers-cancel-btn"
                  onClick={() => setSelectedJob(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="careers-apply-btn"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Careers;
