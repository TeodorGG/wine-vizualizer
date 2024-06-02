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
  const [special, setSpecial] = useState(false);
  const [inputValue1, setInputValue1] = useState('');
  const [inputValue2, setInputValue2] = useState('');
  const [suggestions1, setSuggestions1] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [chartsData, setChartsData] = useState({ vintage: null, alcool: null, color: null, style: null, organic:null, biodynamic:null, fairtrade:null, closure:null, grape:null, keywords1:null, keywords2:null  });

  const [inputValue3, setInputValue3] = useState('');
  const [suggestions3, setSuggestions3] = useState([]);
  const [optionsWines, setOptionsWines] = useState([]);
  const [dataGeneral, setDataGeneral] = useState({});

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

  const handleInputChange3 = (e) => {
    const value = e.target.value;
    setInputValue3(value);
    if (!value) {
      setSuggestions3([]);
    } else {
      setSuggestions3(optionsWines.filter(option => option.toLowerCase().includes(value.toLowerCase())));
    }
  };
  
  const processGrape = (data) => {
    const grapeSet = new Set();

    data.forEach(entry => {
        ['principalGrapeVariety', 'secondaryGrapeVariety', 'tertiaryGrapeVariety'].forEach(key => {
            const grapeData = entry[key];
            try {
                if (grapeData) {
                    const grape = JSON.parse(grapeData.replace(/'/g, '"')).grapeVariety;
                    grapeSet.add(grape);
                }
            } catch (ignore) {}
        });
    });

    return grapeSet;
};



const applyfilter = async () => {

  const filteredFirstValue = dataGeneral.firstValue.filter(entry => {
      return entry.principalGrapeVariety.includes(inputValue3) ||
            entry.secondaryGrapeVariety.includes(inputValue3) ||
            entry.tertiaryGrapeVariety.includes(inputValue3);
  });

  const filteredSecondValue = dataGeneral.secondValue.filter(entry => {
      return entry.principalGrapeVariety.includes(inputValue3) ||
        entry.secondaryGrapeVariety.includes(inputValue3) ||
        entry.tertiaryGrapeVariety.includes(inputValue3);
  });

  setChartsData(processChartData(filteredFirstValue, filteredSecondValue, inputValue1, inputValue2));
};

  const handleFetchData = async () => {
    const data = await fetchData(`api/compare-data?column=${encodeURIComponent(selectedCriterion)}&values=${encodeURIComponent(inputValue1)},${encodeURIComponent(inputValue2)}`);
    const { firstValue, secondValue } = data;
    setChartsData(processChartData(firstValue, secondValue, inputValue1, inputValue2));
    
    const grapeSet1 = processGrape(data.firstValue);
    const grapeSet2 = processGrape(data.secondValue);

    const commonSet = new Set([...grapeSet1].filter(grape => grapeSet2.has(grape)));
    const commonArray = Array.from(commonSet);
    setOptionsWines(commonArray)
    setDataGeneral(data)    
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
            {/* <option value="grapeVarieties">Tipul de struguri</option> */}
            <option value="producers">Producător</option>
          </select>
          <div style={{margin:10}}>
            <input style={{marginRight:10}} type='checkbox' onChange={e => setSpecial(e.target.checked)}></input>Selectează pentru un tip de struguri special?(Tipul de struguri va fi selectat după ce datele vor fi comparate)
          </div>
        </div>
        <div className={styles.inputs_row}>
          <InputField title={'Introduceți valoarea'} value={inputValue1} onChange={(e) => handleInputChange1(e)}  suggestions={suggestions1} setSuggestions={setSuggestions1} setInputValue={setInputValue1} />
          { (special && chartsData.vintage != null) && (
              <InputField title={'Introduceți soiul(a se completa ultimul)'}  value={inputValue3} onChange={(e) => handleInputChange3(e)}  suggestions={suggestions3} setSuggestions={setSuggestions3} setInputValue={setInputValue3} />
          )
          }
          <InputField  title={'Introduceți valoarea'}  value={inputValue2} onChange={(e) => handleInputChange2(e)} suggestions={suggestions2} setSuggestions={setSuggestions2} setInputValue={setInputValue2} />
        </div>
        <div className={styles.button_container}>
          <button onClick={handleFetchData} className={styles.button}>Compare Data</button>
          { (special && chartsData.vintage != null) && (
            <button style={{marginLeft : 20}} onClick={applyfilter} className={styles.button}>Compare Data cu filtru</button>
          )  
        }
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

function InputField({ value, onChange, suggestions, setSuggestions, setInputValue, title }) {
  return (
    <div className="mt-4">
      <label className={styles.criterion_label}>{title}</label>
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
