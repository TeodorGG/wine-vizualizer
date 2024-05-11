import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
  } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

export default function ChartDataSample( { data, title } ) {

    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' ,
          },
          title: {
            display: true,
            text: title,
            color: 'white',
            font: {
              size: 24,
            }
          },
        },
      };
      
    
      return <Bar options={options} data={data} />;
  }
  
 export function KeywordsChart({ data, title }) {
    const labels = Object.keys(data);
    const values = Object.values(data);
  
    const chartData = {
      labels,
      datasets: [
        {
          label: 'Frecvența cuvintelor cheie la ' + title,
          data: values,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }
      ]
    };
  
    return <Bar data={chartData} />;
  }