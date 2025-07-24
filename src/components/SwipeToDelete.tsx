import React from 'react';
import SwipeActions from './SwipeActions';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
  threshold?: number;
  shareData?: {
    title: string;
    text: string;
    url: string;
  };
}

export function SwipeToDelete({ 
  children, 
  onDelete, 
  className, 
  threshold = 80,
  shareData
}: SwipeToDeleteProps) {
  return (
    <SwipeActions
      onDelete={onDelete}
      shareData={shareData}
      className={className}
    >
      {children}
    </SwipeActions>
  );
}