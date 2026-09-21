import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SectionHeader from "../SectionHeader";
import AttributePickerModal from "../AttributePickerModal";
import ToastNotification from "../notifications/ToastNotification";
import type { Attribute, AttributeValue, User } from "../../models";
import { getAttributes } from "../../api/attributeApi";
import {
  createAttributeValue,
  deleteAttributeValue,
  getAttributeValuesByUserId,
} from "../../api/attributeValueApi";
import AttributeRow from "./AttributeRow";

interface InfoSectionProps {
  user: User;
}

const InfoSection = ({ user }: InfoSectionProps) => {
  const { t } = useTranslation();
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
        message: err.message ?? t("infoSection.loadAttributesFailed"),
        type: "danger",
      });
    }
  };

  const loadAttributeValues = async () => {
    try {
      const res = await getAttributeValuesByUserId();
      setAttributeValues(res.filter((x) => !x.attribute.isBuiltIn));
    } catch (err: any) {
      setToast({
        message: err.message ?? t("infoSection.loadValuesFailed"),
        type: "danger",
      });
    }
  };

  const handleSelectAttribute = async (attribute: Attribute) => {
    const alreadyExists = attributeValues.some(
      (x) => x.attribute.id === attribute.id,
    );

    if (alreadyExists) {
      setToast({
        message: t("infoSection.alreadyAdded", { name: attribute.name }),
        type: "danger",
      });
      return;
    }

    const alreadySelected = attributeValues.some(
      (x) => x.id < 0 && x.attribute.id === attribute.id,
    );

    if (alreadySelected) {
      setToast({
        message: t("infoSection.alreadyAdding", { name: attribute.name }),
        type: "danger",
      });
      return;
    }

    const temporaryAttributeValue = {
      attributeId: attribute.id,
      userId: user.id,
      value: "",
      attribute,
    } as AttributeValue;

    const newAttributeValue = await createAttributeValue(
      temporaryAttributeValue,
    );
    setAttributeValues((current) => [...current, newAttributeValue]);
    setOpenId(temporaryAttributeValue.id);
    setIsAttributeModalOpen(false);
  };

  const handleDelete = async (attributeValue: AttributeValue) => {
    try {
      await deleteAttributeValue({ id: attributeValue.id });
      await loadAttributeValues();
    } catch (err: any) {
      setToast({
        message: err.message ?? t("infoSection.deleteFailed"),
        type: "danger",
      });
    }
  };

  const handleValueChange = async () => {
    await loadAttributeValues();
  };

  useEffect(() => {
    loadAttributeValues();
    loadAttributes();
  }, [user.id]);

  return (
    <section>
      <SectionHeader
        title={t("infoSection.title")}
        description={t("infoSection.description")}
        buttonText={t("infoSection.addAttribute")}
        onClick={() => setIsAttributeModalOpen(true)}
      />

      <div className="card border-0 shadow-sm">
        {attributeValues.length === 0 ? (
          <div className="card-body text-center py-5">
            <i className="bi bi-collection fs-2 text-muted d-block mb-2" />
            <p className="fw-semibold mb-1">{t("infoSection.noInfo")}</p>
            <p className="text-muted small mb-3">
              {t("infoSection.noInfoDescription")}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsAttributeModalOpen(true)}
            >
              <i className="bi bi-plus-lg me-1" />
              {t("infoSection.addAttribute")}
            </button>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {attributeValues.map((aValue) => (
              <AttributeRow
                key={aValue.id}
                attributeValue={aValue}
                isOpen={openId === aValue.id}
                onToggle={() =>
                  setOpenId((current) =>
                    current === aValue.id ? null : aValue.id,
                  )
                }
                onChange={handleValueChange}
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
