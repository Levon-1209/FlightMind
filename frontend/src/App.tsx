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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadFlights() {
    setIsLoading(true);
    setError(null);

    try {
      
      const response = await fetch("http://localhost:8000/flights");
      const data: Flight[] = await response.json();
      setDisplayedFlights(data);
    } catch (err) {
      setError("impossible de charger les vols, verifiez que le serveur est demarre")
      console.error(err)
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>Vols en cours</h1>
      <button onClick={loadFlights} disabled={isLoading}>Charger</button>
      <button onClick={() => setDisplayedFlights([])}>Effacer</button>
      {isLoading && <p>Chargement...</p>}
      {error && <p>{error}</p>}
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
