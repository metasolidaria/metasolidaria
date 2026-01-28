// Register service worker after page is fully loaded to avoid blocking FCP
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Delay SW registration to not block initial render
      setTimeout(() => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then((registration) => {
            console.log('SW registered:', registration.scope);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      }, 3000); // Wait 3 seconds after load
    });
  }
};
