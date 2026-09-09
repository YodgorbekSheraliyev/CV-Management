import { useState } from "react";

interface TagSelectorProps {
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

const TagSelector = ({ selectedIds, onChange }: TagSelectorProps) => {
  const [input, setInput] = useState("");

  const addTemporaryTag = () => {
    const id = Number(input);
    if (!Number.isNaN(id) && id > 0) {
      if (!selectedIds.includes(id)) onChange([...selectedIds, id]);
      setInput("");
    }
  };

  return (
    <div>
      <div className="input-group">
        <input
          type="number"
          className="form-control"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tag ID"
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={addTemporaryTag}
        >
          Add
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          {selectedIds.map((id) => (
            <span
              key={id}
              className="badge rounded-pill text-bg-light border text-dark px-3 py-2"
            >
              Tag #{id}
              <button
                type="button"
                className="btn-close ms-2"
                style={{ fontSize: "0.55rem" }}
                aria-label={`Remove tag ${id}`}
                onClick={() =>
                  onChange(selectedIds.filter((item) => item !== id))
                }
              />
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
