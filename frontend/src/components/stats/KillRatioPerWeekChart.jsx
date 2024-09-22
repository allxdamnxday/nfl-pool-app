import React, { useState, useEffect } from 'react';
import { getKillRatioPerWeek } from '../../services/statsService';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './KillRatioPerWeekChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function KillRatioPerWeekChart({ poolId, week }) {
  const [killRatioData, setKillRatioData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getKillRatioPerWeek(poolId, week);
        if (response.success && Array.isArray(response.data)) {
          setKillRatioData(response.data);
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        console.error('Error fetching kill ratio data:', error);
        setError('Failed to fetch kill ratio data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [poolId, week]);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!killRatioData.length) return <div className="no-data">No data available</div>;

  const chartData = {
    labels: killRatioData.map(item => item.teamName),
    datasets: [
      {
        label: 'Elim',
        data: killRatioData.map(item => parseFloat(item.killRatio)),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgb(255, 99, 132)',
        borderWidth: 1
      },
      {
        label: 'Pick Won',
        data: killRatioData.map(item => parseFloat(item.successRatio)),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Elimination Ratio',
        font: {
          size: 18,
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Percentage'
        },
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      }
    }
  };

  return (
    <div className="kill-ratio-chart-container">
      <h2 className="chart-title">Elimination Ratio and Win Ratio Per Team</h2>
      <div className="chart-wrapper">
        <Bar data={chartData} options={options} />
      </div>
      <div className="table-wrapper">
        <table className="kill-ratio-table">
          <thead>
            <tr>
              <th>Team</th>
              <th>Eliminations</th>
              <th>Successful Picks</th>
              <th>% Elim</th>
              <th>% Safe</th>
            </tr>
          </thead>
          <tbody>
            {killRatioData.map((item, index) => (
              <tr key={index}>
                <td>{item.teamName}</td>
                <td>{item.eliminations}</td>
                <td>{item.successfulPicks}</td>
                <td>{item.killRatio}</td>
                <td>{item.successRatio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KillRatioPerWeekChart;