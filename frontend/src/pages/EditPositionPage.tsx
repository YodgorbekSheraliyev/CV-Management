import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/navbar/NavBar";
import PositionForm, { type PositionFormValues } from "../components/PositionForm";
import { getPositionById, updatePosition } from "../api/positionApi";
import { getAttributes } from "../api/attributeApi";
import type { Attribute, Position } from "../models";
import { useAuth } from "../hooks/auth";

function toFormValues(position: Position): PositionFormValues {
  return {
    title: position.title,
    description: position.description,
    attributeIds: position.attributes.map((a) => a.id),
    accessRules: position.positionAccessRules.map((rule) => ({
      attributeId: rule.attributeId,
      comparisonType: rule.comparisonType,
      value: rule.value,
    })),
    // Position.tags on the model is Tag[] ({id, name}) — the form only tracks ids.
    tagIds: (position.tags ?? []).map((t) => t.id),
    isPublic: position.isPublic,
    maxProjects: position.maxProjects,
  };
}

const EditPositionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {user} = useAuth();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(true);

  const [initialValues, setInitialValues] = useState<PositionFormValues | undefined>(undefined);
  const [positionTitle, setPositionTitle] = useState("");
  const [loadingPosition, setLoadingPosition] = useState(true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAttributes()
      .then((result) => setAttributes(result ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load attributes."))
      .finally(() => setLoadingAttributes(false));
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoadingPosition(true);
    getPositionById(Number(id), user!.id)
      .then((position) => {
        if (!position) throw new Error("Position not found.");
        setInitialValues(toFormValues(position));
        setPositionTitle(position.title);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Couldn't load this position."))
      .finally(() => setLoadingPosition(false));
  }, [id]);

  const handleSubmit = async (values: PositionFormValues) => {
    if (!id) return;
    setError(null);
    setSaving(true);
    try {
      await updatePosition(values, user!.id);
      navigate(`/positions/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update position.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="container py-4 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-9">
            <div className="mb-4">
              <button
                type="button"
                className="btn btn-link text-decoration-none px-0 mb-2"
                onClick={() => navigate(id ? `/positions/${id}` : "/positions")}
              >
                ← Back to position
              </button>
              <h1 className="h3 fw-bold mb-1">Edit Position</h1>
              <p className="text-muted mb-0">
                {positionTitle ? `Editing "${positionTitle}"` : "Update this position's details, access rules, and CV attributes."}
              </p>
            </div>

            {loadingPosition ? (
              <div className="text-center text-muted py-5">Loading position…</div>
            ) : !initialValues ? (
              <div className="alert alert-danger">{error ?? "Position not found."}</div>
            ) : (
              <PositionForm
                attributes={attributes}
                loadingAttributes={loadingAttributes}
                initialValues={initialValues}
                submitLabel="Save changes"
                submittingLabel="Saving…"
                saving={saving}
                error={error}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/positions/${id}`)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPositionPage;