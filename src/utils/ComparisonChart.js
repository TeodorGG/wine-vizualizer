import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

// Register the plugins for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function ComparisonChart({ comparisonResults, compareCriteria }) {
    const criteriaKeys = Object.keys(compareCriteria).filter(key => compareCriteria[key]);
    const labels = criteriaKeys.map(key => {
      switch(key) {
        case 'vintage': return 'vintage';
        case 'type': return 'Tip Vin';
        case 'alcoholLevel': return 'Nivel Alcool';
        default: return key;
      }
    });

    // Calculate sum and average for each country and criteria
    const datasets = ['country1', 'country2'].map((country, idx) => {
      return {
        label: `Țara ${idx + 1} (${comparisonResults[country].length} vinuri)`,
        data: labels.map(label => {
          const total = comparisonResults[country].reduce((sum, wine) => {
            const value = parseFloat(wine[label]);
            return sum + (isNaN(value) ? 0 : value);
          }, 0);
          return total / comparisonResults[country].length;
        }),
        backgroundColor: idx === 0 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(54, 162, 235, 0.5)',
        borderColor: idx === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      };
    });

    const data = {
      labels,
      datasets
    };

    const options = {
      indexAxis: 'y',  // Makes the bar chart horizontal
      plugins: {
        datalabels: {
          color: '#000',
          anchor: 'end',
          align: 'top',
          formatter: (value, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = (value / total * 100).toFixed(2) + '%';
            return percentage;
          }
        },
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          enabled: true
        }
      },
      scales: {
        x: {
          beginAtZero: true
        }
      },
      maintainAspectRatio: false
    };

    return <Bar data={data} options={options} style={{ backgroundColor: "white", height: "500px", width: "100%" }} />;
}

export default ComparisonChart;
