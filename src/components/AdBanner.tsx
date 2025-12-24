import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

export function AdBanner() {
  const adRef = useRef<HTMLModElement>(null);
  const adInitialized = useRef(false);

  useEffect(() => {
    // Only initialize the ad once
    if (adInitialized.current) return;
    
    // Wait for AdSense script to load, then push the ad
    const initAd = () => {
      try {
        if (adRef.current && !adInitialized.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adInitialized.current = true;
        }
      } catch (e) {
        // AdSense may throw errors in development or if blocked
        console.log('AdSense initialization skipped');
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initAd, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="fixed left-0 right-0 z-40 bg-muted/80 backdrop-blur-sm border-t border-border/30 overflow-hidden"
      style={{ 
        bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
        height: '50px',
        maxHeight: '50px'
      }}
    >
      <div className="flex items-center justify-center h-full px-4 max-w-md mx-auto overflow-hidden">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ 
            display: 'block', 
            width: '100%', 
            height: '50px',
            maxHeight: '50px',
            overflow: 'hidden'
          }}
          data-ad-client="ca-pub-7627780184759005"
          data-ad-slot="auto"
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
}
