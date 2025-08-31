'use client'

import { WebSDK } from '@rased-ai/web-sdk';
import { useEffect, useRef } from 'react';

export default function HomePage() {
  const webSDk = useRef(WebSDK.getInstance())
  useEffect(() => {
    webSDk.current.start({
      apiKey: 'sk-1234567890abcdef1234567890abcdef',
    })
  }, [])

return (
  <div>
    <h1>Hello, world!</h1>
  </div>
)
}