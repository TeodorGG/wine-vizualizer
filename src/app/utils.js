import { useEffect } from 'react';

export default function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }

            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]); 
}


export const fetchData = async (url) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      throw error; 
    }
  };
  

  export const processChartData = (firstValue, secondValue, label1, label2) => {
    const processData = (data, label) => {
      const counts = {};
      data.forEach(item => {
        if (item[label] !== undefined) {
          counts[item[label]] = (counts[item[label]] || 0) + 1;
        }
      });
      return counts;
    };

    const processGrape = (data, label) => {
        const grapeCounts = {};

        data.forEach(entry => {
            ['principalGrapeVariety', 'secondaryGrapeVariety', 'tertiaryGrapeVariety'].forEach(key => {
            const grapeData = entry[key];
            try{
                if (grapeData) {
                    const grape = JSON.parse(grapeData.replace(/'/g, '"')).grapeVariety;
                    grapeCounts[grape] = (grapeCounts[grape] || 0) + 1;
                }
            } catch(ignore){}
            });
        });

        console.log(grapeCounts)

        return grapeCounts;
      };

      function extractKeywords(data) {
        const keywordCounts = {};
      
        data.forEach(item => {
          const keywords = JSON.parse(item.Keywords);
          keywords.forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          });
        });
      
        return keywordCounts;
      }
  
    const createChartData = (categoryLabel, data1, data2) => {
      const allLabels = new Set([...Object.keys(data1), ...Object.keys(data2)]);
      const filteredLabels = Array.from(allLabels).filter(label => 
        ((data1[label] || 0) + (data2[label] || 0)) >= 20
      );
    
      const sortedLabels = filteredLabels.sort((a, b) => a - b);
    
      return {
        labels: sortedLabels,
        datasets: [
          {
            label: `${categoryLabel} pentru ${label1}`,
            backgroundColor: '#FF6384',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: sortedLabels.map(label => data1[label] || 0),
          },
          {
            label: `${categoryLabel} pentru ${label2}`,
            backgroundColor: '#36A2EB',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 2,
            data: sortedLabels.map(label => data2[label] || 0),
          }
        ],
      };
    };
  
    const countsFirst = {
      vintage: processData(firstValue, 'vintage'),
      alcool: processData(firstValue, 'alcoholLevel'),
      color: processData(firstValue, 'color'),
      style: processData(firstValue, 'style'),
      organic: processData(firstValue, 'organic'),
      biodynamic: processData(firstValue, 'biodynamic'),
      fairtrade: processData(firstValue, 'fairtrade'),
      closure: processData(firstValue, 'closure'),
      grape: processGrape(firstValue, 'grape'),
      keywords: extractKeywords(firstValue)

    };
  
    const countsSecond = {
      vintage: processData(secondValue, 'vintage'),
      alcool: processData(secondValue, 'alcoholLevel'),
      color: processData(secondValue, 'color'),
      style: processData(secondValue, 'style'),
      organic: processData(secondValue, 'organic'),
      biodynamic: processData(secondValue, 'biodynamic'),
      fairtrade: processData(secondValue, 'fairtrade'),
      closure: processData(secondValue, 'closure'),
      grape: processGrape(secondValue, 'grape'),
      keywords: extractKeywords(secondValue)
    };

    function getTopKeywords(keywordCounts, topN = 25) {
        return Object.entries(keywordCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, topN)
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      }
  
    return {
      vintage: createChartData('Anul', countsFirst.vintage, countsSecond.vintage),
      alcool: createChartData('Nivelul de alcool', countsFirst.alcool, countsSecond.alcool),
      color: createChartData('Culoarea', countsFirst.color, countsSecond.color),
      style: createChartData('Stilul', countsFirst.style, countsSecond.style),
      organic: createChartData('Organic', countsFirst.organic, countsSecond.organic),
      biodynamic: createChartData('Biodynamic', countsFirst.biodynamic, countsSecond.biodynamic),
      fairtrade: createChartData('Fairtrade', countsFirst.fairtrade, countsSecond.fairtrade),
      closure: createChartData('Closure', countsFirst.closure, countsSecond.closure),
      grape: createChartData('Grape', countsFirst.grape, countsSecond.grape),
      keywords1: getTopKeywords(countsFirst.keywords),
      keywords2: getTopKeywords(countsSecond.keywords)
    };

  };
  
  