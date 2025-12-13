import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import type { Challenge, ProgressEntry } from '../types';
import Layout from './Layout';

type Row = {
  userId: string;
  userLabel: string;
  totalDaysLogged: number;
  totalDaysPossible: number;
  completionPercentage: number;
};

function maskUser(userId: string) {
  return userId.length <= 8 ? userId : `${userId.slice(0, 5)}...${userId.slice(-2)}`;
}

export default function GlobalLeaderboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubChallenges = onSnapshot(query(collection(db, 'challenges')), (snap) => {
      const rows: Challenge[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Challenge, 'id'>) }));
      setChallenges(rows);
    });

    const unsubProgress = onSnapshot(query(collection(db, 'progress')), (snap) => {
      const rows: ProgressEntry[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProgressEntry, 'id'>) }));
      setProgress(rows);
      setLoading(false);
    });

    return () => {
      unsubChallenges();
      unsubProgress();
    };
  }, []);

  const leaderboard = useMemo(() => {
    // For each user, compute unique (challengeId, day) pairs logged.
    const uniquePerUser = new Map<string, Set<string>>();
    const challengesById = new Map(challenges.map((c) => [c.id, c]));

    for (const p of progress) {
      const key = `${p.challengeId}:${p.day}`;
      const set = uniquePerUser.get(p.userId) ?? new Set<string>();
      set.add(key);
      uniquePerUser.set(p.userId, set);
    }

    const rows: Row[] = [];
    for (const [userId, set] of uniquePerUser.entries()) {
      // totalDaysPossible: sum durations of challenges where user logged at least one day
      const challengeIds = new Set<string>();
      for (const key of set.values()) {
        challengeIds.add(key.split(':')[0]);
      }

      let totalDaysPossible = 0;
      for (const cid of challengeIds.values()) {
        const ch = challengesById.get(cid);
        if (ch?.duration) totalDaysPossible += ch.duration;
      }

      const totalDaysLogged = set.size;
      const completionPercentage = totalDaysPossible > 0 ? (totalDaysLogged / totalDaysPossible) * 100 : 0;

      rows.push({
        userId,
        userLabel: maskUser(userId),
        totalDaysLogged,
        totalDaysPossible,
        completionPercentage,
      });
    }

    return rows.sort((a, b) => b.completionPercentage - a.completionPercentage);
  }, [challenges, progress]);

  return (
    <Layout title="Global leaderboard (all challenges)">
      <div className="row" style={{ alignItems: 'baseline' }}>
        <div>
          <h2 className="h1">Global Leaderboard</h2>
          <div className="subtle">Ranked by completion % across challenges you participated in.</div>
        </div>
        <div className="user-pill" style={{ borderRadius: 12 }}>
          Tip: log progress on any challenge to appear here.
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, overflow: 'hidden' }}>
        {loading ? (
          <div className="card-inner muted">Loading…</div>
        ) : leaderboard.length === 0 ? (
          <div className="card-inner muted">No progress yet. Log progress on any challenge to appear here.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th style={{ textAlign: 'right' }}>Days Logged</th>
                <th style={{ textAlign: 'right' }}>Possible Days</th>
                <th style={{ textAlign: 'right' }}>% Complete</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((r, idx) => (
                <tr key={r.userId}>
                  <td>{idx + 1}</td>
                  <td>{r.userLabel}</td>
                  <td style={{ textAlign: 'right' }}>{r.totalDaysLogged}</td>
                  <td style={{ textAlign: 'right' }}>{r.totalDaysPossible}</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, color: 'rgba(34,211,238,0.95)' }}>
                    {r.completionPercentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
