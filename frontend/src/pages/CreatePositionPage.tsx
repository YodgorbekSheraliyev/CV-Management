import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../components/navbar/NavBar";
import ToastNotification from "../components/notifications/ToastNotification";
import { createPosition } from "../api/positionApi";
import { getAttributes } from "../api/attributeApi";
import type { Attribute } from "../models";
import { useAuth } from "../hooks/auth";
import PositionForm, {
  type PositionFormValues,
} from "../components/PositionForm";

const CreatePositionPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  useEffect(() => {
    loadAttributes();
  }, []);

  const loadAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const result = await getAttributes();
      setAttributes(result ?? []);
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : t("createPositionPage.loadAttributesFailed"),
        type: "danger",
      });
    } finally {
      setLoadingAttributes(false);
    }
  };

  const handleSubmit = async (values: PositionFormValues) => {
    setToast(null);
    setSaving(true);
    try {
      await createPosition(values);
      navigate("/positions");
    } catch (err) {
      setToast({
        message:
          err instanceof Error
            ? err.message
            : t("createPositionPage.createPositionFailed"),
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <NavBar />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
      <div className="container py-4 py-lg-5">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-9">
            <div className="mb-4">
              <button
                type="button"
                className="btn btn-link text-decoration-none px-0 mb-2"
                onClick={() => navigate("/positions")}
              >
                ← {t("createPositionPage.backToPositions")}
              </button>
              <h1 className="h3 fw-bold mb-1">
                {t("createPositionPage.title")}
              </h1>
              <p className="text-muted mb-0">
                {t("createPositionPage.description")}
              </p>
            </div>

            <PositionForm
              attributes={attributes}
              loadingAttributes={loadingAttributes}
              submitLabel={t("createPositionPage.createPosition")}
              submittingLabel={t("createPositionPage.creating")}
              saving={saving}
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
