import os
from typing import Dict, List

import ollama

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://ollama:11434")
MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2:3b")

SYSTEM_PROMPT: List[Dict[str, str]] = [
    {
        "role": "system",
        "content": "You are a helpful assistant. Reply in the same language the user writes in.",
    },
]


def call_llm(messages: List[Dict[str, str]]) -> str:
    """
    Send a conversation to Ollama and return the assistant reply.

    `messages` is the chat history without the system prompt, which is
    prepended here so that it is applied consistently to every request.
    """
    client = ollama.Client(host=OLLAMA_HOST)
    response = client.chat(model=MODEL, messages=SYSTEM_PROMPT + messages)
    return response["message"]["content"]
