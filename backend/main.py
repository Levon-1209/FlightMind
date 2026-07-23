
import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

OPENSKY_URL = "https://opensky-network.org/api/states/all"


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/flights")
async def get_flights():
    params = {"lamin": 42.5, "lomin": 4.5, "lamax": 44.5, "lomax": 7.5}

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(OPENSKY_URL, params=params)

    data = response.json()
    states = data["states"]

    flights = []
    for state in states:
        callsign = state[1]
        if state[1] is None:
            callsign = "No Data"
        else:
            callsign = state[1].strip()

        flight = {
            "icao24": state[0],
            "callsign": callsign,
            "origin": state[2],
            "altitude": state[13],
        }
        flights.append(flight)

    return flights


@app.get("/health")
def health():
    return {"status": "ok"}
