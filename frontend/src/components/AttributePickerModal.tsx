import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Attribute } from "../models";
import { AttributeCategory } from "../enums/enums";
import { AttributeType } from "../enums/enums";

interface AttributePickerModalProps {
  attributes: Attribute[];
  onSelect: (attribute: Attribute) => void;
  onClose: () => void;
}

const RECENT_ATTRIBUTE_IDS = [1, 3, 5];

export default function AttributePickerModal({
  attributes,
  onSelect,
  onClose,
}: AttributePickerModalProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AttributeCategory | "all"
  >("all");

  const recentlyUsed = useMemo(() => {
    return RECENT_ATTRIBUTE_IDS
      .map((id) =>
        attributes.find((attribute) => attribute.id === id)
      )
      .filter(
        (attribute): attribute is Attribute =>
          Boolean(attribute)
      );
  }, [attributes]);

  const filteredAttributes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attributes.filter((attribute) => {
      const matchesPrefix =
        query === "" ||
        attribute.name.toLowerCase().startsWith(query);

      const matchesCategory =
        category === "all" ||
        attribute.category === category;

      return matchesPrefix && matchesCategory;
    });
  }, [attributes, search, category]);

  const categories = Object.values(AttributeCategory).filter(
    (value): value is AttributeCategory =>
      typeof value === "number"
  );

  return (
    <div
      className="modal d-block"
      tabIndex={-1}
      role="dialog"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.45)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        role="document"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow"
          style={{
            borderRadius: "18px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="modal-header px-4 py-3">
            <div>
              <h2 className="h5 fw-bold mb-1">
                {t("attributePicker.addAttribute")}
              </h2>

              <p className="text-muted small mb-0">
                {t("attributePicker.description")}
              </p>
            </div>

            <button
              type="button"
              className="btn-close"
              aria-label={t("common.close")}
              onClick={onClose}
            />
          </div>

          {/* Search */}
          <div className="px-4 pt-3">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search"/>
              </span>

              <input
                type="text"
                className="form-control"
                placeholder={t("attributePicker.search")}
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                autoFocus
              />
            </div>
          </div>

          {/* Category filter */}
          <div className="px-4 pt-3">
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className={`btn btn-sm ${
                  category === "all"
                    ? "btn-primary"
                    : "btn-light"
                }`}
                onClick={() => setCategory("all")}
              >
                {t("attributePicker.all")}
              </button>

              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`btn btn-sm ${
                    category === item
                      ? "btn-primary"
                      : "btn-light"
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {t(`attributeManagement.categories.${AttributeCategory[item]}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div
            className="modal-body px-4"
            style={{
              maxHeight: "55vh",
              overflowY: "auto",
            }}
          >
            {/* Recently used */}
            {!search && category === "all" && (
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h3 className="small fw-bold mb-0">
                    {t("attributePicker.recentlyUsed")}
                  </h3>

                  <span className="text-muted small">
                    {recentlyUsed.length}
                  </span>
                </div>

                <div className="row g-2">
                  {recentlyUsed.map((attribute) => (
                    <div
                      className="col-12 col-md-4"
                      key={attribute.id}
                    >
                      <button
                        type="button"
                        className="w-100 text-start border rounded-3 bg-white p-3"
                        onClick={() =>
                          onSelect(attribute)
                        }
                      >
                        <div className="fw-semibold small">
                          {attribute.name}
                        </div>

                        <div className="text-muted small mt-1">
                          {t(`attributeManagement.categories.${AttributeCategory[attribute.category]}`)}
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All attributes */}
            <div>
              <h3 className="small fw-bold mb-2">
                {search || category !== "all"
                  ? t("attributePicker.matching")
                  : t("attributePicker.allAttributes")}
              </h3>

              {filteredAttributes.length === 0 ? (
                <div className="text-center py-5">
                  <div className="fs-2 mb-2">⌕</div>

                  <p className="fw-semibold mb-1">
                    {t("attributePicker.noAttributes")}
                  </p>

                  <p className="text-muted small mb-0">
                    {t("attributePicker.tryAnother")}
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {filteredAttributes.map((attribute) => (
                    <button
                      type="button"
                      key={attribute.id}
                      className="border rounded-3 bg-white text-start p-3"
                      onClick={() => onSelect(attribute)}
                    >
                      <div className="d-flex justify-content-between align-items-start gap-3">
                        <div>
                          <div className="fw-semibold">
                            {attribute.name}
                          </div>

                          <div className="text-muted small mt-1">
                            {t(`attributeManagement.categories.${AttributeCategory[attribute.category]}`)}
                          </div>

                          {attribute?.description && (
                            <div className="text-muted small mt-2">
                              {attribute.description}
                            </div>
                          )}
                        </div>

                        <span className="badge bg-light text-dark">
                          {t(`attributeManagement.types.${AttributeType[attribute.type]}`)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer px-4">
            <button
              type="button"
              className="btn btn-light"
              onClick={onClose}
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}