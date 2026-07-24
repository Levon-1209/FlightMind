import asyncio
import os
from dotenv import load_dotenv
from mistralai.client import Mistral
from flights import fetch_flights
import json


load_dotenv()
client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])


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
    messages = [{"role": "user", "content": question}]

    while True:
        response = client.chat.complete(
            model = "mistral-medium-latest",
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

answer = asyncio.run(run_agent("Quels avions sont en vol au-dessus de Marseille ? (exprime l'altitude en ft)"))
print(answer)
