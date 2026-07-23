import { useState } from "react";

type Flight = {
  callsign: string;
  origin: string;
  altitude: number | null;
};

function App() {
  const flights: Flight[] = [
    { callsign: "AFR1892", origin: "France", altitude: 10668 },
    { callsign: "RYR4521", origin: "Ireland", altitude: 8534 },
    { callsign: "EZY8734", origin: "United Kingdom", altitude: null },
  ];

  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>([]);

  return (
    <div>
      <h1>Vols en cours</h1>
      <button onClick={() => setDisplayedFlights(flights)}>Charger</button>
      <button onClick={() => setDisplayedFlights([])}>Effacer</button>
      <ul>
        {displayedFlights.map((flight) => {
          let altitudeText;

          if (flight.altitude === null) {
            altitudeText = "No Data";
          } else {
            altitudeText = `${flight.altitude} m`;
          }

          return (
            <li key={flight.callsign}>
              {flight.callsign} - {flight.origin} - {altitudeText}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
export default App;
