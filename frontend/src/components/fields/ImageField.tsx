import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ImageIcon from "../icons/ImageIcon";
import { uploadUserImage } from "../../api/attributeValueApi";
// import { uploadUserImage } from "../../api/userApi";

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function ImageField({ value, onChange }: ImageFieldProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFileName("");
  }, [value]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(t("imageField.invalidType"));
      return;
    }

    setError("");
    setFileName(file.name);
    setUploading(true);

    try {
      const imageUrl = await uploadUserImage(file);

      onChange(imageUrl);
    } catch {
      setError(t("imageField.uploadFailed"));
      setFileName("");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function handleRemove() {
    onChange("");
    setFileName("");
    setError("");
  }

  return (
    <div className="value-field">
      <div className="input-group input-group-lg">
        <span className="input-group-text">
          <ImageIcon />
        </span>

        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          autoFocus
        />
      </div>

      {fileName && (
        <div className="form-text">
          {uploading ? (
            t("imageField.uploading")
          ) : (
            <>
              {t("imageField.selected")}: <strong>{fileName}</strong>
            </>
          )}
        </div>
      )}

      {error && <div className="text-danger small mt-2">{error}</div>}

      {value && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted">{t("imageField.preview")}</span>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemove}
              disabled={uploading}
            >
              {t("imageField.remove")}
            </button>
          </div>

          <div
            className="border rounded-3 p-2 text-center bg-light"
            style={{ minHeight: "160px" }}
          >
            <img
              src={value}
              alt={t("imageField.selectedImage")}
              className="img-fluid rounded-2"
              style={{
                maxHeight: "220px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      )}

      <div className="form-text">{t("imageField.selectFromDevice")}</div>
    </div>
  );
}

export default ImageField;
