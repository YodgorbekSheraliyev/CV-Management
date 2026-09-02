import { AttributeCategory, AttributeType } from "../enums/enums";
import type { Attribute } from "../models";

const CATEGORY_LABELS: Record<AttributeCategory, string> = {
  [AttributeCategory.Certification]: "Certification",
  [AttributeCategory.DomainKnowledge]: "Domain Knowledge",
  [AttributeCategory.PersonalInformation]: "Personal Information",
  [AttributeCategory.SoftSkills]: "Soft Skills",
  [AttributeCategory.TechnicalSkills]: "Technical Skills",
  [AttributeCategory.Education]: "Education",
  [AttributeCategory.WorkAuthorization]: "Work Authorization",
  [AttributeCategory.WorkPreference]: "Work Preference",
  [AttributeCategory.Salary]: "Salary",
};

interface AttributeCardProps {
  attribute: Attribute;
  onEdit: (attribute: Attribute) => void;
  onDelete: (attribute: Attribute) => void;
}
export function AttributeCard({
  attribute,
  onEdit,
  onDelete,
}: AttributeCardProps) {
  return (
    <div
      className={`card h-100 border-0 shadow-sm ${attribute.isBuiltIn ? "bg-light" : ""}`}
      style={{ borderRadius: "16px", overflow: "hidden" }}
    >
      {" "}
      {/* Category accent */} <div style={{ height: "5px" }} />{" "}
      <div className="card-body p-4">
        {" "}
        {/* Header */}{" "}
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          {" "}
          <div className="min-w-0">
            {" "}
            <div className="d-flex align-items-center gap-2 mb-2">
              {" "}
              <span
                className="badge rounded-pill"
                style={{
                  color: "#fff",
                  fontWeight: 500,
                  padding: "6px 10px",
                }}
              >
                {" "}
                {CATEGORY_LABELS[attribute.category]}{" "}
              </span>{" "}
              {attribute.isBuiltIn && (
                <span className="badge rounded-pill bg-secondary-subtle text-secondary">
                  {" "}
                  Built-in{" "}
                </span>
              )}{" "}
            </div>{" "}
            <h3
              className="h5 fw-semibold mb-0 text-dark"
              style={{ overflowWrap: "anywhere" }}
            >
              {" "}
              {attribute.name}{" "}
            </h3>{" "}
          </div>{" "}
          <span
            className="badge rounded-2 flex-shrink-0"
            style={{
              backgroundColor: "#f1f3f5",
              color: "#495057",
              fontWeight: 500,
              padding: "7px 9px",
            }}
          >
            {" "}
            {AttributeType[attribute.type]}{" "}
          </span>{" "}
        </div>{" "}
        {/* Description */}{" "}
        <p
          className="text-secondary small mb-4"
          style={{ lineHeight: 1.6, minHeight: "48px" }}
        >
          {" "}
          {attribute?.description || "No description provided."}{" "}
        </p>{" "}
        {/* Footer */}{" "}
        <div
          className="d-flex align-items-center justify-content-between pt-3"
          style={{ borderTop: "1px solid #e9ecef" }}
        >
          {" "}
          {attribute.isBuiltIn ? (
            <span className="text-muted small"> 🔒 Managed by system </span>
          ) : (
            <>
              {" "}
              <button
                type="button"
                className="btn btn-sm btn-light px-3"
                onClick={() => onEdit(attribute)}
              >
                {" "}
                Edit{" "}
              </button>{" "}
              <button
                type="button"
                className="btn btn-sm btn-outline-danger px-3"
                onClick={() => onDelete(attribute)}
              >
                {" "}
                Delete{" "}
              </button>{" "}
            </>
          )}{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}
