import React, {useState, useEffect} from 'react';
import {MenuItem, FormControl, Select, Card, CardContent} from "@material-ui/core";
import './App.css';
import InfoBox from './InfoBox';
import Map from "./Map";
import Table from './Table';
import {sortData,prettyPrintStat} from './util';
import LineGraph from "./LineGraph";
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {
    const [countries, setCountries] = useState([]);
    //show on the select bar status default vaule= worldwide
    const [country, setCountry] = useState('worldWide');
    const [countryInfo,setCountryInfo]=useState({});
    const [tableData, setTableData] = useState([]);
    const [mapCenter, setMapCenter] = useState({lat: 34.80746, lng: -40.4796});
    const [mapZoom, setMapZoom] = useState(3);
    const [mapCountries, setMapCountries] = useState([]);
    const [casesType, setCasesType] = useState("cases");
    // show default worldwide case numbers
    useEffect(()=>{
        fetch("https://disease.sh/v3/covid-19/all")
        .then(response=>response.json())
        .then(data=>{
          setCountryInfo(data);
        });
        },[])

        useEffect(()=>{
            const getCountriesData=async()=>{
            await fetch ("https://disease.sh/v3/covid-19/countries")
            .then((response)=>response.json())
            .then((data)=>{
              const countries=data.map((country)=>(
                {
                  name:country.country,
                  value:country.countryInfo.iso2
                }
              ));
              const sortedData = sortData(data);
              setTableData (sortedData);
              setMapCountries(data);
              setCountries(countries);
            })
            }
            getCountriesData();
            },[]);


    const onCountryChange =async (event) => {
        const countryCode=event.target.value;

        const url=
        countryCode ==="worldWide" ? 
        'https://disease.sh/v3/covid-19/all' 
        :`https://disease.sh/v3/covid-19/countries/${countryCode}`

        await fetch(url)
        .then (response=>response.json())
        .then(data =>{
          //let select bar show country
          
          //store all data to country info
          setCountryInfo(data);
          countryCode === "worldWide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
          countryCode === "worldWide"
          ?setMapZoom(3) : setMapZoom(4)
          setCountry(countryCode);
                   
        })
      };
      console.log(countryInfo);

      //console.log('Country info',countryInfo);
    return (
        <div className="app">
            <div className="app__left">
                <div className="app__header">
                    <h1>Covid-19 Tracker</h1>
                    <FormControl className="app__dropdown">
                        <Select variant="outlined" onChange={onCountryChange} value={country}>
                            <MenuItem value="worldWide">Worldwide</MenuItem>
                            {countries.map((country) => (
                            <MenuItem value={country.value}>{country.name}</MenuItem>
                                  ))}
                        </Select>
                    </FormControl>
                </div>

                <div className="app__stats">
                    <InfoBox active={casesType === "cases"} onClick={e => setCasesType('cases')} class="info" title="Coronavirus cases" cases={prettyPrintStat(countryInfo.todayCases)} total={numeral(countryInfo.cases).format("0,0")}/>
                    <InfoBox active={casesType === "recovered"} onClick={e => setCasesType('recovered')}class="info" title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={numeral(countryInfo.recovered).format("0,0")}/>
                    <InfoBox active={casesType === "deaths"} onClick={e => setCasesType('deaths')}class="info" title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={numeral(countryInfo.deaths).format("0,0")}/>
                </div>
                <Map
                casesType ={casesType}
                countries={mapCountries}
                center={mapCenter}
                zoom={mapZoom}
                />
            </div>
          <Card className="app__right">
            <CardContent>
              <h2>Lives Cases by Country</h2>
              <Table countries={tableData} />
              <br></br>
              <h2>Worldwide new {casesType}</h2>
              <br></br>
              <LineGraph casesType={casesType}/>
            </CardContent>
          </Card>
          
          
          

        </div>
    );}


export default App;
