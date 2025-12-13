import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import type { Challenge } from '../types';
import Layout from './Layout';
import LogProgress from './LogProgress';
import Leaderboard from './Leaderboard';
import ProgressChart from './ProgressChart';

export default function ExploreChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const rows: Challenge[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Challenge, 'id'>) }));
      setChallenges(rows);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return challenges;
    return challenges.filter((c) => (c.title ?? '').toLowerCase().includes(s) || (c.goal ?? '').toLowerCase().includes(s));
  }, [challenges, search]);

  return (
    <Layout title="Browse challenges and join by logging progress">
      <div className="row" style={{ alignItems: 'baseline' }}>
        <div>
          <h2 className="h1">Explore</h2>
          <div className="subtle">Find a challenge. Log progress. Compete globally.</div>
        </div>
        <input
          className="input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search challenges…"
          style={{ width: 360, maxWidth: '100%' }}
        />
      </div>

      <div className="grid" style={{ marginTop: 14 }}>
        {filtered.map((c) => (
          <ChallengeCard key={c.id} challenge={c} />
        ))}
        {filtered.length === 0 ? (
          <div className="card">
            <div className="card-inner muted">No challenges found.</div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const [showLog, setShowLog] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  return (
    <div className="card">
      <div className="card-inner">
        <div className="row" style={{ alignItems: 'baseline' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{challenge.title}</div>
            <div className="muted" style={{ marginTop: 4 }}>{challenge.goal}</div>
            <div className="subtle" style={{ marginTop: 10 }}>Duration: {challenge.duration} days</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
          <button
            onClick={() => setShowLog((v) => !v)}
            className="btn"
            style={{ background: 'linear-gradient(135deg, rgba(34,211,238,0.9), rgba(255,255,255,0.06))' }}
          >
            {showLog ? 'Hide Logger' : 'Log Progress'}
          </button>
          <button
            onClick={() => setShowChart((v) => !v)}
            className="btn"
            style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(255,255,255,0.06))' }}
          >
            {showChart ? 'Hide Chart' : 'My Chart'}
          </button>
          <button
            onClick={() => setShowLeaderboard((v) => !v)}
            className="btn"
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.9), rgba(255,255,255,0.06))' }}
          >
            {showLeaderboard ? 'Hide Leaderboard' : 'Leaderboard'}
          </button>
        </div>

        {showLog ? (
          <LogProgress
            challengeId={challenge.id}
            challengeDuration={challenge.duration}
            onLogged={() => void 0}
            onCancel={() => setShowLog(false)}
          />
        ) : null}

        {showChart ? (
          <div style={{ marginTop: 10 }}>
            <ProgressChart challengeId={challenge.id} challengeTitle={challenge.title} challengeDuration={challenge.duration} />
          </div>
        ) : null}

        {showLeaderboard ? (
          <div style={{ marginTop: 10 }}>
            <Leaderboard challengeId={challenge.id} challengeTitle={challenge.title} challengeDuration={challenge.duration} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
