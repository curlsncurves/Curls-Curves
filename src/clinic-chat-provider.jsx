import React, { useEffect, useState } from 'react';
import ClinicChat from './clinic-chat.jsx';

const botId = import.meta.env.VITE_KENYT_BOT_ID?.trim() || '261035618';
const loader = 'https://www.kenyt.ai/botapp/ChatbotUI/dist/js/bot-loader.js';

export default function ClinicChatProvider() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!/^\d{5,16}$/.test(botId || '')) return;

    const script = document.createElement('script');
    script.src = loader;
    script.async = true;
    script.dataset.bot = botId;

    // Keep the built-in assistant until the provider actually mounts its launcher.
    const observer = new MutationObserver(() => {
      if (!document.getElementById('kenytChatBubble')) return;
      observer.disconnect();
      clearTimeout(timeout);
      setLoaded(true);
    });
    const timeout = window.setTimeout(() => {
      observer.disconnect();
      script.remove();
    }, 12000);
    observer.observe(document.body, { childList: true, subtree: true });
    document.head.append(script);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
      script.remove();
    };
  }, []);

  return loaded ? null : <ClinicChat />;
}
