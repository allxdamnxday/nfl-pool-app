import React from 'react';
import useParallax from '../hooks/useParallax';

function ParallaxBackground({ imageUrl, speed = 0.5, children }) {
  const yOffset = useParallax(speed);

  return (
    <div className="relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          transform: `translateY(${yOffset}px)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export default ParallaxBackground;