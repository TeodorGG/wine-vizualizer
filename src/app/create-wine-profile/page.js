"use client"
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import useOnClickOutside from '../utils';
import { API_BASE_URL } from '@/utils/constans';

export default function CreateWineProfile() {
  const [showProvileForId, setShowProvileForId] = useState('');
  const [profileForId, setprovileForId] = useState({});

  const [countries, setCountries] = useState(['loading']);
  const [selectedContry, setSelectetContry] = useState('');

  const [showName, setShowName] = useState(false);
  const [showCountry, setShowCountry] = useState(false);
  const [showYear, setShowYear] = useState(false);

  const [years, setYears] = useState(['loading']);
  const [selectedYear, setSelectetYear] = useState('');

  const [wineName, setWineName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1); 
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(0);

  const ref = useRef(); 

  const [activeId, setActiveId] = useState(null); 
  const [wine, setWine] = useState({});
  const [loading2, setLoading2] = useState(false);
  const [error, setError] = useState('');
  const [overlated, setOverlated] = useState(0);

  useOnClickOutside(ref, () => setSuggestions([])); 

  useEffect(() => {
    fetch(API_BASE_URL + '/unique-countries')
      .then(response => response.json())
      .then(data => {
        setCountries(data); 
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
    
    fetch(API_BASE_URL + '/unique-vintages')
      .then(response => response.json())
      .then(data => {
        setYears(data); 
      })
      .catch(error => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  const handleSelectionChange = (event) => {
    setSelectetContry("");
    setWineName("");
    setSelectetYear("");
    setSelection(event.target.value);
  };

  const handleContryChange = (event) => {
    setSelectetContry("");
    setWineName("");
    setSelectetYear("");
    setSelectetContry(event.target.value);
  };

  const handleYearsChange = (event) => {
    setSelectetContry("");
    setWineName("");
    setSelectetYear("");
    setSelectetYear(event.target.value);
  };


  const handleWineNameChange = (event) => {
    setSelectetContry("");
    setWineName("");
    setSelectetYear("");
    const value = event.target.value;
    setWineName(value);
    
    if (timer) {
      clearTimeout(timer); 
    }
    
    const newTimer = setTimeout(() => {
      if (value.length >= 3) { 
        setLoading(true);
        fetch(API_BASE_URL + `/search-wines?name=${value}`)
          .then(response => response.json())
          .then(data => {
            setSuggestions(data);
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching wine names: ', error);
            setSuggestions([]);
            setLoading(false);
          });
      } else {
        setSuggestions([]); 
      }
    }, 800); 

    setTimer(newTimer); 
  };

  const handleSuggestionClick = (suggestion) => {
    setWineName(suggestion); 
    setSuggestions([]);     
  };

  const handleSearch = async () => {
    const queryParams = new URLSearchParams();
    setLoading1(true)
    if (wineName) queryParams.append('name', wineName);
    if (selectedContry) queryParams.append('country', selectedContry);
    if (selectedYear) queryParams.append('vintage', selectedYear);
    queryParams.append('page', page); 
    queryParams.append('limit', limit);

    const response = await fetch(API_BASE_URL + `/search-wines-l?${queryParams}`);
    const data = await response.json();
    setResults(data.data);
    setTotalPages(data.totalPages); 
    setLoading1(false)

    console.log(JSON.stringify(data));
};

const nextPage = () => {
  if (page < totalPages) {
    setPage(page + 1);
    handleSearch()
  }
};

const prevPage = () => {
  if (page > 1) {
    setPage(page - 1);
    handleSearch()
  }
};

const fetchWineDetails = async (wineId) => {
  setLoading2(true);
  setError('');

  try {

      const response = await fetch(API_BASE_URL + `/wine/${wineId}`);

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setWine(data);
      
  } catch (error) {
      setError('Failed to fetch wine details: ' + error.message);
  } finally {
      setLoading2(false);
  }
};

const fetchWineDetailsForProfile = async (wineId) => {
  try {

      const response = await fetch(API_BASE_URL + `/wine/${wineId}`);

      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      console.log(JSON.stringify(data))
      setprovileForId(data);
      setShowProvileForId(true)
      
  } catch (error) {
      setError('Failed to fetch wine details: ' + error.message);
  }
};


function parseGrapeVariety(grapeVarietyString) {
  try {
    const formattedString = grapeVarietyString.replace(/'/g, '"');
    const grapeVarietyObject = JSON.parse(formattedString);
    return `${grapeVarietyObject.grapeVariety} (${grapeVarietyObject.percentage}%)`;
  } catch (error) {
    console.error('Failed to parse grape variety:', error);
    return 'Parsing error';
  }
}

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Creare Profil Vin</h1>
      <div className={styles.form}>
        
        <div className={styles.formGroup}>
          <label htmlFor="profileSelection">Selectează Profilul Vinului:</label>
          <label>
            <input type="checkbox" checked={showName} onChange={() => {
              setShowName(!showName);
              if(!showName)
                setWineName("");
            }
            } />
            Nume
          </label>
          <label>
          <input type="checkbox" checked={showCountry} onChange={() => {
            setShowCountry(!showCountry);
            if (!showCountry)
              setSelectetContry("")
        }

          }
            
            />
            Țară
          </label>
          <label>
          <input type="checkbox" checked={showYear} onChange={() => {
            setShowYear(!showYear);
            if (!showYear)
              setSelectetYear("");
          }
          } />
            An
          </label>
        </div>

        {showName && (
          <div className={styles.formGroup}>
            <label htmlFor="wineName">Numele Vinului:</label>
            <input type="text" id="wineName" name="wineName" value={wineName} onChange={handleWineNameChange} required />
            {loading && <div className={styles.loader}></div>}

            {suggestions.length > 0 && (
              <ul ref={ref}  className={styles.suggestions}>
                  {suggestions.map(suggestion => (
                      <li key={suggestion} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion}
                      </li>
                  ))}
              </ul>
            
            )}
          </div>
        )}

        { showCountry &&(
          <div className={styles.formGroup}>
            <label htmlFor="wineCountry">Țara Vinului:</label>
            <select 
              id="wineCountry" 
              name="wineCountry" 
              value={selectedContry} 
              onChange={handleContryChange}
              required
              >
              
              {
                countries.map(element => (
                  <option value={element}>{element}</option>
                ))
              }
            </select>
          </div>
        )}

        { showYear && (
          <div className={styles.formGroup}>
            <label htmlFor="wineYear">Anul Vinului:</label>

            <select 
              id="wineYear" 
              name="label" 
              value={selectedYear} 
              onChange={handleYearsChange}
              required
              >
              
              {
                years.map(element => (
                  <option value={element}>{element}</option>
                ))
              }
            </select>
          </div>
        )}

        <div className={styles.formGroup}>
          <button type="submit" className={styles.button} onClick={() => {
            setPage(1)
            handleSearch();
          }}>Caută vinuri</button>
        </div>

        <div className={styles.formGroup}>
          <button onClick={prevPage} disabled={page <= 1}>Pagina Anterioară</button>
          <button onClick={nextPage} disabled={page >= totalPages}>Următoarea Pagină</button>
        </div>

        {loading1 && <div className={styles.loader}></div>} 

        <ul>
          {results.map(result => (
            <li key={result.id} 
             >
              <button className={styles.list_element}
               onMouseEnter={() => {
                setActiveId(result.id);
                fetchWineDetails(result.id);
               }} 
               onMouseLeave={() => {
                    setActiveId(null)
                }}
                onClick={() => {
                  fetchWineDetailsForProfile(result.id);
                }}
                >
                  {result.name} - {result.country} - {result.vintage}
              </button>
              {(activeId === result.id ) && (
                  <div className={styles.hoverContainer}  onMouseEnter={() => {
                    setActiveId(result.id);
                   }} 
                   onMouseLeave={()  => {
                    setActiveId(null);
                  }}

                  
                    >
                      {loading2 && <div className={styles.loader}></div>}
                      {!loading2 && (
                          <div>
                              <h1>{wine.name}</h1>
                              <p><img alt='Nu este disponibil' src={"https://decanterresultsapi.decanter.com/api/DWWA/2023/wines/"+wine.id+"/image"}/></p>
                              <p>{wine.country}</p>
                              <p>{wine.vintage}</p>
                              <p>{wine.color}</p>
                              <p>{wine.style}</p>
                              <p>Organic : {wine.organic}</p>
                              <p>Alcoole : {wine.alcoholLevel}%</p>
                          </div>
                      )}
                     
                  </div>
              )}
          </li>
          ))}
        </ul>



      </div>

      { showProvileForId && 
          <div>
              <h1>{profileForId.name}</h1>
              <p><img alt="Wine label not available" src={`https://decanterresultsapi.decanter.com/api/DWWA/2023/wines/${profileForId.id}/image`} /></p>
              <p>Country: {profileForId.country}</p>
              <p>Vintage: {profileForId.vintage}</p>
              <p>Color: {profileForId.color}</p>
              <p>Style: {profileForId.style}</p>
              <p>Organic: {profileForId.organic ? 'Yes' : 'No'}</p>
              <p>Biodynamic: {profileForId.biodynamic ? 'Yes' : 'No'}</p>
              <p>Fairtrade: {profileForId.fairtrade ? 'Yes' : 'No'}</p>
              <p>Closure: {profileForId.closure}</p>
              <p>Alcohol Level: {profileForId.alcoholLevel}%</p>
              <p>Principal Grape Variety: {profileForId.principalGrapeVariety ? parseGrapeVariety(profileForId.principalGrapeVariety) : ''}</p>
              { profileForId.secondaryGrapeVariety && 
                <p>Secondary Grape Variety: { parseGrapeVariety(profileForId.secondaryGrapeVariety)}</p>
              }
               { profileForId.tertiaryGrapeVariety && 
                <p>Secondary Grape Variety: { parseGrapeVariety(profileForId.tertiaryGrapeVariety)}</p>
              }
              <p>Tasting Notes: {profileForId.tastingNotes}</p>
              <p>Keywords: {profileForId.Keywords}</p>
          </div>
      
       }
 
    </div>
  );
}
