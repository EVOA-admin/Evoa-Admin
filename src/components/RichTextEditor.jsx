import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import Placeholder from '@tiptap/extension-placeholder';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CharacterCount from '@tiptap/extension-character-count';
import { useEffect, useCallback, useState } from 'react';

/* ─── Small icon buttons ─── */
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={e => { e.preventDefault(); onClick(); }}
      className={`rte-btn${active ? ' rte-btn-active' : ''}${disabled ? ' rte-btn-disabled' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="rte-divider" />;
}

export default function RichTextEditor({ value, onChange, placeholder = 'Write the blog content here…' }) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imgUrl, setImgUrl] = useState('');
  const [showImgInput, setShowImgInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
      Color,
      TextStyle,
      Highlight.configure({ multicolor: true }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },

    editorProps: {
      /**
       * transformPastedHTML runs on the raw clipboard HTML before ProseMirror
       * parses it. We strip vendor-specific garbage while keeping all the
       * semantic elements (headings, bold, italic, tables, links …).
       */
      transformPastedHTML(html) {
        return html
          /* 1. Word conditional comments <!--[if …]>…<![endif]--> */
          .replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, '')
          /* 2. Generic HTML comments */
          .replace(/<!--[\s\S]*?-->/g, '')
          /* 3. Office XML elements  <o:p>, <w:sdt>, <m:oMath> … */
          .replace(/<\/?(?:o|w|m|v|x):[^>]*>/gi, '')
          /* 4. Google Docs guid wrapper span */
          .replace(/<span[^>]*id="docs-internal-guid[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '$1')
          /* 5. mso-* style declarations (keep other inline styles) */
          .replace(/\s*mso-[^:;'"]+:[^;'"]+;?/gi, '')
          /* 6. Stray XML namespace attributes */
          .replace(/\s+xmlns[^=]*="[^"]*"/gi, '')
          /* 7. Empty style="", class="" attributes left after cleanup */
          .replace(/\s+style=""/gi, '')
          .replace(/\s+class=""/gi, '');
      },

      /**
       * Normalise plain text paste: collapse excessive blank lines so you
       * don't get ten empty paragraphs when pasting from a plain-text email.
       */
      transformPastedText(text) {
        return text.replace(/\n{3,}/g, '\n\n');
      },
    },
  });


  /* Sync external value changes (e.g. on edit load) */
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href: url }).run();
    }
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const insertImage = useCallback(() => {
    if (!editor || !imgUrl.trim()) return;
    editor.chain().focus().setImage({ src: imgUrl.trim() }).run();
    setImgUrl('');
    setShowImgInput(false);
  }, [editor, imgUrl]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) return null;

  const chars = editor.storage.characterCount.characters();
  const words = editor.storage.characterCount.words();

  return (
    <div className="rte-wrapper">
      {/* ── Toolbar ── */}
      <div className="rte-toolbar">

        {/* Paragraph / Heading select */}
        <select
          className="rte-select"
          value={
            editor.isActive('heading', { level: 1 }) ? 'h1'
            : editor.isActive('heading', { level: 2 }) ? 'h2'
            : editor.isActive('heading', { level: 3 }) ? 'h3'
            : editor.isActive('heading', { level: 4 }) ? 'h4'
            : 'p'
          }
          onChange={e => {
            const v = e.target.value;
            if (v === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(v[1]) }).run();
          }}
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <Divider />

        {/* Text style */}
        <ToolBtn title="Bold (⌘B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn title="Italic (⌘I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn title="Underline (⌘U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <u>U</u>
        </ToolBtn>
        <ToolBtn title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <s>S</s>
        </ToolBtn>
        <ToolBtn title="Highlight" active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight().run()}>
          ◈
        </ToolBtn>
        <ToolBtn title="Subscript" active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()}>
          X₂
        </ToolBtn>
        <ToolBtn title="Superscript" active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()}>
          X²
        </ToolBtn>

        <Divider />

        {/* Text colour */}
        <label className="rte-color-label" title="Text colour">
          <span className="rte-color-icon">A</span>
          <input
            type="color"
            className="rte-color-input"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
          />
        </label>

        <Divider />

        {/* Alignment */}
        <ToolBtn title="Align left"    active={editor.isActive({ textAlign: 'left' })}    onClick={() => editor.chain().focus().setTextAlign('left').run()}>⬛️◻️◻️</ToolBtn>
        <ToolBtn title="Align center"  active={editor.isActive({ textAlign: 'center' })}  onClick={() => editor.chain().focus().setTextAlign('center').run()}>≡</ToolBtn>
        <ToolBtn title="Align right"   active={editor.isActive({ textAlign: 'right' })}   onClick={() => editor.chain().focus().setTextAlign('right').run()}>▶</ToolBtn>
        <ToolBtn title="Justify"       active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>☰</ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn title="Bullet list"   active={editor.isActive('bulletList')}   onClick={() => editor.chain().focus().toggleBulletList().run()}>• ≡</ToolBtn>
        <ToolBtn title="Ordered list"  active={editor.isActive('orderedList')}  onClick={() => editor.chain().focus().toggleOrderedList().run()}>1≡</ToolBtn>
        <ToolBtn title="Task list"     active={editor.isActive('taskList')}     onClick={() => editor.chain().focus().toggleTaskList().run()}>☑</ToolBtn>

        <Divider />

        {/* Link */}
        <ToolBtn title="Insert / edit link" active={editor.isActive('link')} onClick={() => { setLinkUrl(editor.getAttributes('link').href || ''); setShowLinkInput(v => !v); setShowImgInput(false); }}>
          🔗
        </ToolBtn>

        {/* Image */}
        <ToolBtn title="Insert image" onClick={() => { setShowImgInput(v => !v); setShowLinkInput(false); }}>
          🖼
        </ToolBtn>

        {/* Table */}
        <ToolBtn title="Insert 3×3 table" onClick={insertTable}>⊞</ToolBtn>
        {editor.isActive('table') && (
          <>
            <ToolBtn title="Add column after"  onClick={() => editor.chain().focus().addColumnAfter().run()}>+col</ToolBtn>
            <ToolBtn title="Add row after"     onClick={() => editor.chain().focus().addRowAfter().run()}>+row</ToolBtn>
            <ToolBtn title="Delete column"     onClick={() => editor.chain().focus().deleteColumn().run()}>-col</ToolBtn>
            <ToolBtn title="Delete row"        onClick={() => editor.chain().focus().deleteRow().run()}>-row</ToolBtn>
            <ToolBtn title="Delete table"      onClick={() => editor.chain().focus().deleteTable().run()}>✕tbl</ToolBtn>
          </>
        )}

        <Divider />

        {/* Block elements */}
        <ToolBtn title="Blockquote"    active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo;</ToolBtn>
        <ToolBtn title="Code block"    active={editor.isActive('codeBlock')}  onClick={() => editor.chain().focus().toggleCodeBlock().run()}>&lt;/&gt;</ToolBtn>
        <ToolBtn title="Inline code"   active={editor.isActive('code')}       onClick={() => editor.chain().focus().toggleCode().run()}>`</ToolBtn>
        <ToolBtn title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>─</ToolBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolBtn title="Undo (⌘Z)"  disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>↩</ToolBtn>
        <ToolBtn title="Redo (⌘⇧Z)" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>↪</ToolBtn>
      </div>

      {/* ── Link input popover ── */}
      {showLinkInput && (
        <div className="rte-popover">
          <input
            className="rte-popover-input"
            type="url"
            placeholder="https://example.com"
            value={linkUrl}
            onChange={e => setLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setLink()}
            autoFocus
          />
          <button type="button" className="rte-popover-btn rte-popover-apply" onClick={setLink}>Apply</button>
          {editor.isActive('link') && (
            <button type="button" className="rte-popover-btn rte-popover-remove" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkInput(false); }}>Remove</button>
          )}
          <button type="button" className="rte-popover-btn" onClick={() => setShowLinkInput(false)}>✕</button>
        </div>
      )}

      {/* ── Image URL input popover ── */}
      {showImgInput && (
        <div className="rte-popover">
          <input
            className="rte-popover-input"
            type="url"
            placeholder="https://image-url.com/photo.jpg"
            value={imgUrl}
            onChange={e => setImgUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && insertImage()}
            autoFocus
          />
          <button type="button" className="rte-popover-btn rte-popover-apply" onClick={insertImage}>Insert</button>
          <button type="button" className="rte-popover-btn" onClick={() => setShowImgInput(false)}>✕</button>
        </div>
      )}

      {/* ── Editor area ── */}
      <EditorContent editor={editor} className="rte-content" />

      {/* ── Footer: word / char count ── */}
      <div className="rte-footer">
        {words} words · {chars} characters
      </div>
    </div>
  );
}
