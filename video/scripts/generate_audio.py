import asyncio
import edge_tts
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from scenes import SCENES

VOICE = "en-US-AndrewNeural"
RATE = "+40%"
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

async def generate():
    durations = []
    for i, scene in enumerate(SCENES):
        out_path = os.path.join(AUDIO_DIR, f"scene_{i:03d}.mp3")
        print(f"Generating scene {i} ({scene['title']})...")
        communicate = edge_tts.Communicate(scene["voiceover"], VOICE, rate=RATE)
        await communicate.save(out_path)

        communicate2 = edge_tts.Communicate(scene["voiceover"], VOICE, rate=RATE)
        total_ms = 0
        async for chunk in communicate2.stream():
            if chunk["type"] == "WordBoundary":
                total_ms = chunk["offset"] + chunk["duration"]

        duration_s = (total_ms / 1000 if total_ms else 5000 / 1000) + 1.0
        durations.append(duration_s)
        print(f"  -> {duration_s:.1f}s")

    manifest_path = os.path.join(AUDIO_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(durations, f, indent=2)
    print(f"\nTotal duration: {sum(durations):.1f}s ({sum(durations)/60:.1f} min)")
    print(f"Manifest saved to {manifest_path}")

if __name__ == "__main__":
    asyncio.run(generate())
