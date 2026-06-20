import Script from 'next/script'

// Google Analytics (gtag.js). The Measurement ID is public (it ships in client code),
// so it can be set via env or falls back to the configured default.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-9QLHH69HD3'

export function GoogleAnalytics() {
  if (!GA_ID) return null
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  )
}
