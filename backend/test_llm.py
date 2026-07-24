import os
from dotenv import load_dotenv
from mistralai.client import Mistral

load_dotenv()

client = Mistral(api_key=os.environ["MISTRAL_API_KEY"])

response = client.chat.complete(
    model="mistral-medium-latest",
    messages=[
        {"role": "user", "content": "dis Bonjour en une phrase."}
    ],
)

print(response.choices[0].message.content)
