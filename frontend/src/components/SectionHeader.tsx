import type { MouseEvent } from "react";

const SectionHeader = ({
  title,
  description,
  buttonText,
  onClick,
}: {
  title: string;
  description: string;
  buttonText?: string;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) => {
  return (
    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
      <div>
        <h2 className="h5 fw-bold mb-1">{title}</h2>
        <p className="text-muted small mb-0">{description}</p>
      </div>

      {buttonText && (
        <button onClick={onClick} className="btn btn-primary">
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
