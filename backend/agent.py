import os
from dotenv import load_dotenv
from mistralai.client import Mistral
from flights import fetch_flights
import json


load_dotenv()
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])


SYSTEM_PROMPT = """Tu es un assistant spécialisé dans le suivi du trafic aérien.

Règles de réponse :
- Exprime toujours les altitudes en ft, jamais en mètres (1 ft = 0,3048 m), arrondies à l'entier.
- N'oublie pas de preciser l'unite de mesure de l'altitude
- Réponds en texte simple, sans Markdown : pas d'astérisques, pas de dièses, pas de gras.
- Une ligne par avion, au format : indicatif — pays — altitude.
- Sois concis, pas de conclusion ni de proposition d'aide supplémentaire."""


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_flights_in_area",
            "description": "Récupère les avions actuellement en vol dans une zone rectangulaire définie par ses coordonnées.",
            "parameters": {
                "type": "object",
                "properties": {
                    "lamin": {"type": "number", "description": "Latitude minimale"},
                    "lomin": {"type": "number", "description": "Longitude minimale"},
                    "lamax": {"type": "number", "description": "Latitude maximale"},
                    "lomax": {"type": "number", "description": "Longitude maximale"},
                },
                "required": ["lamin", "lomin", "lamax", "lomax"],
            },
        },
    }
]


async def run_agent(question):
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": question},
        ]

    for _ in range(5):
        response = client.chat.complete(
            model="mistral-medium-latest",
            messages=messages,
            tools=TOOLS,
        )
        message = response.choices[0].message
        messages.append(message)

        if not message.tool_calls:
            return message.content

        for call in message.tool_calls:
            args = json.loads(call.function.arguments)
            print(f"[outil] {call.function.name} ({args})")

            result = await fetch_flights(**args)

            messages.append({
                "role": "tool",
                "name": call.function.name,
                "content": json.dumps(result),
                "tool_call_id": call.id,
            })
