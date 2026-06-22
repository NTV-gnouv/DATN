import { useEffect, useRef } from 'react';

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({ value, onChange, placeholder = 'Nhập nội dung...' }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = editorRef.current;
    if (!node || node.innerHTML === value) {
      return;
    }
    node.innerHTML = value;
  }, [value]);

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Công cụ định dạng văn bản">
        <select
          className="input rich-text-select"
          defaultValue="p"
          onChange={(event) => {
            const tag = event.target.value;
            if (tag === 'p') {
              exec('formatBlock', 'p');
            } else {
              exec('formatBlock', tag);
            }
            editorRef.current?.focus();
          }}
        >
          <option value="p">Đoạn văn</option>
          <option value="h1">Tiêu đề 1</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
        </select>
        <select
          className="input rich-text-select"
          defaultValue="3"
          onChange={(event) => {
            exec('fontSize', event.target.value);
            editorRef.current?.focus();
          }}
        >
          <option value="2">Nhỏ</option>
          <option value="3">Vừa</option>
          <option value="4">Lớn</option>
          <option value="5">Rất lớn</option>
        </select>
        <input
          type="color"
          className="rich-text-color"
          defaultValue="#111111"
          title="Màu chữ"
          onChange={(event) => {
            exec('foreColor', event.target.value);
            editorRef.current?.focus();
          }}
        />
        <button type="button" className="rich-text-btn" onClick={() => exec('bold')} title="In đậm">
          <strong>B</strong>
        </button>
        <button type="button" className="rich-text-btn" onClick={() => exec('italic')} title="In nghiêng">
          <em>I</em>
        </button>
        <button type="button" className="rich-text-btn" onClick={() => exec('underline')} title="Gạch chân">
          <span style={{ textDecoration: 'underline' }}>U</span>
        </button>
        <button type="button" className="rich-text-btn" onClick={() => exec('justifyLeft')} title="Căn trái">
          ≡
        </button>
        <button type="button" className="rich-text-btn" onClick={() => exec('justifyCenter')} title="Căn giữa">
          ≡
        </button>
        <button type="button" className="rich-text-btn" onClick={() => exec('justifyRight')} title="Căn phải">
          ≡
        </button>
        <button type="button" className="rich-text-btn" onClick={() => exec('insertUnorderedList')} title="Danh sách">
          •
        </button>
        <button
          type="button"
          className="rich-text-btn"
          onClick={() => {
            const url = window.prompt('Nhập URL liên kết');
            if (url) {
              exec('createLink', url);
            }
          }}
          title="Chèn liên kết"
        >
          🔗
        </button>
      </div>
      <div
        ref={editorRef}
        className="rich-text-surface input"
        contentEditable
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
        onBlur={() => onChange(editorRef.current?.innerHTML ?? '')}
        suppressContentEditableWarning
      />
    </div>
  );
}
