import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Footer from "../Footer";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const handleGoToMain = () => {
    navigate("/");
  };

  const [formData, setFormData] = useState({
    email: "",
    token: "",
    password: "",
    password_confirmation: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);

    let token = urlParams.get("token");
    let email = urlParams.get("email");

    // email が token に結合されている場合の処理
    if (!email && token && token.includes("email=")) {
      const parts = token.split("email=");
      if (parts.length === 2) {
        token = parts[0];
        email = decodeURIComponent(parts[1]);
      }
    }

    if (email) {
      email = decodeURIComponent(email.replace(/\+/g, " "));
    }

    if (token && email) {
      setFormData((prev) => ({
        ...prev,
        token: token,
        email: email,
      }));
    } else {
      setError(
        "リセットリンクに必要な情報が不足しています。もう一度リセットリンクをリクエストしてください。"
      );
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setErrors({});

    if (!formData.password || !formData.password_confirmation) {
      setError("パスワードをすべて入力してください。");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("パスワードが一致しません。");
      return;
    }

    setIsLoading(true);

    try {
      const result = await resetPassword(formData);

      if (result.success) {
        setMessage(result.message || "パスワードが正常にリセットされました。");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(result.error || "パスワードリセットに失敗しました。");
        setErrors(result.fieldErrors || {});
      }
    } catch (err) {
      setError("予期せぬエラーが発生しました。もう一度お試しください。");
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
            パスワードリセット
          </h2>
          <button
            onClick={handleGoToMain}
            type="button"
            className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 text-2xl font-bold rounded-full hover:bg-gray-100 transition-colors"
            aria-label="メインページに戻る"
            disabled={isLoading}
          >
            ×
          </button>

          {/* Email Field */}
          <div>
            <label className="block text-md font-medium text-green-700 mb-2 font-sans">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed font-sans"
              value={formData.email}
              readOnly
            />
          </div>

          <div>
            <label className="block text-md font-medium text-green-700 mb-2 font-sans">
              新しいパスワード
            </label>
            <input
              type="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-sans"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="新しいパスワードを入力"
              required
            />
          </div>

          <div>
            <label className="block text-md font-medium text-green-700 mb-2 font-sans">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              name="password_confirmation"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-sans"
              value={formData.password_confirmation}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="もう一度入力してください"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.token || !formData.email}
            className={`w-full py-3 px-4 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 font-sans ${
              isLoading || !formData.token || !formData.email
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
            }`}
          >
            {isLoading ? "パスワードをリセット中..." : "パスワードをリセット"}
          </button>

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {error && (
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-green-600 hover:text-green-800 font-sans text-sm underline"
              >
                新しいリセットリンクをリクエストする
              </button>
            </div>
          )}
        </form>
      </div>
      <Footer />
    </>
  );
}
