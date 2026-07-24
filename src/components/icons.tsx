/**
 * icons.tsx — small inline SVG icon set used by the nav and cards.
 *
 * Inlining a handful of stroke icons keeps the bundle free of an icon-library
 * dependency and lets them inherit `currentColor` so they theme automatically.
 * Each accepts a `className` for sizing/colour.
 */
interface IconProps {
  className?: string;
}

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function DashboardIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function TasksIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6h11M9 12h11M9 18h11" />
      <path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" />
    </svg>
  );
}

export function CalendarIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function InsightsIcon({ className = 'h-5 w-5' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 3v18h18" />
      <path d="M7 14l3-4 3 3 4-6" />
    </svg>
  );
}

export function PlusIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function CheckIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function TrashIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

export function EditIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function ClockIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
