import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function StatsCharts({ users, plans }) {
  
  const goalsCount = plans.reduce((acc, p) => {
    acc[p.goal] = (acc[p.goal] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="card">
      <h3>📊 Platform Insights</h3>

      <Bar
        data={{
          labels: Object.keys(goalsCount),
          datasets: [
            {
              label: "Plans per Goal",
              data: Object.values(goalsCount),
              backgroundColor: "#4facfe"
            }
          ]
        }}
      />

      
    </div>
  );
}
