import { useState, useEffect } from 'react';

export function useControls() {
  const [controls, setControls] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': setControls((c) => ({ ...c, forward: true })); break;
        case 's': case 'arrowdown': setControls((c) => ({ ...c, backward: true })); break;
        case 'a': case 'arrowleft': setControls((c) => ({ ...c, left: true })); break;
        case 'd': case 'arrowright': setControls((c) => ({ ...c, right: true })); break;
        case ' ': setControls((c) => ({ ...c, brake: true })); break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w': case 'arrowup': setControls((c) => ({ ...c, forward: false })); break;
        case 's': case 'arrowdown': setControls((c) => ({ ...c, backward: false })); break;
        case 'a': case 'arrowleft': setControls((c) => ({ ...c, left: false })); break;
        case 'd': case 'arrowright': setControls((c) => ({ ...c, right: false })); break;
        case ' ': setControls((c) => ({ ...c, brake: false })); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return controls;
}
