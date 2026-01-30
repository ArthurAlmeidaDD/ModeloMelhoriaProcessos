
import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';
import { Pencil } from 'lucide-react';

interface EditableTextProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  className?: string;
  placeholder?: string;
  label?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onChange,
  multiline = false,
  className,
  placeholder,
  label,
  style,
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onChange(localValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        if (!multiline) {
            e.preventDefault();
            handleSave();
        }
    } else if (e.key === 'Escape') {
      setLocalValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <Textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className={cn("min-h-[60px] shadow-sm", className)}
          placeholder={placeholder}
          style={style}
        />
      );
    }
    return (
      <Input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={cn("shadow-sm", className)}
        placeholder={placeholder}
        style={style}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "group cursor-pointer relative rounded px-2 py-1 -ml-2 border border-transparent hover:border-slate-300 hover:bg-white hover:shadow-sm transition-all min-h-[1.5em] flex items-center",
        !value && "text-slate-400 italic bg-slate-50/50",
        className
      )}
      style={style}
      {...props}
    >
      <span className="flex-1 break-words whitespace-pre-wrap">
        {value || placeholder}
      </span>
      <Pencil className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
};
