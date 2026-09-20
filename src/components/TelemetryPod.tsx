import React, { ReactNode } from 'react';

interface TelemetryPodProps {
  label: string;
  subLabel?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function TelemetryPod({
  label,
  subLabel,
  children,
  style,
  className = '',
}: TelemetryPodProps) {
  return (
    <div className={`instrument-pod ${className}`} style={style}>
      <div className="pod-label">
        <span>{label}</span>
        {subLabel && <span style={{ color: 'var(--text-off)' }}>{subLabel}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}
