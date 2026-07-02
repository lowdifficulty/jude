"use client";

type JudeLogoutButtonProps = {
  onLogout: () => void;
  variant?: "header" | "dock";
  isEvil?: boolean;
};

const logoutIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function JudeLogoutButton({
  onLogout,
  variant = "header",
  isEvil = false,
}: JudeLogoutButtonProps) {
  return (
    <button
      type="button"
      className={`jude-logout-btn jude-logout-btn--${variant}${isEvil ? " jude-logout-btn--evil" : ""}`}
      onClick={() => void onLogout()}
      aria-label="Log out of Jude"
    >
      {logoutIcon}
      {variant === "header" && <span>Log out</span>}
    </button>
  );
}
