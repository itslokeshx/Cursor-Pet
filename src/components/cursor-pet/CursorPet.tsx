import { CursorPetProps, DEFAULTS } from "./types";
import { useCursorPet } from "./useCursorPet";

export function CursorPet({
  className,
  zIndex = DEFAULTS.Z_INDEX,
  enabled = DEFAULTS.ENABLED,
  ...config
}: CursorPetProps) {
  const petRef = useCursorPet({ enabled, ...config });

  if (!enabled) return null;

  return (
    <div
      ref={petRef}
      aria-hidden="true"
      className={className}
      style={{ zIndex }}
    />
  );
}
