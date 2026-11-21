import { useEffect, useRef } from 'react';
import { checkGitHubUpdate, promptUpdateAvailable } from '../utils/appVersion';

/** Quietly checks GitHub on launch and prompts if a newer release exists. */
export function UpdatePrompt() {
  const asked = useRef(false);

  useEffect(() => {
    if (asked.current) return;
    asked.current = true;

    const timer = setTimeout(() => {
      checkGitHubUpdate()
        .then(info => {
          if (info?.updateAvailable) promptUpdateAvailable(info);
        })
        .catch(() => {
          /* silent on launch */
        });
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
