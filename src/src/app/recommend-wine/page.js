"use client"

import React, { useState } from 'react';
import styles from './page.module.css';
export const dynamic = "force-dynamic"

export default function RecommendWine() {
  const [description, setDescription] = useState('');
  const [results, setResults] = useState([]);

  const handleSubmit = async () => {
    const response = await fetch(`api/search?keywords=${encodeURIComponent(description)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  
    const data = await response.json();

    setResults(data.results);
  };

  const handleWineClick = (id) => {
    window.open(`https://awards.decanter.com/DWWA/2023/wines/${id}`, '_blank');
  };

  return (
    <main className={styles.main}>
      <h1>Recomandare de vin</h1>
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Introduceți descrierea vinului aici"
        className={styles.input}
      />
      <button onClick={handleSubmit} className={styles.button}>Caută vin</button>
      {results.length > 0 && (
        <div className={styles.results}>
          <h2>Rezultate:</h2>
          <ul>
            {results.map((wine, index) => (
              <li className={styles.item}  key={index} onClick={() => handleWineClick(wine.id)} style={{ cursor: 'pointer' }}>
                <h3>{wine.name || 'Nume necunoscut'}</h3>
                <p>Anul: {wine.vintage}</p>
                <p>Producător: {wine.producer || 'Producător necunoscut'}</p>
                <p>Țara: {wine.country}</p>
                <p>Stil: {wine.style}</p>
                <p>Note de degustare: {wine.tastingNotes}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}