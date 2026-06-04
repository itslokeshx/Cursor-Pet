# 🐱 Cursor Pet

A cute, configurable cursor-following pet for React apps. Drop it in and a little cat chases your cursor around the screen.

![MIT License](https://img.shields.io/badge/license-MIT-blue)

---

## Quick Start

```tsx
import { CursorPet } from '@/components/cursor-pet';

function App() {
  return (
    <>
      <h1>My App</h1>
      <CursorPet />
    </>
  );
}
```

That's it. A pixelated cat now follows your cursor. ✨

---

## Installation

```bash
git clone https://github.com/itslokeshx/cursor-pet.git
cd cursor-pet
npm install
npm run dev
```

### Integrate into your existing project

Copy these into your project:

```
src/components/cursor-pet/    → your component directory
public/pets/neko.gif          → your public directory
```

Then import and use `<CursorPet />` anywhere.

---

## API

### `<CursorPet />` Component

| Prop                   | Type      | Default            | Description                              |
| ---------------------- | --------- | ------------------ | ---------------------------------------- |
| `spriteUrl`            | `string`  | `'/pets/neko.gif'` | Path to the sprite sheet image           |
| `spriteSize`           | `number`  | `32`               | Size of each sprite frame in px          |
| `speed`                | `number`  | `10`               | Movement speed in px/frame               |
| `stopDistance`          | `number`  | `48`               | Distance (px) at which pet stops chasing |
| `startX`               | `number`  | `32`               | Initial X position                       |
| `startY`               | `number`  | `32`               | Initial Y position                       |
| `zIndex`               | `number`  | `2147483647`       | CSS z-index                              |
| `respectReducedMotion` | `boolean` | `true`             | Respect `prefers-reduced-motion`         |
| `enabled`              | `boolean` | `true`             | Toggle the pet on/off                    |
| `spriteSets`           | `object`  | —                  | Override default sprite animations       |
| `className`            | `string`  | —                  | Additional CSS class                     |

### `useCursorPet()` Hook

For full control, use the hook directly:

```tsx
import { useCursorPet } from '@/components/cursor-pet';

function MyComponent() {
  const petRef = useCursorPet({ speed: 15 });
  return <div ref={petRef} />;
}
```

Returns a `ref` you attach to any element. The hook handles all animation logic internally.

---

## Project Structure

```
src/
├── main.tsx                     # Entry point
├── App.tsx                      # Demo app
├── index.css                    # Global styles
└── components/
    └── cursor-pet/
        ├── index.ts             # Barrel exports
        ├── CursorPet.tsx        # Drop-in component
        ├── useCursorPet.ts      # Core logic hook
        └── types.ts             # TypeScript types & defaults
public/
└── pets/
    └── neko.gif                 # Default sprite sheet
```

---

## Custom Sprites

You can use any sprite sheet — just pass the URL and frame size:

```tsx
<CursorPet spriteUrl="/pets/my-dog.gif" spriteSize={48} />
```

---

## Tech Stack

- **React 19** — Hooks-based architecture
- **TypeScript** — Full type safety
- **Vite** — Fast dev server & builds

## License

MIT — see [LICENSE](LICENSE) for details.
