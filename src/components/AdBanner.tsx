export function AdBanner() {
  return (
    <div className="fixed left-0 right-0 z-40 bg-muted/80 backdrop-blur-sm border-t border-border/30" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="flex items-center justify-center h-14 px-4 max-w-md mx-auto">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-8 h-8 rounded bg-border/50 flex items-center justify-center">
            <span className="text-xs font-bold">AD</span>
          </div>
          <span className="text-sm">Google AdSense Placeholder</span>
        </div>
      </div>
    </div>
  );
}
