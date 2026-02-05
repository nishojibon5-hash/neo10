import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { setToken, setUser } from "@/lib/auth";

type Form = { name: string; identifier: string; password: string };

export default function Register() {
  const { register, handleSubmit } = useForm<Form>();
  const navigate = useNavigate();

  const onSubmit = async (values: Form) => {
    const body: any = { name: values.name, password: values.password };
    if (values.identifier.includes("@")) body.email = values.identifier;
    else body.phone = values.identifier;
    const res = await fetch("/api/auth/register", {
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
      alert(data.error ? JSON.stringify(data.error) : "Registration failed");
    }
  };

  return (
    <div className="register-page-wrapper">
      {/* Top section with logo - Bangladesh green */}
      <div className="register-top-section">
        <div className="logo-container">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2F912f3720571b4a278e4934b7e38806ae%2F7619e011fb6d4793a38c4f3e489d897e?format=webp&width=800&height=1200"
            alt="Joy Bangla"
            className="joy-bangla-logo"
          />
        </div>
        <h1 className="app-title">JOY BANGLA</h1>
      </div>

      {/* Bottom section with registration form */}
      <div className="register-bottom-section">
        <div className="register-form-container">
          <h2 className="register-heading">নতুন অ্যাকাউন্ট তৈরি করুন</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            <div className="form-group">
              <Input
                placeholder="পূর্ণ নাম"
                {...register("name", { required: true })}
                className="register-input"
              />
            </div>
            <div className="form-group">
              <Input
                placeholder="ফোন নম্বর অথবা ইমেইল"
                {...register("identifier", { required: true })}
                className="register-input"
              />
            </div>
            <div className="form-group">
              <Input
                type="password"
                placeholder="পাসওয়ার্ড"
                {...register("password", { required: true })}
                className="register-input"
              />
            </div>
            <Button type="submit" className="register-button">
              রেজিস্টার করুন
            </Button>
          </form>
          <p className="login-text">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
            <Link to="/login" className="login-link">
              প্রবেশ করুন
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        .register-page-wrapper {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(180deg, #006bb6 0%, #004a99 50%, #ffffff 100%);
        }

        .register-top-section {
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

        .register-bottom-section {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: white;
        }

        .register-form-container {
          width: 100%;
          max-width: 400px;
          animation: slideUp 0.6s ease-out;
        }

        .register-heading {
          font-size: 28px;
          font-weight: 700;
          color: #006bb6;
          text-align: center;
          margin-bottom: 32px;
          margin-top: 0;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          width: 100%;
        }

        .register-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .register-input:focus {
          border-color: #006bb6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0, 107, 182, 0.1);
        }

        .register-button {
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

        .register-button:hover {
          background: #004a99;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 107, 182, 0.3);
        }

        .register-button:active {
          transform: translateY(0);
        }

        .login-text {
          text-align: center;
          color: #6b7280;
          font-size: 14px;
          margin-top: 20px;
          margin-bottom: 0;
        }

        .login-link {
          color: #006bb6;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.3s ease;
        }

        .login-link:hover {
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
          .register-page-wrapper {
            min-height: auto;
          }

          .register-top-section {
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

          .register-bottom-section {
            padding: 30px 20px;
          }

          .register-heading {
            font-size: 24px;
            margin-bottom: 24px;
          }

          .register-input,
          .register-button {
            padding: 10px 14px;
            font-size: 14px;
          }
        }

        /* Tablet responsive */
        @media (min-width: 641px) and (max-width: 1024px) {
          .register-page-wrapper {
            flex-direction: row;
          }

          .register-top-section {
            padding: 20px;
            justify-content: center;
          }

          .register-bottom-section {
            padding: 20px;
          }
        }

        /* Desktop responsive */
        @media (min-width: 1025px) {
          .register-page-wrapper {
            flex-direction: row;
          }

          .register-form-container {
            max-width: 450px;
          }
        }
      `}</style>
    </div>
  );
}
