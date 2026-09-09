import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useUser } from "../context/UserContext";
import { fetchRequest } from "../components/fetchRequets";

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const { setUser } = useUser();

  const validate = (): Errors => {
    const next: Errors = {};

    if (!name.trim()) {
      next.name = "Name is required";
    }

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

    if (!confirmPassword) {
      next.confirmPassword = "Confirm your password";
    } else if (confirmPassword !== password) {
      next.confirmPassword = "Passwords do not match";
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
      const result = await fetchRequest({
        url: `${import.meta.env.VITE_SERVER_URL}/user/register`,
        method: "POST",
        body: { name, email, password },
      });

      if (result.success) {
        console.log("Created", result);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass =
    "flex h-[16.1px] items-center text-[16.166px] leading-[16.1px] text-black";

  const inputClass =
    "mt-[9.2px] block h-[41.4px] w-full rounded-[8.871px] border bg-transparent px-[14.11px] text-[15.408px] leading-normal text-black outline-none placeholder:text-[#717182]";

  const borderClass = (invalid: boolean) =>
    invalid
      ? "border-red-500 focus:border-red-500"
      : "border-[#565656] focus:border-black";

  const errorClass = "mt-[6px] text-[12px] leading-[16px] text-red-600";

  const clear = (field: keyof Errors) => {
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  return (
    <AuthLayout>
      <h2 className="flex h-[36.8px] items-center text-[26.522px] leading-[36.8px] text-black">
        Create an account
      </h2>
      <p className="mt-[0.29px] flex h-[27.6px] items-center text-[17.106px] leading-[27.6px] text-[rgba(98,98,98,0.76)]">
        Sign up to start using Brandverse
      </p>

      <form className="mt-[38.81px]" onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              clear("name");
            }}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={`${inputClass} ${borderClass(!!errors.name)}`}
          />
          {errors.name && (
            <p id="name-error" className={errorClass}>
              {errors.name}
            </p>
          )}
        </div>

        <div className="mt-[28.76px]">
          <label htmlFor="email" className={labelClass}>
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
              clear("email");
            }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            className={`${inputClass} ${borderClass(!!errors.email)}`}
          />
          {errors.email && (
            <p id="email-error" className={errorClass}>
              {errors.email}
            </p>
          )}
        </div>

        <div className="mt-[28.76px]">
          <label htmlFor="password" className={labelClass}>
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clear("password");
            }}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            className={`${inputClass} ${borderClass(!!errors.password)}`}
          />
          {errors.password && (
            <p id="password-error" className={errorClass}>
              {errors.password}
            </p>
          )}
        </div>

        <div className="mt-[28.76px]">
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clear("confirmPassword");
            }}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={
              errors.confirmPassword ? "confirm-password-error" : undefined
            }
            className={`${inputClass} ${borderClass(!!errors.confirmPassword)}`}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className={errorClass}>
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-[18.4px] flex h-[41.4px] w-full items-center justify-center rounded-[8.871px] bg-black text-[15.408px] leading-[23px] text-white disabled:opacity-60"
        >
          {submitting ? "Creating account..." : "Sign up"}
        </button>
      </form>

      <div className="mt-[39.42px] flex h-[15.771px] items-center justify-center">
        <p className="text-center text-[15.155px] leading-[23px] text-black">
          Already have an account?{" "}
          <Link to="/login" className="text-black hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
