import { useState } from "react";
import Footer from "../Footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const handleGoToMain = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setErrors({});
    setIsLoading(true);
    try {
      const result = await forgotPassword({ email });
      if (result.success) {
        setMessage(result.message);
      } else {
        setError(result.error);
        setErrors(result.fieldErrors || {});
      }
    } catch (error) {
      setError("send mail chuu");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[95vh] space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold text-center text-green-900 mb-[50px] font-sans">
          インターンシップ管理システム
        </h1>
        <form
          className="bg-white space-y-4 p-6 rounded-2xl shadow-md w-full max-w-md mb-0 relative"
          onSubmit={handleSubmit}
        >
          <h2 className="text-3xl font-bold text-center text-green-900 mb-4 font-sans">
            忘れパスワード
          </h2>
          <button
            onClick={handleGoToMain}
            type="button"
            className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl font-bold rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close and return to main page"
            disabled={isLoading}
          >
            ×
          </button>

          {/* Email Field */}
          <div>
            <label className="block text-md font-medium text-green-700 mb-2 font-sans">
              メールアドレス
              <span className="ml-2 text-[10px] text-red-500 bg-red-100 px-1 py-1 rounded">
                必須
              </span>
            </label>
            <input
              type="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-sans"
              placeholder="メールアドレスを入力してください"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            {errors.email && (
              <div className="text-red-500 text-xs mt-1 font-sans font-bold">
                {errors.email[0]}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={` login-button reset-button m-auto block py-3 px-4 text-white font-sm rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 font-sans ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading
              ? "パスワードリセットリンクを送信中..."
              : "パスワードリセットリンクを送信"}
          </button>
          {message && (
            <p style={{ color: "green", marginTop: 15 }}>{message}</p>
          )}
          {/* General Error Message */}
          {error && typeof error === "string" && (
            <div className="text-red-500 text-sm text-center mt-2 font-sans font-bold">
              {error}
            </div>
          )}
        </form>
      </div>
      <Footer></Footer>
    </>
  );
}
