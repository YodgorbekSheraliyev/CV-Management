import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AttributeCategory, AttributeType, UserRole } from "../enums/enums";
import type { Attribute } from "../models";

import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../api/attributeApi";

import NavBar from "../components/navbar/NavBar";
import { useAuth } from "../hooks/auth";
import ToastNotification from "../components/notifications/ToastNotification";

interface AttributeForm {
  name: string;
  category: AttributeCategory;
  type: AttributeType;
  description: string;
  options: string[];
}

const emptyForm: AttributeForm = {
  name: "",
  category: AttributeCategory.TechnicalSkills,
  type: AttributeType.String,
  description: "",
  options: [],
};

export default function AttributeManagement() {
  const { t } = useTranslation();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [form, setForm] = useState<AttributeForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AttributeType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<
    AttributeCategory | "all"
  >("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTargets, setDeleteTargets] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    loadAttributes();
  }, []);

  if (user?.role === UserRole.Candidate) {
    return <Navigate to="/" />;
  }

  async function loadAttributes() {
    try {
      setLoading(true);

      const data = await getAttributes();
      setAttributes(data);
    } catch (err: any) {
      setToast({
        message: err.message,
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  const attributeTypes = useMemo(
    () => [
      {
        type: AttributeType.String,
        label: t("attributeManagement.types.String"),
      },
      {
        type: AttributeType.Text,
        label: t("attributeManagement.types.Text"),
      },
      {
        type: AttributeType.Image,
        label: t("attributeManagement.types.Image"),
      },
      {
        type: AttributeType.Numeric,
        label: t("attributeManagement.types.Numeric"),
      },
      {
        type: AttributeType.Date,
        label: t("attributeManagement.types.Date"),
      },
      {
        type: AttributeType.Period,
        label: t("attributeManagement.types.Period"),
      },
      {
        type: AttributeType.Boolean,
        label: t("attributeManagement.types.Boolean"),
      },
      {
        type: AttributeType.Dropdown,
        label: t("attributeManagement.types.Dropdown"),
      },
    ],
    [t],
  );

  const attributeCategories = useMemo(
    () =>
      Object.values(AttributeCategory)
        .filter((value) => typeof value === "number")
        .map((category) => ({
          category: category as AttributeCategory,
          label: t(
            `attributeManagement.categories.${AttributeCategory[category as number]}`,
          ),
        })),
    [t],
  );

  const getTypeLabel = (type: AttributeType) =>
    t(`attributeManagement.types.${AttributeType[type]}`, {
      defaultValue: String(type),
    });

  const getCategoryLabel = (category: AttributeCategory) =>
    t(`attributeManagement.categories.${AttributeCategory[category]}`, {
      defaultValue: String(category),
    });

  const filteredAttributes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attributes.filter((attribute) => {
      const typeLabel = getTypeLabel(attribute.type);
      const categoryLabel = getCategoryLabel(attribute.category);

      const matchesSearch =
        !query ||
        attribute.name.toLowerCase().includes(query) ||
        (attribute.description ?? "").toLowerCase().includes(query) ||
        typeLabel.toLowerCase().includes(query) ||
        categoryLabel.toLowerCase().includes(query);

      const matchesType = typeFilter === "all" || attribute.type === typeFilter;

      const matchesCategory =
        categoryFilter === "all" || attribute.category === categoryFilter;

      return matchesSearch && matchesType && matchesCategory;
    });
  }, [attributes, search, typeFilter, categoryFilter, t]);

  const selectedAttributes = useMemo(
    () => attributes.filter((attribute) => selectedIds.includes(attribute.id)),
    [attributes, selectedIds],
  );

  const selectedAttribute =
    selectedAttributes.length === 1 ? selectedAttributes[0] : null;

  const allFilteredSelected =
    filteredAttributes.length > 0 &&
    filteredAttributes.every((attribute) => selectedIds.includes(attribute.id));

  function toggleSelection(id: number) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function toggleSelectAll() {
    if (allFilteredSelected) {
      const filteredIds = new Set(
        filteredAttributes.map((attribute) => attribute.id),
      );

      setSelectedIds((current) => current.filter((id) => !filteredIds.has(id)));

      return;
    }

    setSelectedIds((current) => [
      ...new Set([
        ...current,
        ...filteredAttributes.map((attribute) => attribute.id),
      ]),
    ]);
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  function openCreateModal() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(attribute: Attribute) {
    setEditingId(attribute.id);

    setForm({
      name: attribute.name,
      category: attribute.category,
      type: attribute.type,
      description: attribute.description ?? "",
      options: attribute.options ? [...attribute.options] : [],
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function handleTypeChange(type: AttributeType) {
    setForm((current) => ({
      ...current,
      type,
      options: type === AttributeType.Dropdown ? current.options : [],
    }));
  }

  function addOption() {
    setForm((current) => ({
      ...current,
      options: [...current.options, ""],
    }));
  }

  function updateOption(index: number, value: string) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }));
  }

  function removeOption(index: number) {
    setForm((current) => ({
      ...current,
      options: current.options.filter(
        (_, optionIndex) => optionIndex !== index,
      ),
    }));
  }

  async function handleSave() {
    const name = form.name.trim();

    if (!name) {
      setToast({
        message: t("attributeManagement.errors.nameRequired"),
        type: "danger",
      });
      return;
    }

    const options =
      form.type === AttributeType.Dropdown
        ? form.options.map((option) => option.trim()).filter(Boolean)
        : [];

    if (form.type === AttributeType.Dropdown && options.length === 0) {
      setToast({
        message: t("attributeManagement.errors.dropdownOptionsRequired"),
        type: "danger",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingId === null) {
        const payload: Omit<Attribute, "id" | "isBuiltIn"> = {
          name,
          category: form.category,
          type: form.type,
          description: form.description.trim() || undefined,
          options,
        };
        const created = await createAttribute(payload);
        setAttributes((current) => [...current, created]);
        setToast({
          message: t("attributeManagement.success.created"),
          type: "success",
        });
      } else {
        const payload: Omit<Attribute, "isBuiltIn"> = {
          id: editingId,
          name,
          category: form.category,
          type: form.type,
          description: form.description.trim() || undefined,
          options,
        };

        const updated = await updateAttribute(payload);
        setAttributes((current) =>
          current.map((attribute) =>
            attribute.id === editingId ? updated : attribute,
          ),
        );

        setToast({
          message: t("attributeManagement.success.updated"),
          type: "success",
        });
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
      clearSelection();
    } catch {
      setToast({
        message: t("attributeManagement.errors.saveFailed"),
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  }

  function openDeleteModal() {
    if (selectedAttributes.length === 0) return;

    setDeleteTargets(selectedAttributes);
  }

  async function handleDelete() {
    if (deleteTargets.length === 0) return;

    try {
      setDeleting(true);

      await Promise.all(
        deleteTargets.map((attribute) => deleteAttribute({ id: attribute.id })),
      );

      const deletedIds = new Set(
        deleteTargets.map((attribute) => attribute.id),
      );

      setAttributes((current) =>
        current.filter((attribute) => !deletedIds.has(attribute.id)),
      );

      if (deleteTargets.length === 1) {
        setToast({
          message: t("attributeManagement.success.deletedSingle", {
            name: deleteTargets[0].name,
          }),
          type: "success",
        });
      } else {
        setToast({
          message: t("attributeManagement.success.deletedMultiple", {
            count: deleteTargets.length,
          }),
          type: "success",
        });
      }

      setSelectedIds([]);
      setDeleteTargets([]);
    } catch {
      setToast({
        message: t("attributeManagement.errors.deleteFailed"),
        type: "danger",
      });
    } finally {
      setDeleting(false);
    }
  }

  const typeCount = new Set(attributes.map((attribute) => attribute.type)).size;

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />

      <div className="container-fluid py-4 px-3 px-lg-4 container py-4 py-md-5">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center bg-primary-subtle text-primary flex-shrink-0"
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                }}
              >
                <i className="bi bi-sliders2" />
              </div>

              <h3 className="fw-semibold mb-0">
                {t("attributeManagement.title")}
              </h3>
            </div>

            <p className="text-muted mb-0 mt-2">
              {t("attributeManagement.description")}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary px-4 d-flex align-items-center justify-content-center gap-2"
            onClick={openCreateModal}
          >
            <i className="bi bi-plus-lg" />
            {t("attributeManagement.addAttribute")}
          </button>
        </div>

        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        {/* Statistics */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-primary-subtle text-primary d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "11px",
                    }}
                  >
                    <i className="bi bi-grid-3x3-gap" />
                  </div>

                  <div>
                    <div className="small text-muted">
                      {t("attributeManagement.statistics.totalAttributes")}
                    </div>

                    <div className="fs-4 fw-semibold">{attributes.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="bg-success-subtle text-success d-flex align-items-center justify-content-center"
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "11px",
                    }}
                  >
                    <i className="bi bi-tags" />
                  </div>

                  <div>
                    <div className="small text-muted">
                      {t("attributeManagement.statistics.attributeTypes")}
                    </div>

                    <div className="fs-4 fw-semibold">{typeCount}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="card border-0 shadow-sm">
          {/* Search + Filter */}
          <div className="card-header bg-white border-0 p-3">
            <div className="d-flex flex-column flex-md-row gap-2">
              <div className="position-relative flex-grow-1">
                <i
                  className="bi bi-search position-absolute text-muted"
                  style={{
                    left: "14px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />

                <input
                  type="search"
                  className="form-control bg-light ps-5"
                  placeholder={t(
                    "attributeManagement.filters.searchPlaceholder",
                  )}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ maxWidth: "180px" }}
                value={categoryFilter}
                onChange={(event) => {
                  const value = event.target.value;

                  setCategoryFilter(
                    value === "all"
                      ? "all"
                      : (Number(value) as AttributeCategory),
                  );
                }}
              >
                <option value="all">
                  {t("attributeManagement.filters.allCategories")}
                </option>

                {attributeCategories.map(({ category, label }) => (
                  <option key={category} value={category}>
                    {label}
                  </option>
                ))}
              </select>

              <select
                className="form-select"
                style={{ maxWidth: "180px" }}
                value={typeFilter}
                onChange={(event) => {
                  const value = event.target.value;

                  setTypeFilter(
                    value === "all" ? "all" : (Number(value) as AttributeType),
                  );
                }}
              >
                <option value="all">
                  {t("attributeManagement.filters.allTypes")}
                </option>

                {attributeTypes.map(({ type, label }) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Toolbar */}
          {selectedIds.length > 0 && (
            <div className="border-top border-bottom bg-primary-subtle">
              <div className="px-3 px-md-4 py-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="small fw-semibold text-primary">
                    {t("attributeManagement.selection.selected", {
                      count: selectedIds.length,
                    })}
                  </span>

                  <div className="vr mx-1" />

                  {selectedIds.length === 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary bg-white"
                      onClick={() => {
                        if (selectedAttribute) {
                          openEditModal(selectedAttribute);
                        }
                      }}
                    >
                      <i className="bi bi-pencil me-1" />
                      {t("attributeManagement.selection.edit")}
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger bg-white"
                    onClick={openDeleteModal}
                  >
                    <i className="bi bi-trash me-1" />

                    {t("attributeManagement.selection.delete")}

                    {selectedIds.length > 1 && ` (${selectedIds.length})`}
                  </button>

                  {selectedIds.length > 1 && (
                    <span className="small text-muted">
                      {t("attributeManagement.selection.selectOneToEdit")}
                    </span>
                  )}

                  <button
                    type="button"
                    className="btn btn-sm btn-link text-muted text-decoration-none ms-auto"
                    onClick={clearSelection}
                  >
                    {t("attributeManagement.selection.clear")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List Header */}
          <div className="px-3 px-md-4 py-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1 fw-semibold">
                  {t("attributeManagement.list.allAttributes")}
                </h5>

                <div className="small text-muted">
                  {filteredAttributes.length}{" "}
                  {filteredAttributes.length === 1
                    ? t("attributeManagement.list.attribute")
                    : t("attributeManagement.list.attributes")}
                </div>
              </div>

              {selectedIds.length === 0 && filteredAttributes.length > 0 && (
                <small className="text-muted">
                  {t("attributeManagement.selection.selectAttributeForActions")}
                </small>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="card-body p-0">
            {loading ? (
              <div className="p-5 text-center">
                <div
                  className="spinner-border text-primary mb-3"
                  role="status"
                />

                <div className="text-muted">
                  {t("attributeManagement.loading")}
                </div>
              </div>
            ) : filteredAttributes.length === 0 ? (
              <div className="text-center py-5 px-4">
                <div
                  className="d-flex align-items-center justify-content-center mx-auto mb-3 bg-light text-muted"
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "18px",
                  }}
                >
                  <i className="bi bi-search fs-4" />
                </div>

                <h5 className="fw-semibold">
                  {search || typeFilter !== "all" || categoryFilter !== "all"
                    ? t("attributeManagement.list.noAttributesFound")
                    : t("attributeManagement.list.noAttributesYet")}
                </h5>

                <p className="text-muted mb-3">
                  {search || typeFilter !== "all" || categoryFilter !== "all"
                    ? t("attributeManagement.list.tryChangingSearchOrFilter")
                    : t("attributeManagement.list.createFirstAttribute")}
                </p>

                {!search &&
                  typeFilter === "all" &&
                  categoryFilter === "all" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={openCreateModal}
                    >
                      <i className="bi bi-plus-lg me-2" />
                      {t("attributeManagement.list.createAttribute")}
                    </button>
                  )}
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {/* Select all */}
                <div className="list-group-item bg-light px-3 px-md-4 py-2">
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="checkbox"
                      className="form-check-input mt-0"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      aria-label={t("attributeManagement.selection.selectAll")}
                    />

                    <small className="text-muted">
                      {allFilteredSelected
                        ? t("attributeManagement.selection.allSelected")
                        : t("attributeManagement.selection.selectAll")}
                    </small>
                  </div>
                </div>

                {/* Rows */}
                {filteredAttributes.map((attribute) => {
                  const selected = selectedIds.includes(attribute.id);

                  return (
                    <div
                      key={attribute.id}
                      className={`list-group-item px-3 px-md-4 py-3 ${
                        selected ? "bg-primary-subtle" : ""
                      }`}
                      onClick={() => toggleSelection(attribute.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="flex-shrink-0"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selected}
                            onChange={() => toggleSelection(attribute.id)}
                            aria-label={t(
                              "attributeManagement.selection.selectAttribute",
                              {
                                name: attribute.name,
                              },
                            )}
                          />
                        </div>

                        <div
                          className={`d-flex align-items-center justify-content-center flex-shrink-0 ${
                            selected
                              ? "bg-primary text-white"
                              : "bg-primary-subtle text-primary"
                          }`}
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "11px",
                          }}
                        >
                          <i className="bi bi-sliders" />
                        </div>

                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex align-items-center gap-2 flex-wrap">
                            <h6 className="mb-0 fw-semibold">
                              {attribute.name}
                            </h6>

                            <span
                              className="badge rounded-pill"
                              style={{
                                backgroundColor: "#f1f3f5",
                                color: "#495057",
                                fontWeight: 500,
                              }}
                            >
                              {getTypeLabel(attribute.type)}
                            </span>

                            <span
                              className="badge rounded-pill"
                              style={{
                                backgroundColor: "#eef1ff",
                                color: "#495057",
                                fontWeight: 500,
                              }}
                            >
                              {getCategoryLabel(attribute.category)}
                            </span>
                          </div>

                          <div className="small text-muted mt-1 text-truncate">
                            {attribute.description ||
                              t("attributeManagement.list.noDescription")}
                          </div>
                        </div>

                        <div className="d-none d-md-block flex-shrink-0 text-end">
                          <div className="small text-muted">
                            {t("attributeManagement.list.id")}
                          </div>

                          <div className="small fw-medium">{attribute.id}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && filteredAttributes.length > 0 && (
            <div className="card-footer bg-white border-top px-3 px-md-4 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  {t("attributeManagement.list.showing")}{" "}
                  <strong>{filteredAttributes.length}</strong>{" "}
                  {t("attributeManagement.list.of")}{" "}
                  <strong>{attributes.length}</strong>{" "}
                  {t("attributeManagement.list.attributes")}
                </small>

                {selectedIds.length > 0 && (
                  <small className="text-muted">
                    {t("attributeManagement.selection.selected", {
                      count: selectedIds.length,
                    })}
                  </small>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Create / Edit Modal */}
        {showModal && (
          <>
            <div
              className="modal d-block"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.45)",
              }}
            >
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-header border-0 px-4 pt-4">
                    <div>
                      <h5 className="modal-title fw-semibold">
                        {editingId === null
                          ? t("attributeManagement.modal.createTitle")
                          : t("attributeManagement.modal.editTitle")}
                      </h5>

                      <p className="text-muted small mb-0 mt-1">
                        {editingId === null
                          ? t("attributeManagement.modal.createDescription")
                          : t("attributeManagement.modal.editDescription")}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeModal}
                      disabled={saving}
                    />
                  </div>

                  <div className="modal-body px-4">
                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        {t("attributeManagement.modal.name")}
                      </label>

                      <input
                        type="text"
                        className="form-control"
                        placeholder={t(
                          "attributeManagement.modal.namePlaceholder",
                        )}
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        autoFocus
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        {t("attributeManagement.modal.category")}
                      </label>

                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            category: Number(
                              event.target.value,
                            ) as AttributeCategory,
                          }))
                        }
                      >
                        {attributeCategories.map(({ category, label }) => (
                          <option key={category} value={category}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-medium">
                        {t("attributeManagement.modal.type")}
                      </label>

                      <div className="dropdown">
                        <button
                          type="button"
                          className="btn btn-outline-primary text-black w-100 text-start dropdown-toggle"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          {getTypeLabel(form.type)}
                        </button>

                        <ul className="dropdown-menu w-100">
                          {attributeTypes.map(({ type, label }) => (
                            <li key={type}>
                              <button
                                type="button"
                                className={`dropdown-item ${
                                  form.type === type ? "active" : ""
                                }`}
                                onClick={() => handleTypeChange(type)}
                              >
                                {label}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {form.type === AttributeType.Dropdown && (
                      <div className="mb-3">
                        <label className="form-label fw-medium">
                          {t("attributeManagement.modal.options")}
                        </label>

                        {form.options.map((option, index) => (
                          <div key={index} className="d-flex gap-2 mb-2">
                            <input
                              type="text"
                              className="form-control"
                              placeholder={t(
                                "attributeManagement.modal.optionPlaceholder",
                                {
                                  number: index + 1,
                                },
                              )}
                              value={option}
                              onChange={(event) =>
                                updateOption(index, event.target.value)
                              }
                            />

                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => removeOption(index)}
                            >
                              <i className="bi bi-trash" />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={addOption}
                        >
                          <i className="bi bi-plus-lg me-1" />
                          {t("attributeManagement.modal.addOption")}
                        </button>
                      </div>
                    )}

                    <div className="mb-2">
                      <label className="form-label fw-medium">
                        {t("attributeManagement.modal.description")}{" "}
                        <span className="text-muted fw-normal">
                          ({t("attributeManagement.modal.optional")})
                        </span>
                      </label>

                      <textarea
                        className="form-control"
                        rows={3}
                        placeholder={t(
                          "attributeManagement.modal.descriptionPlaceholder",
                        )}
                        value={form.description}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="modal-footer border-0 px-4 pb-4">
                    <button
                      type="button"
                      className="btn btn-light px-4"
                      onClick={closeModal}
                      disabled={saving}
                    >
                      {t("attributeManagement.modal.cancel")}
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          {t("attributeManagement.modal.saving")}
                        </>
                      ) : editingId === null ? (
                        <>
                          <i className="bi bi-plus-lg me-2" />
                          {t("attributeManagement.modal.create")}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2" />
                          {t("attributeManagement.modal.saveChanges")}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-backdrop fade show" />
          </>
        )}

        {/* Delete Modal */}
        {deleteTargets.length > 0 && (
          <>
            <div
              className="modal d-block"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.45)",
              }}
            >
              <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow-lg">
                  <div className="modal-body text-center p-4">
                    <div
                      className="d-flex align-items-center justify-content-center mx-auto mb-3 bg-danger-subtle text-danger"
                      style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "16px",
                      }}
                    >
                      <i className="bi bi-trash fs-5" />
                    </div>

                    <h5 className="fw-semibold">
                      {deleteTargets.length === 1
                        ? t("attributeManagement.deleteModal.singleTitle")
                        : t("attributeManagement.deleteModal.multipleTitle", {
                            count: deleteTargets.length,
                          })}
                    </h5>

                    <p className="text-muted small mb-3">
                      {deleteTargets.length === 1
                        ? t("attributeManagement.deleteModal.singleDescription")
                        : t(
                            "attributeManagement.deleteModal.multipleDescription",
                          )}
                    </p>

                    <div
                      className="bg-light rounded-3 p-3 mb-4 text-start"
                      style={
                        deleteTargets.length > 3
                          ? {
                              maxHeight: "220px",
                              overflowY: "auto",
                            }
                          : undefined
                      }
                    >
                      {deleteTargets.map((attribute) => (
                        <div
                          key={attribute.id}
                          className="d-flex justify-content-between align-items-center gap-2 py-1"
                        >
                          <div className="min-w-0">
                            <div className="fw-semibold text-truncate">
                              {attribute.name}
                            </div>

                            <div className="small text-muted mt-1">
                              {getTypeLabel(attribute.type)}
                            </div>
                          </div>

                          <span className="small text-muted flex-shrink-0">
                            #{attribute.id}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-light flex-grow-1"
                        onClick={() => setDeleteTargets([])}
                        disabled={deleting}
                      >
                        {t("attributeManagement.deleteModal.cancel")}
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger flex-grow-1"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            {t("attributeManagement.deleteModal.deleting")}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-trash me-1" />

                            {deleteTargets.length === 1
                              ? t("attributeManagement.deleteModal.delete")
                              : t(
                                  "attributeManagement.deleteModal.deleteMultiple",
                                  {
                                    count: deleteTargets.length,
                                  },
                                )}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-backdrop fade show" />
          </>
        )}
      </div>
    </div>
  );
}
