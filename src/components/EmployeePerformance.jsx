import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getEmployeePerformanceReviews } from "../services/performanceService";
import "../styles/EmployeePerformance.css";

function EmployeePerformance() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReviews = async () => {
      if (!user?.employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getEmployeePerformanceReviews(user.employeeId);

        const sorted = data.sort(
          (a, b) =>
            new Date(b.reviewDate || 0).getTime() -
            new Date(a.reviewDate || 0).getTime()
        );

        setReviews(sorted);
      } catch (err) {
        setError("Unable to load your performance reviews.");
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [user?.employeeId]);

  const averageScore =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) => sum + Number(review.overallScore || 0),
          0
        ) / reviews.length
      : 0;

  if (loading) {
    return (
      <section className="employee-performance-section">
        <p>Loading your performance reviews...</p>
      </section>
    );
  }

  return (
    <section className="employee-performance-section">
      <div className="employee-performance-heading">
        <div>
          <h2>My Performance</h2>
          <p>Review your performance feedback and development progress.</p>
        </div>
      </div>

      {error && <div className="employee-performance-error">{error}</div>}

      <div className="employee-performance-summary">
        <div>
          <span>Total Reviews</span>
          <strong>{reviews.length}</strong>
        </div>
        <div>
          <span>Average Score</span>
          <strong>{averageScore.toFixed(2)} / 5</strong>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="employee-performance-empty">
          <h3>No performance reviews available</h3>
          <p>Your reviews will appear here once your manager completes them.</p>
        </div>
      ) : (
        <div className="employee-performance-list">
          {reviews.map((review) => (
            <article className="employee-performance-card" key={review.id}>
              <div className="employee-performance-card-heading">
                <div>
                  <h3>{review.reviewPeriod}</h3>
                  <span>Reviewed on {review.reviewDate || "—"}</span>
                </div>
                <div className="employee-performance-score">
                  <strong>
                    {Number(review.overallScore || 0).toFixed(2)}/5
                  </strong>
                  <span>{review.category || "Not rated"}</span>
                </div>
              </div>

              <div className="employee-performance-ratings">
                {[
                  ["Productivity", review.productivity],
                  ["Communication", review.communication],
                  ["Teamwork", review.teamwork],
                  ["Technical Skills", review.technicalSkills],
                ].map(([label, rating]) => (
                  <div className="employee-performance-rating" key={label}>
                    <span>{label}</span>
                    <strong>{rating || 0}/5</strong>
                  </div>
                ))}
              </div>

              {review.comments && (
                <div className="employee-performance-feedback">
                  <strong>Manager's Feedback</strong>
                  <p>{review.comments}</p>
                </div>
              )}

              {review.improvements && (
                <div className="employee-performance-feedback improvement">
                  <strong>Areas for Improvement</strong>
                  <p>{review.improvements}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default EmployeePerformance;