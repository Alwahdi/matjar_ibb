import { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
  threshold?: number;
}

export function SwipeToDelete({ 
  children, 
  onDelete, 
  className, 
  threshold = 80 
}: SwipeToDeleteProps) {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const distance = startX - currentX;
    
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, threshold * 1.5));
      setIsSwipeActive(distance > threshold * 0.3);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    if (swipeDistance > threshold) {
      onDelete();
    }
    
    setSwipeDistance(0);
    setIsSwipeActive(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const distance = startX - currentX;
    
    if (distance > 0) {
      setSwipeDistance(Math.min(distance, threshold * 1.5));
      setIsSwipeActive(distance > threshold * 0.3);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    if (swipeDistance > threshold) {
      onDelete();
    }
    
    setSwipeDistance(0);
    setIsSwipeActive(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const currentX = e.clientX;
        const distance = startX - currentX;
        
        if (distance > 0) {
          setSwipeDistance(Math.min(distance, threshold * 1.5));
          setIsSwipeActive(distance > threshold * 0.3);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        
        if (swipeDistance > threshold) {
          onDelete();
        }
        
        setSwipeDistance(0);
        setIsSwipeActive(false);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, startX, swipeDistance, threshold, onDelete]);

  return (
    <div className={cn("relative overflow-hidden", className)} ref={containerRef}>
      {/* Delete action background */}
      <div 
        className="absolute inset-y-0 right-0 bg-red-500 flex items-center justify-center text-white transition-all duration-200"
        style={{ 
          width: `${Math.min(swipeDistance, threshold)}px`,
          opacity: isSwipeActive ? 1 : 0.6
        }}
      >
        <Trash2 className="w-5 h-5" />
      </div>

      {/* Main content */}
      <div
        className="relative transition-transform duration-200 select-none"
        style={{ 
          transform: `translateX(-${swipeDistance}px)`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {children}
      </div>
    </div>
  );
}