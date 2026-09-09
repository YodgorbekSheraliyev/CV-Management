import { useState } from "react";
import { getAttributeTypeName } from "../utils";
import type { Attribute } from "../models";

interface AttributeSelectorProps {
  attributes: Attribute[];
  selectedIds: number[];
  onToggle: (id: number) => void;
}

const AttributeSelector = ({
  attributes,
  selectedIds,
  onToggle,
}: AttributeSelectorProps) => {
  const [search, setSearch] = useState("");

  const filteredAttributes = attributes.filter((attribute) =>
    attribute.name.toLowerCase().startsWith(search.toLowerCase()),
  );

  return (
    <div>
      <div className="input-group mb-3">
        <i className="bi bi-search input-group-text" />
        <input
          type="search"
          className="form-control"
          placeholder="Search attributes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div
        className="border rounded-3 overflow-auto"
        style={{ maxHeight: 320 }}
      >
        {filteredAttributes.length === 0 ? (
          <div className="text-center text-muted py-4">
            No matching attributes.
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filteredAttributes.map((attribute) => {
              const selected = selectedIds.includes(attribute.id);
              return (
                <label
                  key={attribute.id}
                  className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    className="form-check-input flex-shrink-0"
                    type="checkbox"
                    checked={selected}
                    onChange={() => onToggle(attribute.id)}
                  />
                  <div className="flex-grow-1">
                    <div className="fw-semibold">{attribute.name}</div>
                    <div className="small text-muted">
                      {getAttributeTypeName(attribute.type)}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttributeSelector;
