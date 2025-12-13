import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import type { ProgressEntry } from '../types';

type Props = {
  challengeId: string;
  challengeDuration: number;
  onLogged: () => void;
  onCancel: () => void;
};

export default function LogProgress({ challengeId, challengeDuration, onLogged, onCancel }: Props) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myProgress, setMyProgress] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(collection(db, 'progress'), where('userId', '==', currentUser.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: ProgressEntry[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProgressEntry, 'id'>) }));
        setMyProgress(rows.filter((p) => p.challengeId === challengeId));
      },
      (e) => {
        console.error('Error fetching progress: ', e);
        setError('Could not load progress.');
      },
    );

    return () => unsub();
  }, [currentUser, challengeId]);

  const completedDays = useMemo(() => {
    const set = new Set<number>();
    for (const p of myProgress) set.add(p.day);
    return set;
  }, [myProgress]);

  const toggleDay = async (day: number) => {
    try {
      setError('');
      if (!currentUser) return;
      setLoading(true);

      const progressId = `${challengeId}_${currentUser.uid}_${day}`;

      if (completedDays.has(day)) {
        await deleteDoc(doc(db, 'progress', progressId));
      } else {
        await setDoc(doc(db, 'progress', progressId), {
          challengeId,
          userId: currentUser.uid,
          day,
          value: 1,
          dateLogged: serverTimestamp(),
        });
      }

      onLogged();
    } catch (e) {
      console.error('Error updating progress: ', e);
      setError('Failed to update progress.');
    } finally {
      setLoading(false);
    }
  };

  const completedCount = completedDays.size;
  const percent = challengeDuration > 0 ? Math.round((completedCount / challengeDuration) * 100) : 0;

  return (
    <div style={{ marginTop: 10 }}>
      {error ? <div className="error">{error}</div> : null}

      <div className="row" style={{ alignItems: 'baseline', marginTop: error ? 10 : 0 }}>
        <div className="subtle">Tap a day to mark it done. Tap again to undo.</div>
        <div className="subtle">
          {completedCount}/{challengeDuration} days • {percent}%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(44px, 1fr))', gap: 10, marginTop: 12 }}>
        {Array.from({ length: challengeDuration }, (_, i) => i + 1).map((day) => {
          const done = completedDays.has(day);
          return (
            <button
              key={day}
              className="btn btn-sm"
              disabled={loading}
              onClick={() => void toggleDay(day)}
              title={done ? `Day ${day} (done)` : `Day ${day} (not done)`}
              style={{
                justifyContent: 'center',
                minWidth: 44,
                padding: '10px 0',
                background: done
                  ? 'linear-gradient(135deg, rgba(52,211,153,0.95), rgba(255,255,255,0.06))'
                  : 'rgba(255,255,255,0.06)',
                borderColor: done ? 'rgba(52,211,153,0.35)' : 'rgba(255,255,255,0.16)',
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="row" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
        <button type="button" onClick={onCancel} className="btn btn-sm">
          Done
        </button>
      </div>
    </div>
  );
}
