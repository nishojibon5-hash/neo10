import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { setToken, setUser } from "@/lib/auth";

type Form = { identifier: string; password: string };

export default function Login() {
  const { register, handleSubmit } = useForm<Form>();
  const navigate = useNavigate();

  const onSubmit = async (values: Form) => {
    const body: any = { password: values.password };
    if (values.identifier.includes("@")) body.email = values.identifier;
    else body.phone = values.identifier;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setUser(data.user);
      navigate("/");
    } else {
      alert(data.error ? JSON.stringify(data.error) : "Login failed");
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Top section with logo - Bangladesh green (#006BB6 top, #CE1126 red) */}
      <div className="login-top-section">
        <div className="logo-container">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F912f3720571b4a278e4934b7e38806ae%2F7619e011fb6d4793a38c4f3e489d897e?format=webp&width=800&height=1200"
            alt="Joy Bangla"
            className="joy-bangla-logo"
          />
        </div>
        <h1 className="app-title">JOY BANGLA</h1>
      </div>

      {/* Bottom section with login form */}
      <div className="login-bottom-section">
        <div className="login-form-container">
          <h2 className="login-heading">স্বাগতম</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <Input
                placeholder="ফোন নম্বর অথবা ইমেইল"
                {...register("identifier", { required: true })}
                className="login-input"
              />
            </div>
            <div className="form-group">
              <Input
                type="password"
                placeholder="পাসওয়ার্ড"
                {...register("password", { required: true })}
                className="login-input"
              />
            </div>
            <Button type="submit" className="login-button">
              প্রবেশ করুন
            </Button>
          </form>
          <p className="register-text">
            অ্যাকাউন্ট নেই?{" "}
            <Link to="/register" className="register-link">
              রেজিস্টার করুন
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .login-page-wrapper {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #006bb6 0%, #004a99 50%, #ffffff 100%);
        }

        .login-top-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(180deg, #006bb6 0%, #004a99 100%);
        }

        .logo-container {
          margin-bottom: 24px;
          animation: slideDown 0.6s ease-out;
        }

        .joy-bangla-logo {
          width: 120px;
          height: 120px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        .app-title {
          font-size: 32px;
          font-weight: 700;
          color: white;
          letter-spacing: 2px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          margin: 0;
        }

        .login-bottom-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: white;
        }

        .login-form-container {
          width: 100%;
          max-width: 400px;
          animation: slideUp 0.6s ease-out;
        }

        .login-heading {
          font-size: 28px;
          font-weight: 700;
          color: #006bb6;
          text-align: center;
          margin-bottom: 32px;
          margin-top: 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          width: 100%;
        }

        .login-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .login-input:focus {
          border-color: #006bb6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 107, 182, 0.1);
        }

        .login-button {
          width: 100%;
          padding: 12px 16px;
          background: #006bb6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 8px;
        }

        .login-button:hover {
          background: #004a99;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 107, 182, 0.3);
        }

        .login-button:active {
          transform: translateY(0);
        }

        .register-text {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 20px;
          margin-bottom: 0;
        }

        .register-link {
          color: #006bb6;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .register-link:hover {
          color: #004a99;
          text-decoration: underline;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .login-page-wrapper {
            min-height: auto;
          }

          .login-top-section {
            padding: 30px 20px;
            flex: 0 auto;
            min-height: auto;
          }

          .joy-bangla-logo {
            width: 100px;
            height: 100px;
          }

          .app-title {
            font-size: 24px;
          }

          .login-bottom-section {
            padding: 30px 20px;
          }

          .login-heading {
            font-size: 24px;
            margin-bottom: 24px;
          }

          .login-input,
          .login-button {
            padding: 10px 14px;
            font-size: 14px;
          }
        }

        /* Tablet responsive */
        @media (min-width: 641px) and (max-width: 1024px) {
          .login-page-wrapper {
            flex-direction: row;
          }

          .login-top-section {
            padding: 20px;
            justify-content: center;
          }

          .login-bottom-section {
            padding: 20px;
          }
        }

        /* Desktop responsive */
        @media (min-width: 1025px) {
          .login-page-wrapper {
            flex-direction: row;
          }

          .login-form-container {
            max-width: 450px;
          }
        }
      `}</style>
    </div>
  );
}
