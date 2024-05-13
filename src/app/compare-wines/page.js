"use client"
import React, { useState, useEffect, useMemo } from 'react';
import styles from './page.module.css';
import VintageChart from '@/utils/VintageChart';
import ChartDataSample from '@/utils/AlcoolLevelChart';
import { fetchData, processChartData } from '../utils.js';
import { KeywordsChart } from '@/utils/AlcoolLevelChart';
import { API_BASE_URL } from '@/utils/constans';
export const dynamic = "force-dynamic"

export default function CompareWines() {
  const [selectedCriterion, setSelectedCriterion] = useState('countries');
  const [options, setOptions] = useState([]);
  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [chartsData, setChartsData] = useState({ vintage: null, alcool: null, color: null, style: null, organic:null, biodynamic:null, fairtrade:null, closure:null, grape:null, keywords1:null, keywords2:null  });

  useEffect(() => {
    fetchData(`api/unique-values`).then(data => {
      setOptions(data[selectedCriterion]);
    });
  }, [selectedCriterion]); 

  useEffect(() => {
    if (inputValue1 && inputValue2) {
      handleFetchData();
    }
  }, [inputValue1, inputValue2]); 

  const handleInputChange1 = (e) => {
    const value = e.target.value;
    setInputValue1(value);
    if (!value) {
      setSuggestions1([]);
    } else {
      setSuggestions1(options.filter(option => option.toLowerCase().includes(value.toLowerCase())));
    }
  };
  
  const handleInputChange2 = (e) => {
    const value = e.target.value;
    setInputValue2(value);
    if (!value) {
      setSuggestions2([]);
    } else {
      setSuggestions2(options.filter(option => option.toLowerCase().includes(value.toLowerCase())));
    }
  };

  const handleFetchData = async () => {
    const data = await fetchData(`api/compare-data?column=${encodeURIComponent(selectedCriterion)}&values=${encodeURIComponent(inputValue1)},${encodeURIComponent(inputValue2)}`);
    const { firstValue, secondValue } = data;
    setChartsData(processChartData(firstValue, secondValue, inputValue1, inputValue2));
  };



  return (
    <div className={styles.container}>
      <div className={styles.dashed_border}>
        <h1 className={styles.title}>Selectează în baza la ce criteriu vor fi categorizate vinurile</h1>
        <div className="mt-4">
          <label className={styles.criterion_label}>Lista de criterii</label>
          <select className={styles.criterion_select} value={selectedCriterion} onChange={e => setSelectedCriterion(e.target.value)}>
            <option value="vintages">Anul</option>
            <option value="countries">Țara</option>
            <option value="grapeVarieties">Tipul de struguri</option>
            <option value="producers">Producător</option>
          </select>
        </div>
        <div className={styles.inputs_row}>
          <InputField value={inputValue1} onChange={(e) => handleInputChange1(e)}  suggestions={suggestions1} setSuggestions={setSuggestions1} setInputValue={setInputValue1} />
          <InputField value={inputValue2} onChange={(e) => handleInputChange2(e)} suggestions={suggestions2} setSuggestions={setSuggestions2} setInputValue={setInputValue2} />
        </div>
        <div className={styles.button_container}>
          <button onClick={handleFetchData} className={styles.button}>Compare Data</button>
        </div>
        {chartsData.vintage && <VintageChart data={chartsData.vintage} title={"Vintage"} />}
        {chartsData.alcool && <ChartDataSample data={chartsData.alcool} title={"Alcool level"} />}
        {chartsData.color && <ChartDataSample data={chartsData.color} title={"Color"} />}
        {chartsData.style && <ChartDataSample data={chartsData.style} title={"Style"} />}
        {chartsData.organic && <ChartDataSample data={chartsData.organic} title={"Organic"} />}
        {chartsData.biodynamic && <ChartDataSample data={chartsData.biodynamic} title={"Biodynamic"} />}
        {chartsData.fairtrade && <ChartDataSample data={chartsData.fairtrade} title={"Fairtrade"} />}
        {chartsData.closure && <ChartDataSample data={chartsData.closure} title={"Closure"} />}
        {chartsData.grape && <ChartDataSample data={chartsData.grape} title={"Grape"} />}
        {chartsData.keywords1 && <KeywordsChart data={chartsData.keywords1} title={inputValue1}/>}
        {chartsData.keywords2 && <KeywordsChart data={chartsData.keywords2} title={inputValue2}/>}

      </div>
    </div>
  );
}

function InputField({ value, onChange, suggestions, setSuggestions, setInputValue }) {
  return (
    <div className="mt-4">
      <label className={styles.criterion_label}>Introduceți valoarea</label>
      <input
        type="text"
        className={styles.criterion_select}
        value={value}
        onChange={onChange}
        placeholder="Type to search..."
      />
      {suggestions.length > 0 && (
        <ul className={styles.suggestions}>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => {
              setInputValue(suggestion);
              setSuggestions([]);
            }}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
