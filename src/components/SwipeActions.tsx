import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Share2, MessageCircle, Mail, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SwipeActionsProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onShare?: () => void;
  className?: string;
  shareData?: {
    title: string;
    text: string;
    url: string;
  };
}

const SwipeActions: React.FC<SwipeActionsProps> = ({
  children,
  onDelete,
  onShare,
  className,
  shareData
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);

  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 120;

  const shareOptions = [
    {
      name: 'نسخ الرابط',
      icon: Copy,
      action: () => {
        if (shareData?.url) {
          navigator.clipboard.writeText(shareData.url);
          toast({ title: 'تم نسخ الرابط', description: 'تم نسخ رابط العقار إلى الحافظة' });
        }
      }
    },
    {
      name: 'واتساب',
      icon: MessageCircle,
      action: () => {
        if (shareData) {
          const message = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    },
    {
      name: 'البريد الإلكتروني',
      icon: Mail,
      action: () => {
        if (shareData) {
          const subject = encodeURIComponent(shareData.title);
          const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
          window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        }
      }
    },
    {
      name: 'فتح في متصفح جديد',
      icon: ExternalLink,
      action: () => {
        if (shareData?.url) {
          window.open(shareData.url, '_blank');
        }
      }
    }
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startX.current = e.touches[0].clientX;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    
    // Limit swipe distance and apply resistance
    const limitedDeltaX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX * 0.8));
    setTranslateX(limitedDeltaX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX.current - startX.current;

    if (deltaX < -SWIPE_THRESHOLD) {
      // Swipe left - Delete action
      if (onDelete) {
        onDelete();
      }
    } else if (deltaX > SWIPE_THRESHOLD) {
      // Swipe right - Share action
      if (onShare) {
        onShare();
      } else {
        setShowShareSheet(true);
      }
    }

    // Reset position
    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    currentX.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    currentX.current = e.clientX;
    const deltaX = currentX.current - startX.current;
    
    const limitedDeltaX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX * 0.8));
    setTranslateX(limitedDeltaX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = currentX.current - startX.current;

    if (deltaX < -SWIPE_THRESHOLD) {
      if (onDelete) {
        onDelete();
      }
    } else if (deltaX > SWIPE_THRESHOLD) {
      if (onShare) {
        onShare();
      } else {
        setShowShareSheet(true);
      }
    }

    setTranslateX(0);
  };

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      if (isDragging) {
        currentX.current = e.clientX;
        const deltaX = currentX.current - startX.current;
        const limitedDeltaX = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX * 0.8));
        setTranslateX(limitedDeltaX);
      }
    };

    const handleMouseUpGlobal = () => {
      if (isDragging) {
        setIsDragging(false);
        const deltaX = currentX.current - startX.current;

        if (deltaX < -SWIPE_THRESHOLD && onDelete) {
          onDelete();
        } else if (deltaX > SWIPE_THRESHOLD) {
          if (onShare) {
            onShare();
          } else {
            setShowShareSheet(true);
          }
        }

        setTranslateX(0);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMoveGlobal);
      document.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMoveGlobal);
      document.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, onDelete, onShare]);

  return (
    <>
      <div className={cn("relative overflow-hidden", className)}>
        {/* Action backgrounds */}
        <div className="absolute inset-0 flex">
          {/* Share background (right swipe) */}
          <div 
            className={cn(
              "flex items-center justify-start pl-4 bg-green-500/20 transition-opacity duration-200",
              translateX > 0 ? "opacity-100" : "opacity-0"
            )}
            style={{ width: `${Math.max(0, translateX)}px` }}
          >
            <Share2 className="w-5 h-5 text-green-600" />
          </div>
          
          {/* Delete background (left swipe) */}
          <div 
            className={cn(
              "flex items-center justify-end pr-4 bg-red-500/20 transition-opacity duration-200 ml-auto",
              translateX < 0 ? "opacity-100" : "opacity-0"
            )}
            style={{ width: `${Math.max(0, -translateX)}px` }}
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
        </div>

        {/* Main content */}
        <div
          ref={containerRef}
          className={cn(
            "relative z-10 transition-transform duration-200 select-none",
            isDragging ? "transition-none" : ""
          )}
          style={{ transform: `translateX(${translateX}px)` }}
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

      {/* Share Sheet */}
      <Sheet open={showShareSheet} onOpenChange={setShowShareSheet}>
        <SheetContent side="bottom" className="h-auto">
          <SheetHeader>
            <SheetTitle className="font-arabic text-right">مشاركة العقار</SheetTitle>
            <SheetDescription className="font-arabic text-right">
              اختر طريقة المشاركة المفضلة لديك
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid grid-cols-2 gap-4 mt-6 pb-6">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.name}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 font-arabic"
                  onClick={() => {
                    option.action();
                    setShowShareSheet(false);
                  }}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm">{option.name}</span>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SwipeActions;