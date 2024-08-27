import React, { useEffect, useRef, useState } from 'react';

function FadeInSection({ children, delay = 0 }) {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
        }
      });
    });
    
    const { current } = domRef;
    observer.observe(current);
    
    return () => observer.unobserve(current);
  }, [delay]);

  return (
    <div
      className={`transition-opacity duration-1000 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
      ref={domRef}
    >
      {children}
    </div>
  );
}

export default FadeInSection;