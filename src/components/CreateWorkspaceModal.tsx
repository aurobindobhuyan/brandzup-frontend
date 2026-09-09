import { useEffect, useRef, useState } from "react";
import { fetchRequest, METHOD } from "./fetchRequets";

export type CreatedWorkspace = {
  nanoId: string;
  name: string;
  description?: string;
  logo?: string;
};

type Errors = {
  name?: string;
  description?: string;
  logo?: string;
  form?: string;
};

const NAME_MAX = 60;
const DESCRIPTION_MAX = 200;

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
};

const CreateWorkspaceModal = ({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (workspace: CreatedWorkspace) => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset on open so a cancelled attempt does not leak into the next one.
  useEffect(() => {
    if (!open) return;

    setName("");
    setDescription("");
    setLogo("");
    setErrors({});
    nameRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const validate = (): Errors => {
    const next: Errors = {};

    if (!name.trim()) {
      next.name = "Workspace name is required";
    } else if (name.trim().length > NAME_MAX) {
      next.name = `Keep it under ${NAME_MAX} characters`;
    }

    if (description.trim().length > DESCRIPTION_MAX) {
      next.description = `Keep it under ${DESCRIPTION_MAX} characters`;
    }

    if (logo.trim() && !isHttpUrl(logo.trim())) {
      next.logo = "Enter a valid http(s) image URL";
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
      const response = await fetchRequest<CreatedWorkspace>({
        url: "/org/workspace/create",
        method: METHOD.POST,
        body: {
          name: name.trim(),
          description: description.trim(),
          ...(logo.trim() ? { logo: logo.trim() } : {}),
        },
      });

      if (!response.success) {
        setErrors({ form: response.message });
        return;
      }

      onCreated(response.data);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "block w-full rounded-[8.871px] border bg-transparent px-[14.11px] text-[15.408px] leading-normal text-black outline-none placeholder:text-[#717182]";

  const borderClass = (hasError: boolean) =>
    hasError
      ? "border-red-500 focus:border-red-500"
      : "border-[#565656] focus:border-black";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6 py-10">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
        className="relative max-h-full w-full max-w-[480px] overflow-y-auto rounded-[16.757px] border-[1.314px] border-[rgba(255,255,255,0.27)] bg-[#fcfcfc] p-[27.6px]"
      >
        <h2
          id="create-workspace-title"
          className="text-[26.522px] leading-[36.8px] text-black"
        >
          Create workspace
        </h2>
        <p className="mt-[0.29px] text-[17.106px] leading-[27.6px] text-[rgba(98,98,98,0.76)]">
          Set up a space for your brands and guidelines
        </p>

        <form className="mt-[28.76px]" onSubmit={handleSubmit} noValidate>
          <div>
            <label
              htmlFor="workspace-name"
              className="flex items-center text-[16.166px] text-black"
            >
              Name
            </label>
            <input
              id="workspace-name"
              ref={nameRef}
              name="name"
              type="text"
              autoComplete="organization"
              placeholder="Acme Inc."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "workspace-name-error" : undefined}
              className={`mt-[9.2px] h-[41.4px] ${inputClass} ${borderClass(
                !!errors.name,
              )}`}
            />
            {errors.name && (
              <p
                id="workspace-name-error"
                className="mt-1.5 text-[12px] leading-4 text-red-600"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="mt-[20px]">
            <label
              htmlFor="workspace-description"
              className="flex items-center text-[16.166px] text-black"
            >
              Description
              <span className="ml-1 text-[13px] text-[rgba(98,98,98,0.76)]">
                (optional)
              </span>
            </label>
            <textarea
              id="workspace-description"
              name="description"
              rows={3}
              placeholder="What this workspace is for"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors({ ...errors, description: undefined });
              }}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "workspace-description-error" : undefined
              }
              className={`mt-[9.2px] resize-none py-[10px] ${inputClass} ${borderClass(
                !!errors.description,
              )}`}
            />
            {errors.description && (
              <p
                id="workspace-description-error"
                className="mt-1.5 text-[12px] leading-4 text-red-600"
              >
                {errors.description}
              </p>
            )}
          </div>

          <div className="mt-[20px]">
            <label
              htmlFor="workspace-logo"
              className="flex items-center text-[16.166px] text-black"
            >
              Logo URL
              <span className="ml-1 text-[13px] text-[rgba(98,98,98,0.76)]">
                (optional)
              </span>
            </label>
            <div className="mt-[9.2px] flex items-center gap-3">
              {isHttpUrl(logo.trim()) && (
                <img
                  src={logo.trim()}
                  alt=""
                  className="size-[41.4px] shrink-0 rounded-[8px] border border-[#e4e4e4] object-cover"
                  onError={(e) => {
                    e.currentTarget.style.visibility = "hidden";
                  }}
                />
              )}
              <input
                id="workspace-logo"
                name="logo"
                type="url"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => {
                  setLogo(e.target.value);
                  if (errors.logo) setErrors({ ...errors, logo: undefined });
                }}
                aria-invalid={!!errors.logo}
                aria-describedby={
                  errors.logo ? "workspace-logo-error" : undefined
                }
                className={`h-[41.4px] ${inputClass} ${borderClass(
                  !!errors.logo,
                )}`}
              />
            </div>
            {errors.logo && (
              <p
                id="workspace-logo-error"
                className="mt-1.5 text-[12px] leading-4 text-red-600"
              >
                {errors.logo}
              </p>
            )}
          </div>

          {errors.form && (
            <p className="mt-[20px] text-[13px] leading-5 text-red-600">
              {errors.form}
            </p>
          )}

          <div className="mt-[28.76px] flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex h-[41.4px] flex-1 items-center justify-center rounded-[8.871px] bg-black text-[15.408px] leading-6 text-white disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create workspace"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex h-[41.4px] items-center justify-center rounded-[8.871px] border border-[#565656] px-6 text-[15.408px] leading-6 text-black disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
