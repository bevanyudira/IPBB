"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function PageLoadingBar() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleStart = () => setIsLoading(true)
    const handleStop = () => setIsLoading(false)

    // Intercept router push/replace events
    const originalPush = router.push
    const originalReplace = router.replace

    router.push = function (...args: any[]) {
      handleStart()
      const result = originalPush.apply(this, args)
      
      // Stop loading after a short delay to allow page to transition
      // This will be overridden if explicit stop is called
      const timeoutId = setTimeout(() => {
        handleStop()
      }, 500)
      
      // Return promise and stop loading when navigation completes
      if (result instanceof Promise) {
        result.finally(() => {
          clearTimeout(timeoutId)
          handleStop()
        })
      }
      
      return result
    }

    router.replace = function (...args: any[]) {
      handleStart()
      const result = originalReplace.apply(this, args)
      
      // Stop loading after a short delay
      const timeoutId = setTimeout(() => {
        handleStop()
      }, 500)
      
      // Return promise and stop loading when navigation completes
      if (result instanceof Promise) {
        result.finally(() => {
          clearTimeout(timeoutId)
          handleStop()
        })
      }
      
      return result
    }

    return () => {
      // Restore original methods
      router.push = originalPush
      router.replace = originalReplace
    }
  }, [router])

  if (!isLoading) return null

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse">
        <div className="h-full w-full animate-[shimmer_2s_infinite]" style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          backgroundSize: '200% 100%',
        }} />
      </div>

      {/* Spinner Overlay */}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {/* Animated Spinner */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-pink-500 animate-spin" style={{
              animationDirection: 'reverse',
              animationDuration: '1.5s',
            }} />
          </div>
          <p className="text-sm font-medium text-foreground">Loading...</p>
        </div>
      </div>
    </>
  )
}
