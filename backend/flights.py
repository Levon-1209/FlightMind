import httpx

OPENSKY_URL = "https://opensky-network.org/api/states/all"


async def fetch_flights(lamin, lomin, lamax, lomax):
    params = {"lamin": lamin, "lomin": lomin, "lamax": lamax, "lomax": lomax}

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
