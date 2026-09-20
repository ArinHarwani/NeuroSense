import React from 'react';

export function DemoBadge({ label = 'DEMO' }: { label?: string }) {
  return (
    <span className="demo-chip" title="Simulated results, not forensic">
      <span className="demo-chip-dot" />
      {label}
    </span>
  );
}
