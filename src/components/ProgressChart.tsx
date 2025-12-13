import * as React from 'react';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';

type Props = {
  challengeId: string;
  challengeTitle: string;
  challengeDuration: number;
};

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ProgressChart({ challengeId, challengeTitle, challengeDuration }: Props) {
  const { currentUser } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch only the current user's progress for this challenge, ordered by day
    const q = query(
      collection(db, "progress"),
      where("challengeId", "==", challengeId),
      where("userId", "==", currentUser.uid),
      orderBy("day", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const progressMap = {};
      const labels = Array.from({ length: challengeDuration }, (_, i) => `Day ${i + 1}`);
      const dataPoints = new Array(challengeDuration).fill(0);
      
      snapshot.forEach(doc => {
        progressMap[doc.data().day] = doc.data().value;
      });

      // Map progress values to the correct day index (day 1 is index 0)
      for(let i = 0; i < challengeDuration; i++) {
        const day = i + 1;
        if (progressMap[day]) {
            dataPoints[i] = progressMap[day];
        }
      }

      setChartData({
        labels,
        datasets: [
          {
            label: 'Your Daily Value',
            data: dataPoints,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      });
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chart data: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [challengeId, currentUser, challengeDuration]);

  if (loading) return <div className="muted">Loading chart…</div>;
  if (!chartData) return <div className="muted">No progress logged yet.</div>;

  const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: `Weekly Progress for ${challengeTitle}` },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Value Logged' },
      },
      x: {
        title: { display: true, text: 'Challenge Day' },
      },
    },
  };

  return (
    <div style={{ marginTop: 10 }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
