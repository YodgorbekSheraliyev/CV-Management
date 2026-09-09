import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/navbar/NavBar";
import { createPosition } from "../api/positionApi";
import { getAttributes } from "../api/attributeApi";
import type { Attribute } from "../models";
import { useAuth } from "../hooks/auth";
import PositionForm, {
  type PositionFormValues,
} from "../components/PositionForm";

const CreatePositionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const result = await getAttributes();
      setAttributes(result ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load attributes.",
      );
    } finally {
      setLoadingAttributes(false);
    }
  };

  const handleSubmit = async (values: PositionFormValues) => {
    setError(null);
    setSaving(true);
    try {
      await createPosition(values, user!.id);
      navigate("/positions");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create position.",
      );
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
                onClick={() => navigate("/positions")}
              >
                ← Back to positions
              </button>
              <h1 className="h3 fw-bold mb-1">Create Position</h1>
              <p className="text-muted mb-0">
                Create a reusable CV template with access rules, attributes, and
                project filters.
              </p>
            </div>

            <PositionForm
              attributes={attributes}
              loadingAttributes={loadingAttributes}
              submitLabel="Create Position"
              submittingLabel="Creating…"
              saving={saving}
              error={error}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/positions")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePositionPage;
