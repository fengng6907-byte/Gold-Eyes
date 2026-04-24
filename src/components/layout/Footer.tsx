export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-background/50 backdrop-blur-sm mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-semibold text-gold-gradient">GOLD Eyes</span>
            <span className="text-xs text-muted-foreground">
              Real-time gold price analytics for Malaysia & Southeast Asia
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>
              Charts powered by{' '}
              <a
                href="https://www.tradingview.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-500 hover:text-gold-400 transition-colors"
              >
                TradingView
              </a>
            </span>
            <span>•</span>
            <span>Prices are indicative only</span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-card-border flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GOLD Eyes. Data for informational purposes only. Not financial advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
