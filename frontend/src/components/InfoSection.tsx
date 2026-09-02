import { useEffect, useState } from "react";

import SectionHeader from "./SectionHeader";
import AttributePickerModal from "./AttributePickerModal";
import type { Attribute } from "../models";
import { AttributeCard } from "./AttributeCard";
import { getAttributes } from "../api/attributeApi";
import AttributeValueModal from "./AttributeValueModal";

const InfoSection = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);

  const [selectedAttributes, setSelectedAttributes] = useState<Attribute[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute>();

  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [isAttributeValueModalOpen, setIsAttributeValueModalOpen] =
    useState(false);

  const handleSelectAttribute = (attribute: Attribute) => {
    if (!selectedAttributes.some((item) => item.id === attribute.id)) {
      setSelectedAttributes((current) => [...current, attribute]);
    }

    setIsAttributeModalOpen(false);
  };

  const loadAttributes = async () => {
    const res = await getAttributes();
    setAttributes(res.filter((x) => x.isBuiltIn != true));
  };

  const handleEdit = (attribute: Attribute) => {
    setIsAttributeValueModalOpen(true)
    setSelectedAttribute(attribute)
  };

  const handleDelete = (attribute: Attribute) => {
    if (attribute.isBuiltIn) {
      return;
    }

    const confirmed = window.confirm(`Delete "${attribute.name}"?`);

    if (!confirmed) {
      return;
    }

    setAttributes((current) =>
      current.filter((item) => item.id !== attribute.id),
    );

    setSelectedAttributes((current) =>
      current.filter((item) => item.id !== attribute.id),
    );
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  return (
    <section>
      <SectionHeader
        title="Info"
        description="Additional information from the Attribute Library."
        buttonText="Add attribute"
        onClick={() => setIsAttributeModalOpen(true)}
      />

      {selectedAttributes.length > 0 && (
        <div className="row g-3 mb-4">
          {selectedAttributes.map((attribute) => (
            <div className="col-12 col-md-6 col-lg-4" key={attribute.id}>
              <AttributeCard
                attribute={attribute}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="fs-2 mb-2">＋</div>

          <h3 className="h6 fw-bold mb-2">Add more information</h3>

          <p className="text-muted small mb-3">
            Choose additional attributes to make your profile more complete.
          </p>

          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setIsAttributeModalOpen(true)}
          >
            Browse Attribute Library
          </button>
        </div>
      </div>

      {isAttributeModalOpen && (
        <AttributePickerModal
          attributes={attributes}
          onSelect={handleSelectAttribute}
          onClose={() => setIsAttributeModalOpen(false)}
        />
      )}

      {isAttributeValueModalOpen && (
        <AttributeValueModal
          attribute={selectedAttribute!}
          initialValue={"123"}
          onSave={() => {}}
          onCancel={() => setIsAttributeValueModalOpen(false)}
          saving={false}
          error={null}
        />
      )}
    </section>
  );
};

export default InfoSection;
