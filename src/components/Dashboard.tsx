import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateChallenge from './CreateChallenge';
import ChallengeItem from './ChallengeItem';
import StatsCard from './StatsCard';
import Layout from './Layout';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import type { Challenge } from '../types';

// Helper function to calculate stats
const calculateStats = (challenges: Challenge[]) => {
    let active = 0;
    let completed = 0;
    // NOTE: This assumes a challenge is 'completed' if the current day is past the duration.
    // For MVP simplicity, we'll just count total challenges created.
    
    // Total created is just the length of the array
    const totalCreated = challenges.length;

    // For a more accurate "Completed" count, you'd need to compare
    // current date with challenge start date + duration, 
    // and check if all days have been logged.
    
    // For MVP, assume a challenge is 'active' if it's less than 60 days
    challenges.forEach(c => {
        if (c.duration <= 30) {
            active++;
        } else {
            completed++;
        }
    });


    return {
        totalCreated: totalCreated,
        activeChallenges: challenges.filter(c => c.duration <= 30).length,
        longTermChallenges: challenges.filter(c => c.duration > 30).length,
        // In a real app: completed: challenges.filter(c => c.isCompleted).length
    };
};


export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState({ totalCreated: 0, activeChallenges: 0, longTermChallenges: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  // Fetch challenges for the current user in real-time
  useEffect(() => {
    if (!currentUser) return;

    // Avoid composite-index issues by not ordering in Firestore; we'll sort client-side.
    const q = query(
      collection(db, "challenges"),
      where("ownerId", "==", currentUser.uid)
    );

    setLoadingChallenges(true);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userChallenges: Challenge[] = [];
      querySnapshot.forEach((d) => {
        userChallenges.push({ id: d.id, ...(d.data() as Omit<Challenge, 'id'>) });
      });
      userChallenges.sort((a, b) => {
        const aAny: any = a;
        const bAny: any = b;
        const aMs = aAny.createdAt?.toMillis ? aAny.createdAt.toMillis() : 0;
        const bMs = bAny.createdAt?.toMillis ? bAny.createdAt.toMillis() : 0;
        return bMs - aMs;
      });
      setChallenges(userChallenges);
      setStats(calculateStats(userChallenges)); // Update stats here
      setLoadingChallenges(false);
    }, (error) => {
      console.error("Error fetching challenges: ", error);
      setLoadingChallenges(false);
    });

    return () => unsubscribe();
  }, [currentUser]); 

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      console.error("Failed to log out");
    }
  };

  return (
    <Layout title="Your challenges">
      <div className="row">
        <div>
          <h2 className="h1">Dashboard</h2>
          <div className="subtle">Create challenges, log progress, climb the leaderboard.</div>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">Log Out</button>
      </div>

      <div className="stats">
        <StatsCard title="Total Challenges" value={stats.totalCreated} color="rgba(34,211,238,0.95)" />
        <StatsCard title="Active (<=30 days)" value={stats.activeChallenges} color="rgba(52,211,153,0.95)" />
        <StatsCard title="Long-Term (>30 days)" value={stats.longTermChallenges} color="rgba(124,58,237,0.95)" />
      </div>

      <div className="card" style={{ margin: '12px 0' }}>
        <div className="card-inner">
          {!showCreate ? (
            <button onClick={() => setShowCreate(true)} className="btn btn-primary">
              ➕ Create a Challenge
            </button>
          ) : (
            <CreateChallenge onClose={() => setShowCreate(false)} />
          )}
        </div>
      </div>

      <h3 style={{ marginTop: 18 }}>My Created Challenges ({challenges.length})</h3>

      {loadingChallenges ? (
        <div className="card">
          <div className="card-inner muted">Loading your challenges…</div>
        </div>
      ) : challenges.length > 0 ? (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Goal</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <ChallengeItem key={challenge.id} challenge={challenge} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card">
          <div className="card-inner muted">Create your first challenge above.</div>
        </div>
      )}
    </Layout>
  );
}
