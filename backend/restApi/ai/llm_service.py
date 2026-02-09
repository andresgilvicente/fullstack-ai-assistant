import ollama
from typing import List, Dict

OLLAMA_HOST = "http://localhost:11434"
MODEL = "llama3.2:3b"  # modelo configurado desde Ollama Web UI

# Ejemplo de la variable mensajes:
# msgs: List[Dict[str, str]] = [
# {"role": "system", "content": "Eres un asistente útil que responde en español."},
# {"role": "user", "content": "Explícame qué es Docker en pocas líneas."},
# ]
#
#

SYS_PROMPT: List[Dict[str, str]] = [
    {"role": "system", "content": "Eres un asistente útil que responde en español."},
]


def call_llm(messages: List[Dict[str, str]]) -> str:
    """
    Llama a Ollama con un historial de mensajes.
    Dicho historial no incluye el prompt del sistema.
    Se añade de manera manual
    """
    client = ollama.Client(host=OLLAMA_HOST)

    messages_with_promt = SYS_PROMPT + messages

    response = client.chat(
        model=MODEL,
        messages=messages_with_promt,
    )

    return response["message"]["content"]
