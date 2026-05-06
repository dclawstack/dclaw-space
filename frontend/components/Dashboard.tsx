'use client';
import { useState } from 'react';
import { optimizeLayout, getHeatmap } from '@/lib/api';

export default function Dashboard() {
  const [floorPlanId, setFloorPlanId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = async () => {
    setLoading(true);
    try {
      const data = await optimizeLayout(floorPlanId);
      setResult(data);
      const h = await getHeatmap(data.id);
      setHeatmap(h);
    } catch (e) {
      alert('Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{padding:40,maxWidth:800}}>
      <div style={{display:'flex',gap:12,marginBottom:24}}>
        <input placeholder="Floor plan ID" value={floorPlanId} onChange={e => setFloorPlanId(e.target.value)}
          style={{padding:'10px 16px',borderRadius:8,border:'1px solid #334155',background:'#1e293b',color:'#f8fafc',minWidth:240}} />
        <button onClick={handleOptimize} disabled={loading}
          style={{padding:'10px 20px',borderRadius:8,border:'none',background:'#9333EA',color:'#fff',cursor:'pointer'}}>
          {loading ? 'Optimizing...' : 'Optimize Layout'}
        </button>
      </div>

      {result && (
        <div style={{display:'grid',gap:16}}>
          <div style={{padding:20,borderRadius:12,background:'#1e293b',border:'1px solid #334155'}}>
            <h3 style={{marginBottom:12,color:'#9333EA'}}>Space Optimization Result</h3>
            <p><strong>Seats per sqm:</strong> {result.seats_per_sqm}</p>
            <p><strong>Collaboration score:</strong> {result.collaboration_score}</p>
            <p><strong>Quiet zone ratio:</strong> {result.quiet_zone_ratio}</p>
            <p><strong>Redesign suggestions:</strong> {result.redesign_suggestions?.join(', ')}</p>
          </div>
          {heatmap && (
            <div style={{padding:20,borderRadius:12,background:'#1e293b',border:'1px solid #334155'}}>
              <h3 style={{marginBottom:12,color:'#9333EA'}}>Occupancy Heatmap</h3>
              <p>{heatmap.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
