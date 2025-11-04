import React, { useState } from 'react'

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)

  const handleError = () => {
    setDidError(true)
  }

  const { src, alt, style, className, loading, fetchPriority, ...rest } = props

  // Generate optimized srcset for responsive images
  const generateSrcSet = (originalSrc: string | undefined) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return undefined;
    
    // Detect Unsplash URLs and add WebP + responsive sizes
    if (originalSrc.includes('unsplash.com')) {
      const baseUrl = originalSrc.split('?')[0];
      const params = '?crop=entropy&cs=tinysrgb&fit=max&fm=webp&q=85';
      return `${baseUrl}${params}&w=640 640w, ${baseUrl}${params}&w=1024 1024w, ${baseUrl}${params}&w=1920 1920w`;
    }
    return undefined;
  };

  // Optimize image URL for WebP and quality
  const optimizeSrc = (originalSrc: string | undefined) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc;
    
    if (originalSrc.includes('unsplash.com')) {
      // Add WebP format and optimize quality if not already specified
      if (!originalSrc.includes('fm=')) {
        const separator = originalSrc.includes('?') ? '&' : '?';
        return `${originalSrc}${separator}fm=webp&q=85`;
      }
    }
    return originalSrc;
  };

  const optimizedSrc = optimizeSrc(src);
  const srcSet = generateSrcSet(src);

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Error loading image" {...rest} data-original-url={src} loading="eager" decoding="async" fetchPriority="high" />
      </div>
    </div>
  ) : (
    <img 
      src={optimizedSrc} 
      srcSet={srcSet}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
      alt={alt} 
      className={className} 
      style={style} 
      {...rest} 
      onError={handleError} 
      loading={loading || "auto"} 
      decoding="async"
      fetchPriority={fetchPriority || "auto"}
    />
  )
}
