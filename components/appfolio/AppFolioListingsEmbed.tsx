'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    Appfolio?: {
      Listing: (options: {
        hostUrl: string
        themeColor: string
        height: string
        width: string
        defaultOrder: string
      }) => void
    }
  }
}

export default function AppFolioListingsEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[data-appfolio-listings="true"]'
    ) as HTMLScriptElement | null

    function initializeWidget() {
      try {
        if (!window.Appfolio || !containerRef.current) {
          setStatus('error')
          return
        }

        containerRef.current.innerHTML = ''

        const widgetMount = document.createElement('div')
        containerRef.current.appendChild(widgetMount)

        window.Appfolio.Listing({
          hostUrl: 'countypm.appfolio.com',
          themeColor: '#676767',
          height: '1200px',
          width: '100%',
          defaultOrder: 'date_posted',
        })

        setStatus('ready')
      } catch {
        setStatus('error')
      }
    }

    if (existingScript) {
      if (window.Appfolio) {
        initializeWidget()
      } else {
        existingScript.addEventListener('load', initializeWidget)
        return () => {
          existingScript.removeEventListener('load', initializeWidget)
        }
      }
      return
    }

    const script = document.createElement('script')
    script.src = 'https://countypm.appfolio.com/javascripts/listing.js'
    script.async = true
    script.setAttribute('data-appfolio-listings', 'true')
    script.onload = initializeWidget
    script.onerror = () => setStatus('error')
    document.body.appendChild(script)

    return () => {
      script.onload = null
      script.onerror = null
    }
  }, [])

  return (
    <div className="min-h-[400px]">
      {status === 'loading' && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-gray-600">
          Loading available rentals…
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
          We could not load the rental listings right now. Please call (805)
          482-9800 or email cpm@c-p-m.com for current availability.
        </div>
      )}

      <div ref={containerRef} />
    </div>
  )
}