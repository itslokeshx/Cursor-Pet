import { useCallback, useEffect, useRef } from 'react';
import {
  CursorPetConfig,
  DEFAULT_CONFIG,
  DEFAULT_SPRITE_SETS,
  SpriteSets,
} from './types';

export function useCursorPet(config: CursorPetConfig = {}) {
  const {
    spriteUrl = DEFAULT_CONFIG.spriteUrl,
    spriteSize = DEFAULT_CONFIG.spriteSize,
    speed = DEFAULT_CONFIG.speed,
    stopDistance = DEFAULT_CONFIG.stopDistance,
    startX,
    startY,
    respectReducedMotion = DEFAULT_CONFIG.respectReducedMotion,
    enabled = DEFAULT_CONFIG.enabled,
    spriteSets: customSpriteSets,
  } = config;

  const petRef = useRef<HTMLDivElement>(null);

  const centerX = typeof startX === 'number' ? startX : Math.floor(window.innerWidth / 2);
  const centerY = typeof startY === 'number' ? startY : Math.floor(window.innerHeight / 2);

  const state = useRef({
    nekoPosX: centerX,
    nekoPosY: centerY,
    mousePosX: centerX,
    mousePosY: centerY,
    frameCount: 0,
    idleTime: 0,
    idleAnimation: null as string | null,
    idleAnimationFrame: 0,
    lastFrameTimestamp: 0,
    hasMoved: false,
  });

  const spriteSets: SpriteSets = {
    ...DEFAULT_SPRITE_SETS,
    ...customSpriteSets,
  };

  const setSprite = useCallback(
    (name: string, frame: number) => {
      const el = petRef.current;
      if (!el || !spriteSets[name]) return;

      const sprite = spriteSets[name][frame % spriteSets[name].length];
      el.style.backgroundPosition = `${sprite[0] * spriteSize}px ${sprite[1] * spriteSize}px`;
    },
    [spriteSize, spriteSets]
  );

  const resetIdleAnimation = useCallback(() => {
    state.current.idleAnimation = null;
    state.current.idleAnimationFrame = 0;
  }, []);

  const idle = useCallback(() => {
    const s = state.current;
    s.idleTime += 1;

    if (
      s.idleTime > 2 &&
      Math.floor(Math.random() * 10) === 0 &&
      s.idleAnimation === null
    ) {
      const available: string[] = ['sleeping', 'scratchSelf'];

      if (s.nekoPosX < 32) available.push('scratchWallW');
      if (s.nekoPosY < 32) available.push('scratchWallN');
      if (s.nekoPosX > window.innerWidth - 32) available.push('scratchWallE');
      if (s.nekoPosY > window.innerHeight - 32) available.push('scratchWallS');

      s.idleAnimation = available[Math.floor(Math.random() * available.length)];
    }

    switch (s.idleAnimation) {
      case 'sleeping':
        if (s.idleAnimationFrame < 3) {
          setSprite('tired', 0);
          break;
        }
        setSprite('sleeping', Math.floor(s.idleAnimationFrame / 4));
        if (s.idleAnimationFrame > 192) resetIdleAnimation();
        break;

      case 'scratchWallN':
      case 'scratchWallS':
      case 'scratchWallE':
      case 'scratchWallW':
      case 'scratchSelf':
        setSprite(s.idleAnimation, s.idleAnimationFrame);
        if (s.idleAnimationFrame > 9) resetIdleAnimation();
        break;

      default:
        setSprite('idle', 0);
        return;
    }

    s.idleAnimationFrame += 1;
  }, [setSprite, resetIdleAnimation]);

  const frame = useCallback(() => {
    const s = state.current;
    const el = petRef.current;
    if (!el) return;

    s.frameCount += 1;

    const diffX = s.nekoPosX - s.mousePosX;
    const diffY = s.nekoPosY - s.mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < speed || distance < stopDistance) {
      idle();
      return;
    }

    s.idleAnimation = null;
    s.idleAnimationFrame = 0;

    if (s.idleTime > 1) {
      setSprite('alert', 0);
      s.idleTime = Math.min(s.idleTime, 7);
      s.idleTime -= 1;
      return;
    }

    let direction = '';
    direction += diffY / distance > 0.5 ? 'N' : '';
    direction += diffY / distance < -0.5 ? 'S' : '';
    direction += diffX / distance > 0.5 ? 'W' : '';
    direction += diffX / distance < -0.5 ? 'E' : '';
    setSprite(direction, s.frameCount);

    s.nekoPosX -= (diffX / distance) * speed;
    s.nekoPosY -= (diffY / distance) * speed;

    s.nekoPosX = Math.min(Math.max(16, s.nekoPosX), window.innerWidth - 16);
    s.nekoPosY = Math.min(Math.max(16, s.nekoPosY), window.innerHeight - 16);

    el.style.left = `${s.nekoPosX - 16}px`;
    el.style.top = `${s.nekoPosY - 16}px`;
  }, [speed, stopDistance, idle, setSprite]);

  useEffect(() => {
    if (!enabled) return;

    if (
      respectReducedMotion &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const el = petRef.current;
    if (!el) return;

    const initX = typeof startX === 'number' ? startX : Math.floor(window.innerWidth / 2);
    const initY = typeof startY === 'number' ? startY : Math.floor(window.innerHeight / 2);

    state.current.nekoPosX = initX;
    state.current.nekoPosY = initY;
    state.current.mousePosX = initX;
    state.current.mousePosY = initY;

    el.style.width = `${spriteSize}px`;
    el.style.height = `${spriteSize}px`;
    el.style.position = 'fixed';
    el.style.pointerEvents = 'none';
    el.style.imageRendering = 'pixelated';
    el.style.left = `${initX - 16}px`;
    el.style.top = `${initY - 16}px`;
    el.style.backgroundImage = `url(${spriteUrl})`;

    const handleMouseMove = (e: MouseEvent) => {
      state.current.mousePosX = e.clientX;
      state.current.mousePosY = e.clientY;
      state.current.hasMoved = true;
    };

    document.addEventListener('mousemove', handleMouseMove);

    let animationId: number;

    const onAnimationFrame = (timestamp: number) => {
      if (!el.isConnected) return;

      if (!state.current.lastFrameTimestamp) {
        state.current.lastFrameTimestamp = timestamp;
      }

      if (timestamp - state.current.lastFrameTimestamp > 100) {
        state.current.lastFrameTimestamp = timestamp;
        frame();
      }

      animationId = window.requestAnimationFrame(onAnimationFrame);
    };

    animationId = window.requestAnimationFrame(onAnimationFrame);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.cancelAnimationFrame(animationId);
    };
  }, [enabled, respectReducedMotion, spriteSize, spriteUrl, startX, startY, frame]);

  return petRef;
}
