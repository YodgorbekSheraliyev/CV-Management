import type { User } from "../models";
import ProfileField from "./ProfileField";
import SectionHeader from "./SectionHeader";

const MeSection = ({ user }: { user: User }) => {
  return (
    <section>
      <SectionHeader
        title="Me"
        description="Your basic personal information."
        buttonText="Edit"
      />

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <ProfileField label="First Name" value={user.firstName} />
          <ProfileField label="Last Name" value={user.lastName} />
          <ProfileField label="Email" value={user.email} />
          <ProfileField label="Location" value={user.location ?? ""} />
        </div>
      </div>
    </section>
  );
};

export default MeSection;
