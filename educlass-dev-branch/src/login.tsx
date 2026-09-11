import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./context/AuthContext"; // Import AuthContext
import Logo from "./assets/images/logo.svg";
import InputField from "./components/InputField";
import ButtonProps from "./components/ButtonProps";
import { IoIosArrowRoundForward } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Import spinner icon

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // State to track loading
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from AuthContext

  // Surface the reason we landed back on the login page when the API client's
  // 401 handler bounced us here after an expired/invalid session.
  useEffect(() => {
    if (sessionStorage.getItem("sessionExpired")) {
      sessionStorage.removeItem("sessionExpired");
      setError("Your session has expired. Please sign in again.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const response = await axios.post(
        `${API_BASE_URL}/token`,
        new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      const { access_token, role, lecturer_id, student_id } = response.data; // Ensure the backend returns the role

      // Store the token in localStorage
      localStorage.setItem("token", access_token);

     // Store the lecturer_id in localStorage if the user is a lecturer
      if (role === "lecturer" && lecturer_id) {
        localStorage.setItem("staff_id", lecturer_id);
      } else if (role === "student" && student_id) {
        // Store the student_id in localStorage as a number if the user is a student
        localStorage.setItem("student_id", String(Number(student_id)));
      }
      // Use the login function to set the authentication state
      login(access_token, role, formData.username);

      // Redirect based on the user's role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "lecturer") {
        navigate("/user/l/dashboard");
      } else if (role === "student") {
        navigate("/user/s/dashboard");
      } else {
        setError("Invalid role. Please contact support.");
      }
    } catch (err: any) {
      console.error("Login Error:", err.response?.data || err.message); // Debugging log
      setError(err.response?.data?.detail || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  return (
    <div className="flex flex-col bg-slate-100 animate-fadeIn">
      <div className="w-full lg:flex-row bg-white h-screen p-8 lg:p-0 flex flex-col justify-center items-center animate-slideInUp">
        <div className="hidden lg:flex w-full lg:w-full bg-login h-screen bg-cover bg-no-repeat animate-fadeIn"></div>
        <div className="bg-white w-full lg:p-10 lg:w-1/3 p-0 h-max animate-slideInRight">
          <img
            src={Logo}
            alt="EduClass Logo"
            className="w-40 pb-7 flex justify-center animate-slideInUp"
            style={{ animationDelay: "0.2s" }}
          />
          <div className="pb-4 animate-fadeIn">
            <h5 className="text-h5 text-dark animate-slideInUp">Sign In</h5>
            <span className="text-sm text-slate-500 animate-slideInUp">
              Access EduClass using your details
            </span>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-fadeIn" style={{ animationDelay: "0.4s" }}>
            <div className="animate-fadeIn" style={{ animationDelay: "0.5s" }}>
              <label htmlFor="username" className="text-span text-dark font-medium animate-slideInUp">
                Username
              </label>
              <InputField
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your Username"
                isRequired={true}
                className="animate-slideInUp"
                style={{ animationDelay: "0.6s" }}
              />
            </div>
            <div className="animate-fadeIn" style={{ animationDelay: "0.6s" }}>
              <label htmlFor="password" className="text-span text-dark font-medium animate-slideInUp">
                Password
              </label>
              <InputField
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your Password"
                isRequired={true}
                className="animate-slideInUp"
                style={{ animationDelay: "0.7s" }}
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm animate-fadeIn" style={{ animationDelay: "0.8s" }}>
                {error}
              </div>
            )}
            <div className="flex flex-row-reverse justify-between animate-fadeIn" style={{ animationDelay: "0.7s" }}>
              <ButtonProps
                type="submit"
                variant="primary"
                size="large"
                className={`flex items-center animate-slideInUp ${
                  loading ? "cursor-not-allowed opacity-70" : ""
                }`}
                style={{ animationDelay: "0.8s" }}
                disabled={loading} // Disable the button while loading
              >
                {loading ? (
                  <AiOutlineLoading3Quarters className="animate-spin size-6" />
                ) : (
                  <>
                    Sign In
                    <IoIosArrowRoundForward className="size-6" />
                  </>
                )}
              </ButtonProps>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;