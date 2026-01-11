import React from 'react';

export const Component = () => {

  return (
 <main className="hero-section w-full h-screen flex items-center justify-center">
                {/* The SVG filter is the key to the watercolor effect.
                  feTurbulence creates noise, and feDisplacementMap uses that noise
                  to distort the shapes of the splotches, creating the organic, bleeding edges.
                */}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <filter id="watercolor-bleed">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="3" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="100" />
                    </filter>
                </svg>

                <div className="watercolor-canvas">
                    <div className="splotch splotch-1"></div>
                    <div className="splotch splotch-2"></div>
                    <div className="splotch splotch-3"></div>
                </div>

                {/* The content container is now empty */}
                <div className="relative z-10 text-center p-8 max-w-2xl">
                </div>
      </main>
  );
};
