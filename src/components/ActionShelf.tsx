import React, { ReactNode } from 'react';

interface ActionShelfProps {
  children: ReactNode;
}

export function ActionShelf({ children }: ActionShelfProps) {
  return <footer className="action-shelf">{children}</footer>;
}
