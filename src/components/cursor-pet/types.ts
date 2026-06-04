export type SpriteCoord = [number, number];

export type SpriteSets = Record<string, SpriteCoord[]>;

export interface CursorPetConfig {
  spriteUrl?: string;
  spriteSize?: number;
  speed?: number;
  stopDistance?: number;
  startX?: number;
  startY?: number;
  zIndex?: number;
  respectReducedMotion?: boolean;
  spriteSets?: Partial<SpriteSets>;
  enabled?: boolean;
}

export interface CursorPetProps extends CursorPetConfig {
  className?: string;
}

export const DEFAULT_SPRITE_SETS: SpriteSets = {
  idle: [[-3, -3]],
  alert: [[-7, -3]],
  scratchSelf: [
    [-5, 0],
    [-6, 0],
    [-7, 0],
  ],
  scratchWallN: [
    [0, 0],
    [0, -1],
  ],
  scratchWallS: [
    [-7, -1],
    [-6, -2],
  ],
  scratchWallE: [
    [-2, -2],
    [-2, -3],
  ],
  scratchWallW: [
    [-4, 0],
    [-4, -1],
  ],
  tired: [[-3, -2]],
  sleeping: [
    [-2, 0],
    [-2, -1],
  ],
  N: [
    [-1, -2],
    [-1, -3],
  ],
  NE: [
    [0, -2],
    [0, -3],
  ],
  E: [
    [-3, 0],
    [-3, -1],
  ],
  SE: [
    [-5, -1],
    [-5, -2],
  ],
  S: [
    [-6, -3],
    [-7, -2],
  ],
  SW: [
    [-5, -3],
    [-6, -1],
  ],
  W: [
    [-4, -2],
    [-4, -3],
  ],
  NW: [
    [-1, 0],
    [-1, -1],
  ],
};

export const DEFAULT_CONFIG: Required<
  Omit<CursorPetConfig, 'spriteSets' | 'className'>
> = {
  spriteUrl: '/pets/neko.gif',
  spriteSize: 32,
  speed: 10,
  stopDistance: 48,
  startX: 32,
  startY: 32,
  zIndex: 2147483647,
  respectReducedMotion: true,
  enabled: true,
};
