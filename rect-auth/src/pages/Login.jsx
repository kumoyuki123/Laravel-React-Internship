import { useState } from "react";
import Footer from "../components/footer";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleGoToMain = () => {
        navigate("/");
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setErrors({});
        setIsLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
            navigate("/dashboard");
            } else {
                setError(result.error);
                setErrors(result.fieldErrors || {});
            }
        } catch (error) {
            setError("ログイン中に予期せぬエラーが発生しました");
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
                <form className="bg-white space-y-4 p-6 rounded-2xl shadow-md w-full max-w-md mb-0 relative" onSubmit={submit}>
                    <h2 className="text-3xl font-bold text-center text-green-900 mb-4 font-sans">
                        ログイン
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
                        <label className="block text-md font-medium text-green-700 mb-2 font-sans">ログインID (メールアドレス)
                            <span className="ml-2 text-[10px] text-red-500 bg-red-100 px-1 py-1 rounded">必須</span>
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
                    
                    {/* Password Field */}
                    <div>
                        <label className="block text-md font-medium text-green-700 mb-2 font-sans">パスワード
                            <span className="ml-2 text-[10px] text-red-500 bg-red-100 px-1 py-1 rounded">必須</span>
                        </label>
                        <input 
                            type="password" 
                            name="password" 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-sans" 
                            placeholder="パスワードを入力してください" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <div className="text-red-500 text-xs mt-1 font-sans font-bold">
                                {errors.password[0]}
                            </div>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-40 m-auto block py-3 px-4 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 font-sans ${
                            isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        style={{ backgroundColor: 'rgba(92, 155, 16, 0.82)' }}
                    >
                        {isLoading ? "ログイン中..." : "ログイン"}
                    </button>
                    
                    {/* General Error Message */}
                    {error && typeof error === "string" && (
                        <div className="text-red-500 text-sm text-center mt-2 font-sans font-bold">
                            {error}
                        </div>
                    )}
                </form>
                <div className="text-center mt-2">
                    <small className="text-gray-600 text-lg font-bold">
                        初めての方は{" "}
                        <Link
                        to="/register" 
                        className="text-green-600 hover:text-green-800 hover:underline transition-colors"
                        >
                        新規会員登録
                        </Link>
                    </small>
                </div>
            </div>
            <Footer></Footer>
        </>
    );
}