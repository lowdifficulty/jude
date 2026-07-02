import { getMarketplaceApp, type JudeIconType, type MarketplaceAppId } from "@/lib/marketplace-apps";

type JudeAppIconProps = {
  id: MarketplaceAppId;
  size?: number;
  className?: string;
};

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function IconSvg({ type, size }: { type: JudeIconType; size: number }) {
  switch (type) {
    case "email":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      );
    case "calendar":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      );
    case "contacts":
      return (
        <svg width={size} height={size} {...iconProps}>
          <circle cx="12" cy="8" r="3" />
          <path d="M6 20v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
        </svg>
      );
    case "reminders":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M8 2v2M16 2v2" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 10h8M8 14h5" />
        </svg>
      );
    case "phone":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M6 3h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2C9 20 4 15 4 8a2 2 0 0 1 2-2z" />
        </svg>
      );
    case "phone-ai":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M6 3h4l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v4a2 2 0 0 1-2 2C9 20 4 15 4 8a2 2 0 0 1 2-2z" />
          <path d="M18 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
        </svg>
      );
    case "weather":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M17.5 19a4.5 4.5 0 1 0-2-8.5" />
          <path d="M12 3v2M4.93 4.93l1.41 1.41M2 12h2" />
        </svg>
      );
    case "news":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M4 6h16v12H4z" />
          <path d="M8 10h8M8 14h5M16 14h2" />
        </svg>
      );
    case "emergency":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 3l9 16H3L12 3z" />
          <path d="M12 9v4M12 16h.01" />
        </svg>
      );
    case "family":
      return (
        <svg width={size} height={size} {...iconProps}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="15" cy="9" r="2" />
          <path d="M4 20v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1M14 16a2.5 2.5 0 0 1 2.5-2.5" />
        </svg>
      );
    case "caregiver":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="3" y="4" width="18" height="14" rx="2" />
          <path d="M7 9h4M7 13h10M15 9h2" />
        </svg>
      );
    case "medication":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M8 12h8" />
          <rect x="6" y="8" width="12" height="8" rx="4" />
          <path d="M12 8V5" />
        </svg>
      );
    case "shield":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 3l8 3v6c0 5-3.5 9-8 9s-8-4-8-9V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "smarthome":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
          <path d="M9 21V12h6v9" />
        </svg>
      );
    case "homeassistant":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 3l9 6v12H3V9l9-6z" />
          <circle cx="12" cy="13" r="2" />
          <path d="M12 11V9" />
        </svg>
      );
    case "lighting":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V16h8v-3.5A6 6 0 0 0 12 2z" />
        </svg>
      );
    case "music":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      );
    case "maps":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z" />
          <path d="M9 4v14M15 6v14" />
        </svg>
      );
    case "health":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 20c-4-3.5-7-6.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 3.5-3 6.5-7 10z" />
        </svg>
      );
    case "wearables":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="7" y="7" width="10" height="12" rx="2" />
          <path d="M9 7V5a3 3 0 0 1 6 0v2M12 11v3" />
        </svg>
      );
    case "banking":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18M7 14h.01M11 14h2" />
        </svg>
      );
    case "rides":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M5 17h14l-1.5-5.5a2 2 0 0 0-1.9-1.5H8.4a2 2 0 0 0-1.9 1.5L5 17z" />
          <circle cx="7.5" cy="17.5" r="1.5" />
          <circle cx="16.5" cy="17.5" r="1.5" />
        </svg>
      );
    case "food":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M4 11h16v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8z" />
          <path d="M8 11V7a2 2 0 0 1 4 0v4M16 11V5" />
        </svg>
      );
    case "packages":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
          <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
        </svg>
      );
    case "documents":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M8 4h8l4 4v12H8V4z" />
          <path d="M16 4v4h4M10 13h6M10 17h4" />
        </svg>
      );
    case "photos":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path d="M3 16l5-5 4 4 3-3 6 6" />
        </svg>
      );
    case "video":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="2" y="6" width="15" height="12" rx="2" />
          <path d="M17 10l5-3v10l-5-3" />
        </svg>
      );
    case "speaker":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="6" y="8" width="8" height="10" rx="1" />
          <path d="M14 11a3 3 0 0 1 0 4M16 9.5a6 6 0 0 1 0 7" />
        </svg>
      );
    case "tv":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="2" y="5" width="20" height="13" rx="2" />
          <path d="M8 21h8M12 18v3" />
        </svg>
      );
    case "events":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M8 2v4M16 2v4" />
          <rect x="3" y="6" width="18" height="16" rx="2" />
          <path d="M3 11h18M8 15h2M14 15h2" />
        </svg>
      );
    case "social":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M7 10h.01M12 10h.01M17 10h.01" />
          <path d="M21 12c0 3.3-3.6 6-8 6-1 0-2-.1-2.9-.3L5 20l1.5-3.5C5.6 15.1 5 13.6 5 12c0-3.3 3.6-6 8-6s8 2.7 8 6z" />
        </svg>
      );
    case "maintenance":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M14 4l2 2-8 8H6v-2l8-8z" />
          <path d="M16 6l2-2 2 2-2 2-2-2z" />
        </svg>
      );
    case "garden":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 21V11" />
          <path d="M12 11C12 6 7 4 4 4c0 4 3 7 8 7M12 11c0-5 5-7 8-7 0 4-3 7-8 7" />
        </svg>
      );
    case "pet":
      return (
        <svg width={size} height={size} {...iconProps}>
          <circle cx="8" cy="9" r="1.5" />
          <circle cx="16" cy="9" r="1.5" />
          <circle cx="12" cy="6" r="1.5" />
          <path d="M6 14c1.5 2 4 3 6 3s4.5-1 6-3" />
        </svg>
      );
    case "grocery":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M6 6h15l-1.5 9H7.5L6 6z" />
          <path d="M6 6L5 3H2M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
        </svg>
      );
    case "webhook":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M8 12h8M12 8v8" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "automation":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      );
    case "manual":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 5v14M5 12h14" />
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
    case "thermostat":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M12 3a4 4 0 0 0-4 4v8a4 4 0 0 0 8 0V7a4 4 0 0 0-4-4z" />
          <path d="M12 11v4" />
        </svg>
      );
    case "lock":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case "garage":
      return (
        <svg width={size} height={size} {...iconProps}>
          <path d="M3 10l9-6 9 6" />
          <rect x="5" y="10" width="14" height="10" rx="1" />
          <path d="M9 14h6v6H9z" />
        </svg>
      );
    case "camera":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="3" y="7" width="18" height="12" rx="2" />
          <circle cx="12" cy="13" r="3" />
          <path d="M8 7l1.5-2h5L16 7" />
        </svg>
      );
    case "games":
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="3" y="8" width="18" height="10" rx="2" />
          <path d="M8 12h2M14 12h2M10 15v-2M14 15v-2" />
          <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} {...iconProps}>
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      );
  }
}

export function JudeAppIcon({ id, size = 22, className }: JudeAppIconProps) {
  const icon = getMarketplaceApp(id)?.icon ?? "manual";

  return (
    <span className={`jude-app-icon${className ? ` ${className}` : ""}`} aria-hidden="true">
      <IconSvg type={icon} size={size} />
    </span>
  );
}
