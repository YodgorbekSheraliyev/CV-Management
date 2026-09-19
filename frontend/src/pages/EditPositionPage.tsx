import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NavBar from "../components/navbar/NavBar";
import ToastNotification from "../components/notifications/ToastNotification";
import PositionForm, {
  type PositionFormValues,
} from "../components/PositionForm";
import { getPositionById, updatePosition } from "../api/positionApi";
import { getAttributes } from "../api/attributeApi";
import type { Attribute, Position } from "../models";
import { useAuth } from "../hooks/auth";

function toFormValues(position: Position): PositionFormValues {
  return {
    id: position.id,
    title: position.title,
    description: position.description,
    attributeIds: position.attributes.map((a) => a.id),
    accessRules: position.positionAccessRules.map((rule) => ({
      attributeId: rule.attributeId,
      comparisonType: rule.comparisonType,
      value: rule.value,
    })),
    tagIds: (position.tags ?? []).map((t) => t.id),
    isPublic: position.isPublic,
    maxProjects: position.maxProjects ?? 0,
  };
}

const EditPositionPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loadingAttributes, setLoadingAttributes] = useState(true);

  const [initialValues, setInitialValues] = useState<
    PositionFormValues | undefined
  >(undefined);
  const [positionTitle, setPositionTitle] = useState("");
  const [loadingPosition, setLoadingPosition] = useState(true);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  useEffect(() => {
    loadAttributes();
  }, []);

  useEffect(() => {
    loadPosition();
  }, [id]);

  const loadPosition = async () => {
    if (!id || !user) return;

    setLoadingPosition(true);
    try {
      const position = await getPositionById(Number(id), user.id);
      setInitialValues(toFormValues(position));
      setPositionTitle(position.title);
    } catch (error: any) {
      setToast({
        message: error.message ?? t("editPositionPage.errors.loadFailed"),
        type: "danger",
      });
    } finally {
      setLoadingPosition(false);
    }
  };

  const loadAttributes = async () => {
    try {
      setLoadingAttributes(true);
      const res = await getAttributes();
      setAttributes(res);
    } catch (error: any) {
      setToast({
        message:
          error.message ?? t("editPositionPage.errors.loadAttributesFailed"),
        type: "danger",
      });
    } finally {
      setLoadingAttributes(false);
    }
  };

  const handleSubmit = async (values: PositionFormValues) => {
    if (!id || !user) return;
    const valuesToUpdate: PositionFormValues = {
      ...values,
      id: Number(id),
    };
    setSaving(true);

    try {
      await updatePosition(valuesToUpdate, user.id);

      navigate(`/positions/${id}`);
    } catch (error: any) {
      setToast({
        message: error.message ?? t("editPositionPage.errors.updateFailed"),
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
                onClick={() => navigate(id ? `/positions/${id}` : "/positions")}
              >
                ← {t("editPositionPage.backToPosition")}
              </button>

              <h1 className="h3 fw-bold mb-1">{t("editPositionPage.title")}</h1>

              <p className="text-muted mb-0">
                {positionTitle
                  ? t("editPositionPage.editing", {
                      title: positionTitle,
                    })
                  : t("editPositionPage.description")}
              </p>
            </div>

            {loadingPosition ? (
              <div className="text-center text-muted py-5">
                {t("editPositionPage.loading")}
              </div>
            ) : !initialValues ? (
              <div className="text-center py-5">
                <p className="text-danger mb-3">
                  {t("editPositionPage.notFound")}
                </p>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate("/positions")}
                >
                  {t("common.back")}
                </button>
              </div>
            ) : (
              <PositionForm
                attributes={attributes}
                loadingAttributes={loadingAttributes}
                initialValues={initialValues}
                submitLabel={t("editPositionPage.saveChanges")}
                submittingLabel={t("editPositionPage.saving")}
                saving={saving}
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/positions/${id}`)}
                onValidationError={(message) =>
                  setToast({
                    message,
                    type: "danger",
                  })
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPositionPage;
