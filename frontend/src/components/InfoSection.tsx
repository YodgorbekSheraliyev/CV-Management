import { useEffect, useState } from "react";
import SectionHeader from "./SectionHeader";
import AttributePickerModal from "./AttributePickerModal";
import ValueCard from "./ValueCard";
import type { Attribute, AttributeValue, User } from "../models";
import { getAttributes } from "../api/attributeApi";
import {
  deleteAttributeValue,
  getAttributeValuesByUserId,
} from "../api/attributeValueApi";

interface InfoSectionProps {
  user: User;
}

const InfoSection = ({ user }: InfoSectionProps) => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeValues, setAttributeValues] = useState<AttributeValue[]>([]);
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [error, setError] = useState<string>("");

  const loadAttributes = async () => {
    try {
      const res = await getAttributes();
      setAttributes(res.filter((x) => x.isBuiltIn !== true));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadAttributeValues = async () => {
    try {
      const res = await getAttributeValuesByUserId(user.id);
      setAttributeValues(res.filter((x) => !x.attribute.isBuiltIn));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSelectAttribute = (attribute: Attribute) => {
    setError("");

    const alreadyExists = attributeValues.some(
      (x) => x.attribute.id === attribute.id,
    );

    if (alreadyExists) {
      setError(`"${attribute.name}" has already been added.`);
      return;
    }

    const alreadySelected = attributeValues.some(
      (x) => x.id < 0 && x.attribute.id === attribute.id,
    );

    if (alreadySelected) {
      setError(`"${attribute.name}" is already being added.`);

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

    setIsAttributeModalOpen(false);
  };

  const handleDelete = async (attributeValue: AttributeValue) => {
    try {
      setError("");

      if (attributeValue.id < 0) {
        setAttributeValues((current) =>
          current.filter((x) => x.id !== attributeValue.id),
        );

        return;
      }

      await deleteAttributeValue({
        id: attributeValue.id,
      });
      await loadAttributeValues();
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadAttributeValues();
    loadAttributes();
  }, [user.id]);

  useEffect(() => {
    if (!error) {
      return;
    }

    const timer = setTimeout(() => {
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error]);

  return (
    <section>
      <SectionHeader
        title="Info"
        description="Additional information from the Attribute Library."
        buttonText="Add attribute"
        onClick={() => setIsAttributeModalOpen(true)}
      />

      {attributeValues.length > 0 && (
        <div className="row g-3 mb-4">
          {attributeValues.map((aValue) => (
            <div className="col-12 col-md-6 col-lg-4 d-flex" key={aValue.id}>
              <ValueCard
                attributeValue={aValue}
                user={user}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

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

      {error && (
        <div
          className="toast-container position-fixed bottom-0 end-0 p-3"
          style={{ zIndex: 1100 }}
        >
          <div
            className="toast show border-0 shadow"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <div className="toast-header">
              <span
                className="bg-danger rounded-circle me-2"
                style={{
                  width: "10px",
                  height: "10px",
                  display: "inline-block",
                }}
              />

              <strong className="me-auto">Error</strong>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setError("")}
              />
            </div>

            <div className="toast-body">{error}</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default InfoSection;
