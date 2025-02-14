import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WorkoutChart = ({ csvData }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!csvData) return;

    // Parse CSV data
    const parsedResult = Papa.parse(csvData, { header: true });

    const { data } = parsedResult;

    const workoutsByMonth = data.reduce((acc, workout) => {
      // Parse the date from 'Workout Timestamp' field (format: '2021-11-22 12:14 (GMT)')
      const timestamp = workout['Workout Timestamp'].split(' (GMT)')[0];
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return acc;
      }

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = {
          total: 0,
          byType: {}
        };
      }
      acc[monthKey].total++;

      const workoutType = workout['Fitness Discipline'] || 'Unknown';
      acc[monthKey].byType[workoutType] = (acc[monthKey].byType[workoutType] || 0) + 1;

      return acc;
    }, {});

    // Sort months chronologically
    const sortedMonths = Object.keys(workoutsByMonth).sort();
    // Get unique workout types
    const workoutTypes = [...new Set(
      Object.values(workoutsByMonth)
        .flatMap(month => Object.keys(month.byType))
    )];

    // Prepare datasets for each workout type
    const datasets = workoutTypes.map(type => ({
      label: type,
      data: sortedMonths.map(month => workoutsByMonth[month].byType[type] || 0),
      fill: false,
      borderColor: getWorkoutColor(type),
      tension: 0.1
    }));

    const finalChartData = {
      labels: sortedMonths,
      datasets
    };

    setChartData(finalChartData);
  }, [csvData]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Workouts by Month and Type'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Workouts'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    }
  };

  // Predefined colors for workout types
  const workoutTypeColors = {
    'Cycling': '#FF4B4B',      // Bright red
    'Stretching': '#4CAF50',   // Green
    'Strength': '#2196F3',     // Blue
    'Meditation': '#9C27B0',   // Purple
    'Yoga': '#FF9800',         // Orange
    'Running': '#795548',      // Brown
    'Walking': '#607D8B',      // Blue grey
    'Bootcamp': '#E91E63',     // Pink
    'Cardio': '#00BCD4',       // Cyan
    'Unknown': '#9E9E9E'       // Grey
  };

  // Helper function to get color for workout type
  function getWorkoutColor(type) {
    // If it's a subtype of cycling (e.g., 'Cycling - Beginner'), use cycling color
    if (type.includes('Cycling')) {
      return workoutTypeColors['Cycling'];
    }
    return workoutTypeColors[type] || workoutTypeColors['Unknown'];
  }

  if (!chartData) return null;

  return (
    <div className="workout-chart">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WorkoutChart;
