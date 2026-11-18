
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, LockKeyhole, User, Eye, EyeOff } from "lucide-react";

import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await loginUser(username, password);

      login(user);

      if (user.role === "admin") {
        navigate("/");
      } else {
        navigate("/employee-dashboard");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <div className="login-brand">
          <div className="login-logo">
            <Users size={28} />
          </div>

          <h1>SmartHRMS</h1>
          <p>Human Resource Management System</p>
        </div>

        <div className="login-heading">
          <h2>Welcome Back!</h2>
          <p>Please sign in to continue.</p>
        </div>

        <form onSubmit={handleLogin}>

          <div className="login-input-group">
            <label>Username</label>

            <div className="login-input">
              <User size={19} />

              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="login-input-group">
            <label>Password</label>

            <div className="login-input">
              <LockKeyhole size={19} />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>

        <div className="login-footer">
          Secure Employee Management Portal
        </div>

      </div>
    </div>
  );
}

export default Login;
