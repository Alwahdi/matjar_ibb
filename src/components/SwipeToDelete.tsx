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
  deleteConfirmation?: {
    title?: string;
    description?: string;
  };
}

export function SwipeToDelete({ 
  children, 
  onDelete, 
  className, 
  threshold = 60,
  shareData,
  deleteConfirmation
}: SwipeToDeleteProps) {
  return (
    <SwipeActions
      onDelete={onDelete}
      shareData={shareData}
      deleteConfirmation={deleteConfirmation}
      className={className}
    >
      {children}
    </SwipeActions>
  );
}