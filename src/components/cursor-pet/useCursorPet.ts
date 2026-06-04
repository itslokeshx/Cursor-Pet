import { useCallback, useEffect, useRef } from "react";
import { CursorPetConfig, DEFAULTS, SPRITE_SETS, SpriteSets } from "./types";

function getWindowCenter() {
  return {
    x: Math.floor(window.innerWidth / 2),
    y: Math.floor(window.innerHeight / 2),
  };
}

export function useCursorPet(config: CursorPetConfig = {}) {
  const {
    spriteUrl = DEFAULTS.SPRITE_URL,
    spriteSize = DEFAULTS.SPRITE_SIZE,
    speed = DEFAULTS.SPEED,
    stopDistance = DEFAULTS.STOP_DISTANCE,
    startX,
    startY,
    respectReducedMotion = DEFAULTS.RESPECT_REDUCED_MOTION,
    enabled = DEFAULTS.ENABLED,
    spriteSets: customSpriteSets,
  } = config;

  const petRef = useRef<HTMLDivElement>(null);

  const initCenter = getWindowCenter();
  const initialX = typeof startX === "number" ? startX : initCenter.x;
  const initialY = typeof startY === "number" ? startY : initCenter.y;

  const state = useRef({
    nekoPosX: initialX,
    nekoPosY: initialY,
    mousePosX: initialX,
    mousePosY: initialY,
    frameCount: 0,
    idleTime: 0,
    idleAnimation: null as string | null,
    idleAnimationFrame: 0,
    lastFrameTimestamp: 0,
  });

  const spriteSets = {
    ...SPRITE_SETS,
    ...customSpriteSets,
  } as SpriteSets;

  const setSprite = useCallback(
    (name: string, frame: number) => {
      const el = petRef.current;
      if (!el || !spriteSets[name]) return;

      const sprite = spriteSets[name][frame % spriteSets[name].length];
      el.style.backgroundPosition = `${sprite[0] * spriteSize}px ${sprite[1] * spriteSize}px`;
    },
    [spriteSize, spriteSets],
  );

  const resetIdleAnimation = useCallback(() => {
    state.current.idleAnimation = null;
    state.current.idleAnimationFrame = 0;
  }, []);

  const idle = useCallback(() => {
    const s = state.current;
    s.idleTime += 1;

    if (
      s.idleTime > DEFAULTS.IDLE_THRESHOLD &&
      Math.floor(Math.random() * DEFAULTS.IDLE_CHANCE) === 0 &&
      s.idleAnimation === null
    ) {
      const available: string[] = ["sleeping", "scratchSelf"];

      if (s.nekoPosX < DEFAULTS.EDGE_MARGIN) available.push("scratchWallW");
      if (s.nekoPosY < DEFAULTS.EDGE_MARGIN) available.push("scratchWallN");
      if (s.nekoPosX > window.innerWidth - DEFAULTS.EDGE_MARGIN)
        available.push("scratchWallE");
      if (s.nekoPosY > window.innerHeight - DEFAULTS.EDGE_MARGIN)
        available.push("scratchWallS");

      s.idleAnimation = available[Math.floor(Math.random() * available.length)];
    }

    switch (s.idleAnimation) {
      case "sleeping":
        if (s.idleAnimationFrame < DEFAULTS.TIRED_FRAMES) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(s.idleAnimationFrame / 4));
        if (s.idleAnimationFrame > DEFAULTS.SLEEP_DURATION)
          resetIdleAnimation();
        break;

      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(s.idleAnimation, s.idleAnimationFrame);
        if (s.idleAnimationFrame > DEFAULTS.SCRATCH_DURATION)
          resetIdleAnimation();
        break;

      default:
        setSprite("idle", 0);
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
      setSprite("alert", 0);
      s.idleTime = Math.min(s.idleTime, DEFAULTS.ALERT_DECAY);
      s.idleTime -= 1;
      return;
    }

    let direction = "";
    direction += diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, s.frameCount);

    s.nekoPosX -= (diffX / distance) * speed;
    s.nekoPosY -= (diffY / distance) * speed;

    s.nekoPosX = Math.min(
      Math.max(DEFAULTS.HALF_SPRITE, s.nekoPosX),
      window.innerWidth - DEFAULTS.HALF_SPRITE,
    );
    s.nekoPosY = Math.min(
      Math.max(DEFAULTS.HALF_SPRITE, s.nekoPosY),
      window.innerHeight - DEFAULTS.HALF_SPRITE,
    );

    el.style.left = `${s.nekoPosX - DEFAULTS.HALF_SPRITE}px`;
    el.style.top = `${s.nekoPosY - DEFAULTS.HALF_SPRITE}px`;
  }, [speed, stopDistance, idle, setSprite]);

  useEffect(() => {
    if (!enabled) return;

    if (
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const el = petRef.current;
    if (!el) return;

    const center = getWindowCenter();
    const initX = typeof startX === "number" ? startX : center.x;
    const initY = typeof startY === "number" ? startY : center.y;

    state.current.nekoPosX = initX;
    state.current.nekoPosY = initY;
    state.current.mousePosX = initX;
    state.current.mousePosY = initY;

    el.style.width = `${spriteSize}px`;
    el.style.height = `${spriteSize}px`;
    el.style.position = "fixed";
    el.style.pointerEvents = "none";
    el.style.imageRendering = "pixelated";
    el.style.left = `${initX - DEFAULTS.HALF_SPRITE}px`;
    el.style.top = `${initY - DEFAULTS.HALF_SPRITE}px`;
    el.style.backgroundImage = `url(${spriteUrl})`;

    const handleMouseMove = (e: MouseEvent) => {
      state.current.mousePosX = e.clientX;
      state.current.mousePosY = e.clientY;
    };

    document.addEventListener("mousemove", handleMouseMove);

    let animationId: number;

    const onAnimationFrame = (timestamp: number) => {
      if (!el.isConnected) return;

      if (!state.current.lastFrameTimestamp) {
        state.current.lastFrameTimestamp = timestamp;
      }

      if (
        timestamp - state.current.lastFrameTimestamp >
        DEFAULTS.FRAME_INTERVAL
      ) {
        state.current.lastFrameTimestamp = timestamp;
        frame();
      }

      animationId = window.requestAnimationFrame(onAnimationFrame);
    };

    animationId = window.requestAnimationFrame(onAnimationFrame);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(animationId);
    };
  }, [
    enabled,
    respectReducedMotion,
    spriteSize,
    spriteUrl,
    startX,
    startY,
    frame,
  ]);

  return petRef;
}
