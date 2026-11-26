import type { ComponentPropsWithoutRef } from "react";

type FieldProps = ComponentPropsWithoutRef<"input"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

export function Field({ id, label, hint, error, ...input }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const descriptions = [input["aria-describedby"], hintId, errorId].filter(Boolean).join(" ");
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <input {...input} id={id} aria-describedby={descriptions || undefined} aria-invalid={error ? true : input["aria-invalid"]} />
      {hint ? <small id={hintId}>{hint}</small> : null}
      {error ? <small id={errorId} className="admin-field-error">{error}</small> : null}
    </div>
  );
}
