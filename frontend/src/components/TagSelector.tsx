import { useEffect, useRef, useState } from "react";
import { Check, Plus, X } from "lucide-react";

import type { Tag } from "../models";
import { getAllTags as getTags, createTag } from "../api/tagApi";

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

const TagSelector = ({ selectedTagIds, onChange }: TagSelectorProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      const result = await getTags();
      setTags(result);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const selectedTagObjects = tags.filter((tag) =>
    selectedTagIds.includes(tag.id),
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filteredTags = tags.filter((tag) => {
    if (!normalizedSearch) {
      return true;
    }

    return tag.name.toLowerCase().includes(normalizedSearch);
  });

  const exactMatch = tags.some(
    (tag) => tag.name.toLowerCase() === normalizedSearch,
  );

  const toggleTag = (tag: Tag) => {
    if (selectedTagIds.includes(tag.id)) {
      onChange(selectedTagIds.filter((id) => id !== tag.id));
    } else {
      onChange([...selectedTagIds, tag.id]);
    }
  };

  const removeTag = (tagId: number) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

  const handleCreate = async () => {
    const name = search.trim();

    if (!name || exactMatch || creating) {
      return;
    }

    try {
      setCreating(true);

      const newTag = await createTag({ name });

      setTags((current) => [...current, newTag]);

      onChange([...selectedTagIds, newTag.id]);

      setSearch("");
      setOpen(false);
    } catch (error: any) {
      console.error(error.message);
    } finally {
      setCreating(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const exactTag = tags.find(
        (tag) => tag.name.toLowerCase() === normalizedSearch,
      );

      if (exactTag) {
        toggleTag(exactTag);
        setSearch("");
        return;
      }

      if (normalizedSearch) {
        handleCreate();
      }

      return;
    }

    if (event.key === "Backspace" && !search && selectedTagIds.length > 0) {
      removeTag(selectedTagIds[selectedTagIds.length - 1]);
    }

    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="position-relative">
      {/* Selector */}
      <div
        className={`form-control d-flex flex-wrap align-items-center gap-2 ${
          open ? "border-primary shadow-sm" : ""
        }`}
        style={{
          minHeight: "48px",
          padding: "6px 10px",
          cursor: "text",
        }}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {/* Selected tags */}
        {selectedTagObjects.map((tag) => (
          <span
            key={tag.id}
            className="d-inline-flex align-items-center gap-1 bg-light border rounded-2 px-2 py-1"
            style={{
              fontSize: "0.875rem",
              lineHeight: "1.3",
            }}
          >
            <span>{tag.name}</span>

            <button
              type="button"
              className="btn btn-sm p-0 border-0 d-flex align-items-center text-secondary"
              aria-label={`Remove ${tag.name}`}
              onClick={(event) => {
                event.stopPropagation();
                removeTag(tag.id);
              }}
            >
              <X size={14} />
            </button>
          </span>
        ))}

        {/* Search */}
        <input
          ref={inputRef}
          type="text"
          value={search}
          disabled={loading}
          placeholder={
            selectedTagIds.length === 0 ? "Select tags..." : "Add tag..."
          }
          className="border-0 shadow-none flex-grow-1"
          style={{
            outline: "none",
            minWidth: "120px",
            background: "transparent",
          }}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setSearch(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="position-absolute start-0 end-0 bg-white border rounded-3 shadow-sm mt-1 overflow-hidden"
          style={{
            zIndex: 1050,
          }}
        >
          {/* Search result header */}
          <div className="px-3 py-2 border-bottom">
            <small className="text-muted">
              {normalizedSearch ? "Tags" : "Available tags"}
            </small>
          </div>

          {/* Tags */}
          <div
            className="py-1"
            style={{
              maxHeight: "240px",
              overflowY: "auto",
            }}
          >
            {filteredTags.length > 0 ? (
              filteredTags.map((tag) => {
                const selected = selectedTagIds.includes(tag.id);

                return (
                  <button
                    key={tag.id}
                    type="button"
                    className={`w-100 border-0 d-flex align-items-center justify-content-between px-3 py-2 text-start ${
                      selected ? "bg-light" : "bg-white"
                    }`}
                    style={{
                      cursor: "pointer",
                    }}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      toggleTag(tag);
                      setSearch("");
                      inputRef.current?.focus();
                    }}
                  >
                    <span>{tag.name}</span>

                    {selected && <Check size={17} className="text-primary" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-muted text-center">
                No tags found
              </div>
            )}
          </div>

          {/* Create new tag */}
          {normalizedSearch && !exactMatch && (
            <button
              type="button"
              className="w-100 border-0 border-top bg-white d-flex align-items-center gap-2 px-3 py-3 text-primary text-start"
              disabled={creating}
              onMouseDown={(event) => event.preventDefault()}
              onClick={handleCreate}
            >
              <Plus size={17} />

              <span>
                {creating ? "Creating..." : `Create "${search.trim()}"`}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TagSelector;
