const API_BASE = "/api/tts";

export async function generateAudio(text, options = {}) {
  const { speaking_rate, voice_name, return_format = "mp3" } = options;

  const body = { text, return_format };
  if (speaking_rate != null) body.speaking_rate = speaking_rate;
  if (voice_name != null) body.voice_name = voice_name;

  const res = await fetch(`${API_BASE}/synthesize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`TTS API error ${res.status}: ${errText}`);
  }

  return res.blob();
}
