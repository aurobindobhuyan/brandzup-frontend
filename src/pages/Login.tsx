import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useUser } from "../context/UserContext";
import { fetchRequest } from "../components/fetchRequets";

type Errors = {
  email?: string;
  password?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [email, setEmail] = useState("aurobindobhuyan6@gmail.com");
  const [password, setPassword] = useState("ffffffff");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const { setUser, refreshSession } = useUser();

  const validate = (): Errors => {
    const next: Errors = {};

    if (!email.trim()) {
      next.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      next.email = "Enter a valid email address";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    return next;
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await fetchRequest({
        url: "/user/login",
        body: { email, password },
        method: "POST",
      });

      if (!response.success) {
        setUser(null);
        setErrors({ password: response.message });
        return;
      }

      // /user/me is the source of truth for the session shape; the login
      // response is the user document, not the session.
      await refreshSession();
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "block h-[41.4px] w-full rounded-[8.871px] border bg-transparent px-[14.11px] text-[15.408px] leading-normal text-black outline-none placeholder:text-[#717182]";

  return (
    <AuthLayout>
      <h2 className="flex h-[36.8px] items-center text-[26.522px] leading-[36.8px] text-black">
        Sign in
      </h2>
      <p className="mt-[0.29px] flex h-[27.6px] items-center text-[17.106px] leading-[27.6px] text-[rgba(98,98,98,0.76)]">
        Sign in to your account to continue
      </p>

      <form className="mt-[38.81px]" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="email"
            className="flex h-[16.1px] items-center text-[16.166px] leading-[16.1px] text-black"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`mt-[9.2px] ${inputClass} ${
              errors.email
                ? "border-red-500 focus:border-red-500"
                : "border-[#565656] focus:border-black"
            }`}
          />
          {errors.email && (
            <p
              id="email-error"
              className="mt-1.5 text-[12px] leading-4 text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div className="mt-[28.76px]">
          <div className="flex h-[16.1px] items-center justify-between">
            <label
              htmlFor="password"
              className="text-[15.155px] leading-[16.1px] text-black"
            >
              Password
            </label>
            <Link
              to="/forgot-password"
              className="flex h-[15.771px] items-center text-[15.155px] leading-6 text-black hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`mt-[19.54px] ${inputClass} ${
              errors.password
                ? "border-red-500 focus:border-red-500"
                : "border-[#565656] focus:border-black"
            }`}
          />
          {errors.password && (
            <p
              id="password-error"
              className="mt-1.5 text-[12px] leading-4 text-red-600"
            >
              {errors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-[18.4px] flex h-[41.4px] w-full items-center justify-center rounded-[8.871px] bg-black text-[15.408px] leading-6 text-white disabled:opacity-60"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="mt-[39.42px] flex h-[15.771px] items-center justify-center">
        <p className="text-center text-[15.155px] leading-6 text-black">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-black hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
