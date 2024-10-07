import { useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

const useKeyboardShortcut = (key: string, handler: KeyHandler) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, handler]);
};

export default useKeyboardShortcut;
