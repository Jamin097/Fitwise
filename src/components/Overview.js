// Overview.js - Clean version without daily steps toggle

import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "./styles/Overview.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const Overview = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [stats, setStats] = useState({
    totalTime: 0,
    totalSteps: 0,
    targetSteps: 0,
    currentMonth: "May",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFitnessData();
  }, []);

  const loadFitnessData = () => {
    try {
      const historyRaw = localStorage.getItem("fit_history_v1");
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        updateChart(history.labels || [], history.steps || []);
        updateStats(history);
      } else {
        loadDemoData();
      }
    } catch {
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
    const steps = [3200, 4800, 7200, 8900, 9178, 10500, 12800, 14200];
    updateChart(labels, steps);
    updateStats({ totalSteps: 9178, targetSteps: 9200, totalTime: 748 });
  };

  const updateChart = (labels, steps) => {
    setChartData({
      labels,
      datasets: [
        {
          label: "Steps",
          data: steps,
          fill: true,
          tension: 0.4,
          backgroundColor: "rgba(106, 76, 147, 0.2)",
          borderColor: "#6a4c93",
          borderWidth: 3,
          pointBackgroundColor: "#ff6f61",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 6,
        },
      ],
    });
  };

  const updateStats = (history) => {
    setStats({
      totalTime: history.totalTime || 748,
      totalSteps: history.totalSteps || 9178,
      targetSteps: history.targetSteps || 9200,
      currentMonth: history.currentMonth || "May",
    });
  };

  const StatCard = ({ title, value, progress, color }) => (
    <div className="stat-card">
      <div className="stat-header">
        <h3>{title}</h3>
        <span className={`stat-badge ${color}`}>{value}</span>
      </div>

      <div className="progress-container" data-progress={progress}>
        <div className="progress-bar">
          <div className="progress-fill" />
        </div>
        <span className="progress-text">{progress}%</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="overview loading">
        <div className="spinner" />
        <p>Loading your fitness overview...</p>
      </div>
    );
  }

  const OverviewHeader = () => (
    <div className="overview-local-header">
      <h1 className="overview-logo">Fitwise</h1>
    </div>
  );

  return (
    <>
      <OverviewHeader />

      <div className="overview">
        <div className="overview-header">
          <h1>Your Fitness Journey</h1>
          <p>Track your progress with AI-powered insights</p>
        </div>

        <div className="stats-grid">
          <StatCard
            title="Total Workout Time"
            value={`${stats.totalTime} hrs`}
            progress={75}
            color="time"
          />
          <StatCard
            title="Total Steps"
            value={stats.totalSteps.toLocaleString()}
            progress={90}
            color="steps"
          />
          <StatCard
            title="Target Achievement"
            value={stats.targetSteps.toLocaleString()}
            progress={95}
            color="target"
          />
        </div>

        <br />
        <h3 align="left">Steps Record 2025</h3>
        <div className="chart-container">
          <div className="chart-wrapper">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: "top" },
                },
                scales: {
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
  