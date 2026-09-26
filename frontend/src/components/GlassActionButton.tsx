"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { pointerGlow } from "@/utils/pointerGlow";

type GlassActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
};

export default function GlassActionButton({
  children,
  loading = false,
  loadingLabel,
  disabled = false,
  icon,
  fullWidth = false,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: GlassActionButtonProps) {
  return (
    <button
      {...pointerGlow}
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      aria-label={loading && loadingLabel ? loadingLabel : ariaLabel}
      className={`fd-action-button fd-pointer-glow ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {/* Keep the idle label in flow so loading never changes button dimensions. */}
      <span className="fd-action-label" aria-hidden={loading || undefined}>
        {icon && <span className="fd-action-icon" aria-hidden="true">{icon}</span>}
        <span className="fd-action-text">{children}</span>
      </span>
      <span className="fd-action-spinner" aria-hidden="true">
        <svg className="fd-action-spinner-svg" viewBox="0 0 50 50" focusable="false">
          <circle className="fd-action-spinner-path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
        </svg>
      </span>
    </button>
  );
}
