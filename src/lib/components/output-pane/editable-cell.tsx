import { useEffect, useRef, useState } from 'react';

import { getValueColor } from '@/lib/utils/shared';
import { formatCell } from '@/lib/utils/table-utils';

type EditableCellProps = {
  value: unknown;
  editable: boolean;
  onSave: (newValue: unknown) => void;
};

const NUMBER_RE = /^-?\d+(\.\d+)?$/;

function parseInputValue(input: string, originalValue: unknown): unknown {
  const trimmed = input.trim();
  if (trimmed === 'null') {
    return null;
  }
  if (trimmed === 'true') {
    return true;
  }
  if (trimmed === 'false') {
    return false;
  }
  if (typeof originalValue === 'number') {
    const num = Number(trimmed);
    if (!Number.isNaN(num)) {
      return num;
    }
  }
  if (NUMBER_RE.test(trimmed)) {
    return Number(trimmed);
  }
  return input;
}

export function EditableCell({ value, editable, onSave }: EditableCellProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const display = formatCell(value);
  const colorClass = getValueColor(value === null ? 'null' : typeof value);

  if (!editable || typeof value === 'object') {
    return <span className={colorClass}>{display}</span>;
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const parsed = parseInputValue(editValue, value);
            onSave(parsed);
            setEditing(false);
          }
          if (e.key === 'Escape') {
            setEditing(false);
          }
        }}
        onBlur={() => {
          const parsed = parseInputValue(editValue, value);
          onSave(parsed);
          setEditing(false);
        }}
        className="w-full rounded border border-primary/50 bg-background px-1 py-0 text-xs outline-none"
      />
    );
  }

  return (
    <span
      role="button"
      tabIndex={0}
      className={`${colorClass} cursor-pointer rounded px-0.5 hover:ring-1 hover:ring-primary/30`}
      onDoubleClick={() => {
        setEditValue(value === null ? 'null' : String(value));
        setEditing(true);
      }}
    >
      {display}
    </span>
  );
}
