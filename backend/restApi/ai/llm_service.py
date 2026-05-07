import os

import ollama
from typing import List, Dict

# OLLAMA_HOST = "http://localhost:11434"
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://ollama:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")

SYS_PROMPT: List[Dict[str, str]] = [
    {"role": "system", "content": "Eres un asistente útil que responde en español."},
]


def chat_llm(messages: List[Dict[str, str]]) -> str:
    """ """
    return call_llm(messages)


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
