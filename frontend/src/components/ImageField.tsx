/*
 * IMAGE FIELD
 */

import { useEffect, useState } from "react";
import ImageIcon from "./ImageIcon";

interface ImageFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function ImageField({ value, onChange }: ImageFieldProps) {
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    /*
     * If the existing value is a URL, we don't have a
     * local file name.
     */
    if (!value.startsWith("data:")) {
      setFileName("");
    }
  }, [value]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
      }
    };

    reader.readAsDataURL(file);
  }

  function handleRemove() {
    onChange("");
    setFileName("");
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
          autoFocus
        />
      </div>

      {fileName && (
        <div className="form-text">
          Selected: <strong>{fileName}</strong>
        </div>
      )}

      {value && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small text-muted">Preview</span>

            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleRemove}
            >
              Remove
            </button>
          </div>

          <div
            className="border rounded-3 p-2 text-center bg-light"
            style={{
              minHeight: "160px",
            }}
          >
            <img
              src={value}
              alt="Selected"
              className="img-fluid rounded-2"
              style={{
                maxHeight: "220px",
                objectFit: "contain",
              }}
            />
          </div>
        </div>
      )}

      <div className="form-text">Select an image from your device.</div>
    </div>
  );
}

export default ImageField;
