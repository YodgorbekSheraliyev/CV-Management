import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  CreateLink,
  ListsToggle,
  UndoRedo,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";
import { useTranslation } from "react-i18next";

interface MarkdownFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function MarkdownField({ value, onChange }: MarkdownFieldProps) {
  const { t } = useTranslation();

  return (
    <div className="value-field">
      <MDXEditor
        markdown={value}
        onChange={onChange}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),

          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />

                <BoldItalicUnderlineToggles />

                <ListsToggle />

                <CreateLink />
              </>
            ),
          }),
        ]}
        contentEditableClassName="markdown-editor"
      />

      <div className="form-text">{t("markdownField.supportsMarkdown")}</div>
    </div>
  );
}

export default MarkdownField;
