import { useEffect, useRef, useState } from "react";
import { fetchRequest } from "../../components/fetchRequets";
import type { IWorkspaceDetails } from "./WorkspaceContainer";

type Errors = {
  name?: string;
  description?: string;
};

type CreateWorkspaceProps = {
  open: boolean;
  onClose: () => void;
  /** Called with the new workspace after the server has created it. */
  onCreated?: (workspace: IWorkspaceDetails) => void;
};

const CreateWorkspace = ({ open, onClose, onCreated }: CreateWorkspaceProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Reset the form every time the modal is opened, and focus the first field.
  useEffect(() => {
    if (!open) return;

    setName("");
    setDescription("");
    setErrors({});
    setFormError("");
    setSubmitting(false);
    nameRef.current?.focus();
  }, [open]);

  // Close on Escape while the modal is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const validate = (): Errors => {
    const next: Errors = {};

    if (!name.trim()) {
      next.name = "Workspace name is required";
    } else if (name.trim().length < 3) {
      next.name = "Workspace name must be at least 3 characters";
    }

    if (description.trim().length > 200) {
      next.description = "Description must be 200 characters or less";
    }

    return next;
  };

  const clear = (field: keyof Errors) => {
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetchRequest<IWorkspaceDetails>({
        url: "/org/workspace/create",
        method: "POST",
        body: { name: name.trim(), description: description.trim() },
      });

      if (!response.success) {
        setFormError(response.message);
        return;
      }

      onCreated?.(response.data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const labelClass = "block text-sm font-medium text-gray-900";

  const inputClass =
    "mt-2 block w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400";

  const borderClass = (invalid: boolean) =>
    invalid
      ? "border-red-500 focus:border-red-500"
      : "border-gray-300 focus:border-gray-900";

  const errorClass = "mt-1.5 text-xs text-red-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        // Only a click on the backdrop itself closes the modal.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="create-workspace-title"
          className="text-lg font-semibold text-gray-900"
        >
          Create workspace
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Give your workspace a name and an optional description.
        </p>

        <form className="mt-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="workspace-name" className={labelClass}>
              Name
            </label>
            <input
              id="workspace-name"
              name="name"
              type="text"
              ref={nameRef}
              placeholder="Marketing"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clear("name");
              }}
              aria-invalid={!!errors.name}
              aria-describedby={
                errors.name ? "workspace-name-error" : undefined
              }
              className={`${inputClass} ${borderClass(!!errors.name)}`}
            />
            {errors.name && (
              <p id="workspace-name-error" className={errorClass}>
                {errors.name}
              </p>
            )}
          </div>

          <div className="mt-5">
            <label htmlFor="workspace-description" className={labelClass}>
              Description{" "}
              <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="workspace-description"
              name="description"
              rows={3}
              placeholder="What is this workspace for?"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                clear("description");
              }}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "workspace-description-error" : undefined
              }
              className={`${inputClass} resize-none ${borderClass(
                !!errors.description,
              )}`}
            />
            {errors.description ? (
              <p id="workspace-description-error" className={errorClass}>
                {errors.description}
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400">
                {description.trim().length}/200
              </p>
            )}
          </div>

          {formError && (
            <p role="alert" className="mt-5 text-sm text-red-600">
              {formError}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspace;
