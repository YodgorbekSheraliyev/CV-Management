import { useEffect, useState } from "react";
import SectionHeader from "../SectionHeader";
import AttributePickerModal from "../AttributePickerModal";
// import AttributeRow from "../AttributeRow";
import ToastNotification from "../notifications/ToastNotification";
import type { Attribute, AttributeValue, User } from "../../models";
import { getAttributes } from "../../api/attributeApi";
import {
  deleteAttributeValue,
  getAttributeValuesByUserId,
} from "../../api/attributeValueApi";
import AttributeRow from "./AttributeRow";

interface InfoSectionProps {
  user: User;
}

const InfoSection = ({ user }: InfoSectionProps) => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  const loadAttributes = async () => {
    try {
      const res = await getAttributes();
      setAttributes(res.filter((x) => x.isBuiltIn !== true));
    } catch (err: any) {
      setToast({
        message: err.message ?? "Could not load attributes.",
        type: "danger",
      });
    }
  };

  const loadAttributeValues = async () => {
    try {
      const res = await getAttributeValuesByUserId(user.id);
      setAttributeValues(res.filter((x) => !x.attribute.isBuiltIn));
    } catch (err: any) {
      setToast({
        message: err.message ?? "Could not load attribute values.",
        type: "danger",
      });
    }
  };

  const handleSelectAttribute = (attribute: Attribute) => {
    const alreadyExists = attributeValues.some(
      (x) => x.attribute.id === attribute.id,
    );

    if (alreadyExists) {
      setToast({
        message: `"${attribute.name}" has already been added.`,
        type: "danger",
      });
      return;
    }

    const alreadySelected = attributeValues.some(
      (x) => x.id < 0 && x.attribute.id === attribute.id,
    );

    if (alreadySelected) {
      setToast({
        message: `"${attribute.name}" is already being added.`,
        type: "danger",
      });
      return;
    }

    const temporaryAttributeValue = {
      id: -Date.now(),
      attributeId: attribute.id,
      userId: user.id,
      value: "",
      attribute,
    } as AttributeValue;

    setAttributeValues((current) => [...current, temporaryAttributeValue]);
    setOpenId(temporaryAttributeValue.id);
    setIsAttributeModalOpen(false);
  };

  const handleDelete = async (attributeValue: AttributeValue) => {
    try {
      if (attributeValue.id < 0) {
        setAttributeValues((current) =>
          current.filter((x) => x.id !== attributeValue.id),
        );
        return;
      }

      await deleteAttributeValue({ id: attributeValue.id });
      await loadAttributeValues();
    } catch (err: any) {
      setToast({
        message: err.message ?? "Could not delete attribute.",
        type: "danger",
      });
    }
  };

  useEffect(() => {
    loadAttributeValues();
    loadAttributes();
  }, [user.id]);

  return (
    <section>
      <SectionHeader
        title="Info"
        description="Additional information from the Attribute Library."
        buttonText="Add attribute"
        onClick={() => setIsAttributeModalOpen(true)}
      />

      <div className="card border-0 shadow-sm">
        {attributeValues.length === 0 ? (
          <div className="card-body text-center py-5">
            <i className="bi bi-collection fs-2 text-muted d-block mb-2" />
            <p className="fw-semibold mb-1">No additional info yet</p>
            <p className="text-muted small mb-3">
              Add attributes like skills, links, or dates to enrich your
              profile.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAttributeModalOpen(true)}
            >
              <i className="bi bi-plus-lg me-1" />
              Add attribute
            </button>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {attributeValues.map((aValue) => (
              <AttributeRow
                key={aValue.id}
                attributeValue={aValue}
                user={user}
                isOpen={openId === aValue.id}
                onToggle={() =>
                  setOpenId((current) =>
                    current === aValue.id ? null : aValue.id,
                  )
                }
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {isAttributeModalOpen && (
        <AttributePickerModal
          attributes={attributes.filter(
            (attribute) =>
              !attributeValues.some(
                (value) => value.attribute.id === attribute.id,
              ),
          )}
          onSelect={handleSelectAttribute}
          onClose={() => setIsAttributeModalOpen(false)}
        />
      )}

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </section>
  );
};

export default InfoSection;