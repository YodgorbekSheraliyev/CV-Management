import { Link, useNavigate, useParams } from "react-router-dom";
import NavBar from "../components/navbar/NavBar";
import type { Position, Post } from "../models";
import { AttributeType, ComparisonType, UserRole } from "../enums/enums";
import { useAuth } from "../hooks/auth";
import { useEffect, useState } from "react";
import {
  getPositionById,
  deletePosition,
  duplicatePosition,
} from "../api/positionApi";
import { createCv } from "../api/cvApi";
import ToastNotification from "../components/notifications/ToastNotification";
import { useTranslation } from "react-i18next";
import { createPost, getAllPosts } from "../api/postApi";

const OPERATOR_SYMBOLS: Partial<Record<ComparisonType, string>> = {
  [ComparisonType.Equal]: "=",
  [ComparisonType.GreaterThan]: ">",
  [ComparisonType.LessThan]: "<",
  [ComparisonType.GreaterThanOrEqual]: "≥",
  [ComparisonType.LessThanOrEqual]: "≤",
};

const DISCUSSION_PAGE_SIZE = 5;

const PositionPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isRecruiterOrAdmin =
    user?.role === UserRole.Recruiter || user?.role === UserRole.Administrator;
  const isCandidate = user?.role === UserRole.Candidate;

  const [position, setPosition] = useState<Position | null>(null);
  const [post, setPost] = useState<string>("");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [duplicating, setDuplicating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [posting, setPosting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(DISCUSSION_PAGE_SIZE);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "danger";
  } | null>(null);

  useEffect(() => {
    if (!id) return;
    loadPosition(+id);
    loadPosts(+id);
  }, [id]);

  const loadPosition = async (positionId: number) => {
    setLoading(true);

    try {
      const res = await getPositionById(positionId);
      setPosition(res);
    } catch (error: any) {
      setToast({
        message: error.message ?? t("positionPage.positionNotFound"),
        type: "danger",
      });
    }
    setLoading(false);
  };

  const loadPosts = async (positionId: number) => {
    setLoading(true);

    try {
      const res = await getAllPosts(positionId);
      setPosts(res);
    } catch (error: any) {
      setToast({
        message: error.message ?? t("positionPage.postsNotFound"),
        type: "danger",
      });
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!position || !user || deleting) return;

    setDeleting(true);

    try {
      await deletePosition({ id: position.id });
      navigate("/positions");
    } catch (error: any) {
      setShowDeleteConfirm(false);
      setToast({
        message: error.message ?? t("positionPage.deletePosition"),
        type: "danger",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    if (!position || !user || duplicating) return;

    setDuplicating(true);

    try {
      const duplicatedPosition = await duplicatePosition(position.id);

      setToast({
        message: t("positionPage.positionDuplicated"),
        type: "success",
      });

      navigate(`/positions/${duplicatedPosition.id}`);
    } catch (error: any) {
      setToast({
        message: error.message ?? t("positionPage.duplicatePositionError"),
        type: "danger",
      });
    } finally {
      setDuplicating(false);
    }
  };

  const handleApply = async (positionId: number) => {
    if (!user) return;

    try {
      setLoading(true);
      setToast(null);

      await createCv(positionId);

      setToast({
        message: t("positionPage.applySuccess"),
        type: "success",
      });
      await loadPosition(positionId);
    } catch (error: any) {
      setToast({
        message: error.message ?? t("positionPage.applyFailed"),
        type: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitPost = async () => {
    if (!post.trim() || posting || !user) return;
    setPosting(true);
    try {
      await createPost({
        authorId: user?.id,
        authorName: user.firstName,
        content: post.trim(),
        positionId: position?.id!,
      });
      loadPosts(position!.id);
    } catch (error: any) {
      setToast({ message: error.message, type: "danger" });
    } finally {
      setPost("");
      setPosting(false);
    }
  };

  if (loading && !position) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />
        <main className="container py-4 py-md-5">
          <div className="placeholder-glow mb-4">
            <span className="placeholder col-3 mb-3" style={{ height: 14 }} />
          </div>

          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body p-4 p-md-5 placeholder-glow">
              <span className="placeholder col-2 mb-3" style={{ height: 24 }} />

              <span className="placeholder col-6 mb-2" style={{ height: 32 }} />

              <span className="placeholder col-8" style={{ height: 16 }} />
            </div>
          </div>

          <div className="card border-0 shadow-sm placeholder-glow">
            <div className="card-body p-4">
              <span className="placeholder col-4 mb-3" style={{ height: 18 }} />

              <span
                className="placeholder col-12 mb-2"
                style={{ height: 40 }}
              />

              <span className="placeholder col-12" style={{ height: 40 }} />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="min-vh-100 bg-light">
        <NavBar />

        <ToastNotification toast={toast} onClose={() => setToast(null)} />

        <main className="container py-5 text-center">
          <div
            className="rounded-circle bg-danger-subtle text-danger d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: 56, height: 56 }}
          >
            <i className="bi bi-exclamation-triangle fs-4" />
          </div>

          <h1 className="h4 fw-bold mb-2">
            {t("positionPage.positionNotFound")}
          </h1>

          <p className="text-muted mb-4">
            {t("positionPage.positionNotFoundDescription")}
          </p>

          <Link to="/positions" className="btn btn-outline-secondary px-4">
            {t("positionPage.backToPositions")}
          </Link>
        </main>
      </div>
    );
  }

  const accessible = true;
  const cvCount = position.cVsCount;
  const hasMorePosts = posts?.length ?? 0 > visiblePosts;

  return (
    <div className="min-vh-100 bg-light">
      <NavBar />
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <main className="container py-4 py-md-5">
        <nav aria-label={t("common.breadcrumb")} className="mb-4">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/" className="text-decoration-none">
                {t("positionPage.home")}
              </Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/positions" className="text-decoration-none">
                {t("positionPage.positions")}
              </Link>
            </li>
            <li
              className="breadcrumb-item active text-truncate"
              style={{ maxWidth: 320 }}
              aria-current="page"
            >
              {position.title}
            </li>
          </ol>
        </nav>

        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4 p-md-5">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-4">
              <div className="flex-grow-1 min-w-0">
                <span
                  className={`badge rounded-pill px-3 py-2 mb-3 ${
                    position.isPublic ? "text-bg-success" : "text-bg-warning"
                  }`}
                >
                  <i
                    className={`bi ${
                      position.isPublic ? "bi-unlock" : "bi-lock"
                    } me-1`}
                  />
                  {position.isPublic
                    ? t("positionPage.public")
                    : t("positionPage.restricted")}
                </span>

                <h1 className="h2 fw-bold mb-2">{position.title}</h1>

                {isRecruiterOrAdmin && (
                  <div className="text-muted small mb-3">
                    <i className="bi bi-file-earmark-text me-1" />
                    {cvCount}{" "}
                    {t(
                      cvCount === 1
                        ? "positionPage.submittedCv"
                        : "positionPage.submittedCvs",
                    )}
                  </div>
                )}

                <p className="text-muted mb-0" style={{ maxWidth: 640 }}>
                  {position.description}
                </p>
              </div>

              {isRecruiterOrAdmin && (
                <div className="d-flex flex-wrap gap-2 align-content-start flex-shrink-0">
                  <Link
                    to={`/positions/${position.id}/edit`}
                    className="btn btn-outline-secondary px-4"
                  >
                    <i className="bi bi-pencil me-2" />
                    {t("positionPage.edit")}
                  </Link>

                  <button
                    type="button"
                    className="btn btn-outline-primary px-4"
                    onClick={handleDuplicate}
                    disabled={duplicating || deleting}
                  >
                    {duplicating ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                    ) : (
                      <i className="bi bi-copy me-2" />
                    )}
                    {duplicating
                      ? t("positionPage.duplicating")
                      : t("positionPage.duplicate")}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-danger px-4"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting || duplicating}
                  >
                    <i className="bi bi-trash me-2" />
                    {t("positionPage.delete")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="row g-4">
          <div className="col-lg-8">
            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-0">
                <div className="p-4 border-bottom">
                  <h2 className="h5 fw-bold mb-1">
                    {t("positionPage.accessRequirements")}
                  </h2>
                  <p className="text-muted small mb-0">
                    {position.isPublic
                      ? t("positionPage.publicAccessDescription")
                      : t("positionPage.restrictedAccessDescription")}
                  </p>
                </div>

                {position.positionAccessRules.length === 0 ? (
                  <div className="p-4 text-center text-muted small">
                    {t("positionPage.noAccessRules")}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3">
                            {t("positionPage.attribute")}
                          </th>
                          <th className="py-3">{t("positionPage.type")}</th>
                          <th className="py-3">
                            {t("positionPage.requirement")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {position.positionAccessRules.map((rule) => (
                          <tr key={rule.id}>
                            <td className="px-4 py-3">
                              <div className="fw-semibold">
                                {rule.attribute.name}
                              </div>
                            </td>
                            <td>
                              <span className="badge text-bg-light border">
                                {t(`attributeManagement.types.${AttributeType[rule.attribute.type]}`)}
                              </span>
                            </td>
                            <td>
                              <span className="fw-semibold">
                                {OPERATOR_SYMBOLS[rule.comparisonType] ??
                                  rule.comparisonType}{" "}
                                {rule.value}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-0">
                <div className="p-4 border-bottom">
                  <h2 className="h5 fw-bold mb-1">
                    {t("positionPage.attributesIncluded")}
                  </h2>
                  <p className="text-muted small mb-0">
                    {t("positionPage.attributesIncludedDescription")}
                  </p>
                </div>

                {position.attributes.length === 0 ? (
                  <div className="p-4 text-center text-muted small">
                    {t("positionPage.noAttributes")}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="px-4 py-3">
                            {t("positionPage.attribute")}
                          </th>

                          <th className="py-3">{t("positionPage.type")}</th>
                        </tr>
                      </thead>

                      <tbody>
                        {position.attributes.map((attribute) => (
                          <tr key={attribute.id}>
                            <td className="px-4 py-3">
                              <div className="fw-semibold">
                                {attribute.name}
                              </div>
                            </td>

                            <td>
                              <span className="badge text-bg-light border">
                                {t(`attributeManagement.types.${AttributeType[attribute.type]}`)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                  <div>
                    <h2 className="h5 fw-bold mb-1">
                      {t("positionPage.relevantProjects")}
                    </h2>

                    <p className="text-muted small mb-0">
                      {t("positionPage.relevantProjectsDescription")}
                    </p>
                  </div>

                  <span className="badge text-bg-light border flex-shrink-0">
                    {t("positionPage.maxProjects", {
                      count: position.maxProjects,
                    })}
                  </span>
                </div>

                {(position?.tags ?? []).length === 0 ? (
                  <p className="text-muted small mb-0">
                    {t("positionPage.noTechnologies")}
                  </p>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {(position?.tags ?? []).map((tag) => (
                      <span
                        key={tag.id}
                        className="badge rounded-pill text-bg-primary-subtle text-primary border border-primary-subtle px-3 py-2"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="card border-0 shadow-sm">
              <div className="card-body p-0">
                <div className="p-4 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h2 className="h5 fw-bold mb-1">
                        {t("positionPage.discussion")}
                      </h2>

                      <p className="text-muted small mb-0">
                        {t("positionPage.discussionDescription")}
                      </p>
                    </div>

                    <span className="badge text-bg-light border">
                      {posts?.length}{" "}
                      {t(
                        posts?.length === 1
                          ? "positionPage.post"
                          : "positionPage.posts",
                      )}
                    </span>
                  </div>
                </div>

                {posts?.length === 0 ? (
                  <div className="p-4 text-center text-muted small">
                    {t("positionPage.noDiscussion")}
                  </div>
                ) : (
                  <div>
                    {posts?.slice(0, visiblePosts).map((post, index, arr) => (
                      <div
                        key={post.id}
                        className={
                          index !== arr.length - 1 ? "p-4 border-bottom" : "p-4"
                        }
                      >
                        <div className="d-flex gap-3">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-semibold flex-shrink-0"
                            style={{ width: 40, height: 40 }}
                          >
                            {post.authorName
                              .split(" ")
                              .map((name) => name[0])
                              .join("")}
                          </div>

                          <div className="flex-grow-1 min-w-0">
                            <div className="d-flex justify-content-between flex-wrap align-items-center gap-2 mb-1">
                              <span className="fw-semibold d-block">
                                {post.authorName}
                              </span>

                              <span className="text-muted small text-end">
                                {new Date(post?.createdAt).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            <p className="text-muted mb-0">{post.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {hasMorePosts && (
                      <div className="p-3 text-center border-top">
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-decoration-none"
                          onClick={() =>
                            setVisiblePosts((v) => v + DISCUSSION_PAGE_SIZE)
                          }
                        >
                          {t("positionPage.showMorePosts")}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 bg-light border-top">
                  <div className="mb-3">
                    <label
                      htmlFor="discussion"
                      className="form-label fw-semibold"
                    >
                      {t("positionPage.joinDiscussion")}
                    </label>
                    <textarea
                      id="discussion"
                      className="form-control"
                      rows={3}
                      value={post}
                      onChange={(e) => setPost(e.target.value)}
                      placeholder={t("positionPage.writeMessage")}
                    />
                  </div>
                  <div className="d-flex justify-content-end">
                    <button
                      className="btn btn-primary"
                      onClick={submitPost}
                      disabled={!post.trim() || posting}
                    >
                      {posting
                        ? t("positionPage.posting")
                        : t("positionPage.postMessage")}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="col-lg-4">
            {isCandidate && (
              <section
                className="card border-0 shadow-sm mb-4 sticky-lg-top"
                style={{ top: 16 }}
              >
                <div className="card-body p-4">
                  <h2 className="h6 fw-bold mb-3">
                    {t("positionPage.yourAccess")}
                  </h2>
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                      className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                        accessible
                          ? "bg-success-subtle text-success"
                          : "bg-danger-subtle text-danger"
                      }`}
                      style={{ width: 40, height: 40 }}
                    >
                      <i
                        className={`bi ${
                          accessible ? "bi-check-lg" : "bi-x-lg"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="fw-semibold">
                        {accessible
                          ? t("positionPage.youHaveAccess")
                          : t("positionPage.youDontHaveAccess")}
                      </div>
                      <div className="text-muted small">
                        {accessible
                          ? t("positionPage.accessGrantedDescription")
                          : t("positionPage.accessDeniedDescription")}
                      </div>
                    </div>
                  </div>
                  <button
                    disabled={position.hasUserApplied || !accessible}
                    onClick={() => handleApply(position.id)}
                    className="btn btn-primary w-100"
                  >
                    {position.hasUserApplied
                      ? t("positionPage.applied")
                      : t("positionPage.apply")}
                  </button>
                  {!accessible && !position.hasUserApplied && (
                    <p className="text-muted small mt-2 mb-0">
                      {t("positionPage.meetRequirements")}
                    </p>
                  )}
                </div>
              </section>
            )}

            <section className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h2 className="h6 fw-bold mb-3">
                  {t("positionPage.positionInformation")}
                </h2>
                <div className="d-flex flex-column gap-3">
                  <InfoRow
                    label={t("positionPage.visibility")}
                    value={
                      position.isPublic
                        ? t("positionPage.public")
                        : t("positionPage.restricted")
                    }
                  />
                  {isRecruiterOrAdmin && (
                    <InfoRow
                      label={t("positionPage.submittedCvs")}
                      value={String(cvCount)}
                    />
                  )}
                  <InfoRow
                    label={t("positionPage.maxProjectsInCv")}
                    value={String(position.maxProjects)}
                  />
                </div>
              </div>
            </section>

            {isRecruiterOrAdmin && (
              <section className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 44, height: 44 }}
                    >
                      <i className="bi bi-file-earmark-text fs-5" />
                    </div>
                    <div>
                      <h2 className="h6 fw-bold mb-1">
                        {t("positionPage.submittedCvsTitle")}
                      </h2>

                      <p className="text-muted small mb-2">
                        {t(
                          cvCount === 1
                            ? "positionPage.candidatePublished"
                            : "positionPage.candidatesPublished",
                          { count: cvCount },
                        )}
                      </p>
                      <Link
                        to={`/positions/${position.id}/cvs`}
                        className="small fw-semibold text-decoration-none"
                      >
                        {t("positionPage.viewAllCvs")}
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <footer className="border-top bg-white mt-5">
        <div className="container py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
            <span className="text-muted small">
              {t("positionPage.footerCopyright")}
            </span>
            <div className="d-flex gap-3">
              <Link
                to="/positions"
                className="text-muted small text-decoration-none"
              >
                {t("positionPage.footerPositions")}
              </Link>
              <Link
                to="/profile"
                className="text-muted small text-decoration-none"
              >
                {t("positionPage.footerProfile")}
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {showDeleteConfirm && (
        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h2 className="modal-title h5 fw-bold">
                  {t("positionPage.deleteTitle")}
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label={t("common.cancel")}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                />
              </div>
              <div className="modal-body">
                <p className="text-muted mb-0">
                  {t("positionPage.deleteDescription", {
                    title: position.title,
                    submitted:
                      cvCount > 0
                        ? t(
                            cvCount === 1
                              ? "positionPage.deleteSubmittedOne"
                              : "positionPage.deleteSubmittedMany",
                            { count: cvCount },
                          )
                        : "",
                  })}
                </p>
              </div>
              <div className="modal-footer border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  {t("positionPage.cancel")}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting
                    ? t("positionPage.deleting")
                    : t("positionPage.deletePosition")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="d-flex justify-content-between align-items-center gap-3">
      <span className="text-muted small">{label}</span>
      <span className="fw-semibold small text-end">{value}</span>
    </div>
  );
};

export default PositionPage;
