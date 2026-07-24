import { useState } from "react";

const METERS_PER_FOOT = 0.3048;

type Flight = {
  icao24: string;
  callsign: string;
  origin: string;
  altitude: number | null;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [displayedFlights, setDisplayedFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const question = input;
    setMessages([...messages, { role: "user", content: question }]);
    setInput("");
    setIsChatting(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur de connexion au serveur." },
      ]);
    } finally {
      setIsChatting(false);
    }
  }

  async function loadFlights() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/flights");
      const data: Flight[] = await response.json();
      setDisplayedFlights(data);
    } catch (err) {
      setError(
        "impossible de charger les vols, verifiez que le serveur est demarre",
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>Vols en cours</h1>
      <button onClick={loadFlights} disabled={isLoading}>
        Charger
      </button>
      <button onClick={() => setMessages([])}>Effacer la conversation</button>
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
      <h2>Assistant</h2>
      {messages.map((m, i) => (
        <p key={i} style={{ whiteSpace: "pre-wrap" }}>
          <b>{m.role === "user" ? "Vous" : "Assistant"}</b> — {m.content}
        </p>
      ))}
      {isChatting && <p>L'assistant reflechit...</p>}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Quels avions au-dessus de Marseille ?"
      />
      <button onClick={sendMessage} disabled={isChatting}>
        Envoyer
      </button>
    </div>
  );
}
export default App;
