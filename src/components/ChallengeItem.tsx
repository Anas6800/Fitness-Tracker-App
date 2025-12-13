import * as React from 'react';
import { useState } from 'react';
import { db } from '../firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import LogProgress from './LogProgress';
import Leaderboard from './Leaderboard';
import ProgressChart from './ProgressChart';
import ConfirmDialog from './ConfirmDialog';
import type { Challenge } from '../types';

type Props = {
  challenge: Challenge;
};

export default function ChallengeItem({ challenge }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // --- State for Editing ---
  const [newTitle, setNewTitle] = useState(challenge.title);
  const [newGoal, setNewGoal] = useState(challenge.goal);
  const [newDuration, setNewDuration] = useState<number>(challenge.duration);
  const [loading, setLoading] = useState(false);
  // -------------------------

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "challenges", challenge.id));
      setConfirmDeleteOpen(false);
    } catch (e) {
      console.error("Error deleting document: ", e);
      alert("Failed to delete challenge.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateDoc(doc(db, "challenges", challenge.id), {
        title: newTitle,
        goal: newGoal,
        duration: newDuration,
      });
      setIsEditing(false);
    } catch (e) {
      console.error("Error updating document: ", e);
      alert("Failed to update challenge.");
    } finally {
      setLoading(false);
    }
  };

  const handleProgressLogged = () => {
    // This function is for cleanup/UI feedback, actual data refresh is handled by onSnapshot
    console.log("Progress logged successfully!");
  };
  
  const gradient = (g: string): React.CSSProperties => ({ background: g });

  if (isEditing) {
    return (
      <tr>
        <td colSpan={4}>
          <div className="card">
            <div className="card-inner">
              <div className="row" style={{ alignItems: 'baseline' }}>
                <div>
                  <div className="expander-title">Edit challenge</div>
                  <div className="expander-sub">Update the title, goal, or duration.</div>
                </div>
              </div>

              <form onSubmit={handleUpdate} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 120px', gap: 10, marginTop: 12 }}>
                <input className="input" type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                <input className="input" type="text" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} required />
                <input className="input" type="number" value={newDuration} onChange={(e) => setNewDuration(parseInt(e.target.value || '0', 10))} min={1} required />

                <div style={{ gridColumn: '1 / 4', display: 'flex', gap: 10, marginTop: 2 }}>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-sm">
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} disabled={loading} className="btn btn-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete challenge?"
        description={`This will permanently delete “${challenge.title}”. This can’t be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <tr>
        <td>{challenge.title}</td>
        <td className="muted">{challenge.goal}</td>
        <td>{challenge.duration} days</td>
        <td>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <button
              onClick={() => setShowLog(!showLog)}
              className="btn btn-sm"
              style={gradient('linear-gradient(135deg, rgba(34,211,238,0.9), rgba(255,255,255,0.06))')}
            >
              {showLog ? 'Hide logger' : 'Log progress'}
            </button>
            <button
              onClick={() => setShowChart(!showChart)}
              className="btn btn-sm"
              style={gradient('linear-gradient(135deg, rgba(124,58,237,0.9), rgba(255,255,255,0.06))')}
            >
              {showChart ? 'Hide chart' : 'View chart'}
            </button>
            <button
              onClick={() => setShowLeaderboard(!showLeaderboard)}
              className="btn btn-sm"
              style={gradient('linear-gradient(135deg, rgba(52,211,153,0.9), rgba(255,255,255,0.06))')}
            >
              {showLeaderboard ? 'Hide leaderboard' : 'View leaderboard'}
            </button>
            <button onClick={() => setIsEditing(true)} className="btn btn-sm">
              Edit
            </button>
            <button onClick={() => setConfirmDeleteOpen(true)} disabled={loading} className="btn btn-danger btn-sm">
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </td>
      </tr>
      {/* Expanded row for forms/visualization */}
      {(showLog || showLeaderboard || showChart) && (
        <tr>
          <td colSpan={4}>
            {showLog ? (
              <div className="expander">
                <div className="expander-title">Log progress</div>
                <LogProgress
                  challengeId={challenge.id}
                  challengeDuration={challenge.duration}
                  onLogged={handleProgressLogged}
                  onCancel={() => setShowLog(false)}
                />
              </div>
            ) : null}

            {showChart ? (
              <div className="expander">
                <div className="expander-title">Your chart</div>
                <div className="expander-sub">A quick view of your daily progress.</div>
                <ProgressChart challengeId={challenge.id} challengeTitle={challenge.title} challengeDuration={challenge.duration} />
              </div>
            ) : null}

            {showLeaderboard ? (
              <div className="expander">
                <div className="expander-title">Leaderboard</div>
                <div className="expander-sub">See how participants rank for this challenge.</div>
                <Leaderboard challengeId={challenge.id} challengeTitle={challenge.title} challengeDuration={challenge.duration} />
              </div>
            ) : null}
          </td>
        </tr>
      )}
    </>
  );
}
