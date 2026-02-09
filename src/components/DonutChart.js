// DonutChart.js
import React, { useEffect, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const storageKey = 'fit_donut_v1'; // optional custom storage

const DonutChart = ({ dataOverrides }) => {
  const defaultData = {
    labels: ['Cardio', 'Stretching', 'Treadmill', 'Strength'],
    datasets: [{
      data: [30, 40, 30, 20],
      backgroundColor: ['#00b894', '#fdcb6e', '#e17055', '#6c5ce7'],
    }]
  };

  const [data, setData] = useState(dataOverrides || defaultData);

  useEffect(() => {
    // if something saved in LS (from friends widget), load it
    const raw = localStorage.getItem(storageKey);
    if (raw && !dataOverrides) {
      try {
        setData(JSON.parse(raw));
      } catch (e) {
        // ignore
      }
    }
  }, [dataOverrides]);

  useEffect(() => {
    // save so other parts can update if desired
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  const options = {
    cutout: '60%',
    plugins: {
      legend: { display: true, position: 'right' }
    },
    maintainAspectRatio: false
  };

  return (
    <div style={{ width: '100%', height: 300 }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DonutChart;
