import { CursorPetProps, DEFAULT_CONFIG } from './types';
import { useCursorPet } from './useCursorPet';

export function CursorPet({
  className,
  zIndex = DEFAULT_CONFIG.zIndex,
  enabled = DEFAULT_CONFIG.enabled,
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
