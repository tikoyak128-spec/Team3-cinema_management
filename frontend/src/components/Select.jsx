import { Children, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function Select({
  value,
  onChange,
  children,
  className = "",
  containerClassName = "relative w-full",
  name,
  required = false,
  disabled = false,
  placeholder = "",
}) {
  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter((child) => child && child.type === "option")
        .map((child) => ({
          value: child.props.value !== undefined ? child.props.value : child.props.children,
          label: child.props.children,
          disabled: !!child.props.disabled,
        })),
    [children]
  );

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const triggerRef = useRef(null);

  const selectedIndex = options.findIndex((o) => String(o.value) === String(value));
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const commit = (opt) => {
    if (!opt || opt.disabled) return;
    onChange?.({ target: { name, value: String(opt.value) } });
    close();
  };

  const handleTriggerKeyDown = (e) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      setActiveIndex(selectedIndex);
      setOpen(true);
    }
  };

  const handleListKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      commit(options[activeIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      close();
    }
  };

  return (
    <div ref={rootRef} className={containerClassName}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          setActiveIndex(selectedIndex);
          setOpen((o) => !o);
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`${className} inline-flex items-center justify-between gap-2 text-left disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        <span className={`truncate ${selected ? "" : "text-[var(--app-mute)]"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[var(--app-mute)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        ref={listRef}
        role="listbox"
        tabIndex={-1}
        inert={!open}
        onKeyDown={handleListKeyDown}
        className={`absolute z-40 mt-2 w-full min-w-[190px] max-h-64 overflow-y-auto rounded-xl border border-[var(--app-edge)] bg-[var(--app-panel)] shadow-[0_18px_44px_rgba(0,0,0,0.5)] p-1.5 origin-top outline-none transition-all duration-150 ease-out ${
          open
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-1.5 scale-[0.97] pointer-events-none"
        }`}
      >
        {options.map((opt, i) => {
          const isSelected = i === selectedIndex;
          const isActive = i === activeIndex;
          return (
            <button
              key={`${opt.value}-${i}`}
              type="button"
              role="option"
              aria-selected={isSelected}
              tabIndex={-1}
              disabled={opt.disabled}
              onMouseEnter={() => setActiveIndex(i)}
              onClick={() => commit(opt)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-[14px] flex items-center justify-between gap-3 transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed ${
                isSelected
                  ? "bg-brand/15 text-brand font-bold"
                  : isActive
                    ? "bg-[var(--app-fill)] text-[var(--app-ink)]"
                    : "text-[var(--app-ink2)]"
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && <Check size={15} className="shrink-0 text-brand" />}
            </button>
          );
        })}
      </div>

      <select
        tabIndex={-1}
        aria-hidden="true"
        name={name}
        value={value ?? ""}
        onChange={() => {}}
        required={required}
        className="sr-only"
      >
        {options.map((o, i) => (
          <option key={`${o.value}-${i}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
