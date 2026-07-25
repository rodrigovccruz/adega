"use client";

type Props = {
  label?: string;
  confirmMessage: string;
};

export function ConfirmDeleteButton({
  label = "Excluir",
  confirmMessage,
}: Props) {
  return (
    <button
      type="submit"
      className="btn btn-danger btn-small"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </button>
  );
}
