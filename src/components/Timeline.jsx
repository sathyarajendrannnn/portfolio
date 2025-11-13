"use client";
import { useScroll, useTransform, motion } from "framer-motion";
import React, { useRef, useState, useCallback, useEffect } from "react";

// Extracted Timeline Line Component
const TimelineLine = React.memo(({ height, heightTransform, opacityTransform }) => {
  return (
    <div
      style={{ height: `${height}px` }}
      className="absolute left-3 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-700 to-transparent to-[99%] [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]"
    >
      <motion.div
        style={{
          height: heightTransform,
          opacity: opacityTransform,
        }}
        className="absolute inset-x-0 top-0 w-[2px] bg-gradient-to-t from-purple-500 via-blue-400/50 to-transparent from-[0%] via-[10%] rounded-full"
      />
    </div>
  );
});

TimelineLine.displayName = 'TimelineLine';

// Extracted Timeline Dot Component
const TimelineDot = React.memo(() => {
  return (
    <div className="absolute flex items-center justify-center w-3 h-3 rounded-full -left-1.5 bg-purple-500 border-2 border-white">
    </div>
  );
});

TimelineDot.displayName = 'TimelineDot';

// Main Timeline Item Component
const TimelineItem = React.memo(({ item, index }) => {
  return (
    <div className="relative pl-10 py-4">
      {/* Timeline dot */}
      <div className="absolute left-3 top-6">
        <TimelineDot />
      </div>

      {/* Date - on the same line as title */}
      <div className="flex items-start gap-3 mb-3">
        <h3 className="text-xl font-bold text-purple-400 min-w-20">{item.date}</h3>
        <div>
          <h3 className="text-2xl font-semibold text-neutral-100 mb-1">{item.title}</h3>
          <h3 className="text-xl text-neutral-400 mb-2">{item.job}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 ml-20">
        {item.contents.map((content, contentIndex) => (
          <p className="text-lg leading-relaxed text-neutral-300" key={contentIndex}>
            {content}
          </p>
        ))}
      </div>
    </div>
  );
});

TimelineItem.displayName = 'TimelineItem';

// Main Timeline Component
export const Timeline = ({ data }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);
  const rafRef = useRef();
  const resizeObserverRef = useRef();

  // Optimized height calculation
  const calculateHeight = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, []);

  // Debounced height update
  const updateHeight = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(calculateHeight);
  }, [calculateHeight]);

  // Setup resize observer and initial height
  useEffect(() => {
    updateHeight();

    // Use ResizeObserver for efficient size tracking
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserverRef.current = new ResizeObserver(updateHeight);
      if (ref.current) {
        resizeObserverRef.current.observe(ref.current);
      }
    }

    // Fallback for window resize
    const handleWindowResize = () => {
      updateHeight();
    };

    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [updateHeight]);

  // Optimized scroll configuration
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  // Memoized timeline items render
  const renderTimelineItems = useCallback(() => {
    return data.map((item, index) => (
      <TimelineItem 
        key={`${item.date}-${item.title}-${index}`} 
        item={item} 
        index={index} 
      />
    ));
  }, [data]);

  return (
    <section className="relative c-space section-spacing -mt-16" ref={containerRef}>
      {/* Title with same style as Projects */}
      <h2 className="text-heading">My Work Experience</h2>
      
      {/* Divider line like Projects section */}
      <div className="bg-gradient-to-r from-transparent via-neutral-700 to-transparent mt-12 h-[1px] w-full" />
      
      {/* Timeline Content */}
      <div className="relative" ref={ref}>
        {renderTimelineItems()}
        <TimelineLine 
          height={height} 
          heightTransform={heightTransform} 
          opacityTransform={opacityTransform} 
        />
      </div>
    </section>
  );
};

export default Timeline;