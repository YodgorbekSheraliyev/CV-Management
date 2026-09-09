const ProfileField = ({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) => {
  return (
    <div className={`px-4 py-3 ${!last ? "border-bottom" : ""}`}>
      <div className="row">
        <div className="col-md-4">
          <span className="text-muted small">{label}</span>
        </div>

        <div className="col-md-8">
          <span className="fw-medium">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileField;
