import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const calculateProgress = (progressEntries, challengeDuration) => {
  const userProgressMap = {};

  progressEntries.forEach(p => {
    if (!userProgressMap[p.userId]) {
      userProgressMap[p.userId] = new Set();
    }
    userProgressMap[p.userId].add(p.day);
  });

  const leaderboardData = [];
  for (const userId in userProgressMap) {
    const daysLogged = userProgressMap[userId].size;
    const completionPercentage = (daysLogged / challengeDuration) * 100;
    const userName = userId.substring(0, 5) + '...'; 

    leaderboardData.push({
      userId,
      userName,
      daysLogged,
      completionPercentage: completionPercentage.toFixed(1) 
    });
  }

  return leaderboardData.sort((a, b) => b.completionPercentage - a.completionPercentage);
};


export default function Leaderboard({ challengeId, challengeTitle, challengeDuration }) {
  const [progress, setProgress] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "progress"), where("challengeId", "==", challengeId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProgress(entries);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching progress for leaderboard: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [challengeId]);

  useEffect(() => {
    if (progress.length > 0 || !loading) {
        setLeaderboard(calculateProgress(progress, challengeDuration));
    }
  }, [progress, challengeDuration, loading]);


  if (loading) return <div className="muted">Loading leaderboard…</div>;

  return (
    <div style={{ marginTop: 10 }}>
      <div className="row" style={{ alignItems: 'baseline' }}>
        <div>
          <div className="expander-title">🏆 {challengeTitle}</div>
          <div className="expander-sub">Duration: {challengeDuration} days</div>
        </div>
        <div className="subtle">Sorted by completion %</div>
      </div>

      {leaderboard.length === 0 ? (
        <div className="muted" style={{ marginTop: 10 }}>Be the first to log progress!</div>
      ) : (
        <div className="card" style={{ marginTop: 10, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th style={{ textAlign: 'right' }}>Days</th>
                <th style={{ textAlign: 'right' }}>%</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.userId}>
                  <td>{index + 1}</td>
                  <td>{entry.userName}</td>
                  <td style={{ textAlign: 'right' }}>{entry.daysLogged} / {challengeDuration}</td>
                  <td style={{ textAlign: 'right', fontWeight: 900, color: 'rgba(52,211,153,0.95)' }}>
                    {entry.completionPercentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
