import * as React from 'react';
import { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

type Props = {
  onClose: () => void;
};

export default function CreateChallenge({ onClose }: Props) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState<number>(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return setError("Must be logged in to create a challenge.");

    setLoading(true);
    try {
      // Use a client timestamp so the new doc shows up immediately in queries that orderBy(createdAt)
      await addDoc(collection(db, "challenges"), {
        title,
        goal,
        duration,
        ownerId: currentUser.uid,
        createdAt: Timestamp.now(),
      });
      setTitle('');
      setGoal('');
      setDuration(30);
      onClose(); 
    } catch (err) {
      console.error("Error creating challenge: ", err);
      setError("Failed to create challenge. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card-inner">
        <div className="row" style={{ alignItems: 'baseline' }}>
          <h3 className="h2">Create a challenge</h3>
          <span className="subtle">Keep it simple and measurable</span>
        </div>

        {error ? <div className="error" style={{ marginTop: 10 }}>{error}</div> : null}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
          <input className="input" type="text" placeholder="Challenge title (e.g. 10k steps)" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ gridColumn: '1 / 3' }} />
          <input className="input" type="text" placeholder="Goal (e.g. Walk 10,000 steps daily)" value={goal} onChange={(e) => setGoal(e.target.value)} required style={{ gridColumn: '1 / 3' }} />

          <div className="subtle" style={{ alignSelf: 'center' }}>Duration (days)</div>
          <input className="input" type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value || '0', 10))} min={1} required />

          <div style={{ gridColumn: '1 / 3', display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ flexGrow: 1 }}>
              {loading ? 'Creating…' : 'Create'}
            </button>
            <button className="btn" type="button" onClick={onClose} style={{ flexGrow: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
