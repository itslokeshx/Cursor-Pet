import { CursorPet } from '@/components/cursor-pet';

export default function App() {
  return (
    <main
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        userSelect: 'none',
      }}
    >
      <p
        style={{
          color: 'rgba(255, 255, 255, 0.15)',
          fontSize: '0.875rem',
          letterSpacing: '0.05em',
        }}
      >
        move your cursor around ✨
      </p>
      <CursorPet />
    </main>
  );
}
