import * as React from 'react';

type Props = {
  title: string;
  value: number;
  color: string;
};

const cardStyle: React.CSSProperties = {
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  textAlign: 'center',
  backgroundColor: 'white',
  flex: '1 1 200px',
  margin: '10px',
};

export default function StatsCard({ title, value, color }: Props) {
  return (
    <div className="stat" style={{ boxShadow: 'none' }}>
      <div className="stat-title">{title}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
    </div>
  );
}
