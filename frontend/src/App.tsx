import { useState } from "react";

const METERS_PER_FOOT = 0.3048;

type Flight = {
  icao24: string;
  callsign: string;
  origin: string;
  altitude: number | null;
};

function App() {
  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>([]);

  async function loadFlights() {
    const response = await fetch("http://localhost:8000/flights");
    const data: Flight[] = await response.json();
    setDisplayedFlights(data);
  }

  return (
    <div>
      <h1>Vols en cours</h1>
      <button onClick={loadFlights}>Charger</button>
      <button onClick={() => setDisplayedFlights([])}>Effacer</button>
      <ul>
        {displayedFlights.map((flight) => {
          let altitudeText;

          if (flight.altitude === null) {
            altitudeText = "No Data";
          } else {
            altitudeText = `${Math.round(flight.altitude / METERS_PER_FOOT)} ft`;
          }

          return (
            <li key={flight.icao24}>
              {flight.callsign} - {flight.origin} - {altitudeText}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default App;
