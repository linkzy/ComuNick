const API_BASE = "https://narrator-tts.linkzy.dev";
const API_KEY = "!@34Hbdt";

export async function generateAudio(text, options = {}) {
  const { speaking_rate, voice_name, return_format = "mp3" } = options;

  const body = {
    text,
    speaking_rate: speaking_rate ?? null,
    voice_name: voice_name ?? null,
    return_format,
  };

  const res = await fetch(`${API_BASE}/synthesize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`TTS API error ${res.status}: ${errText}`);
  }

  return res.blob();
}

export async function checkStatus() {
  const res = await fetch(`${API_BASE}/status`, {
    headers: { "X-API-Key": API_KEY },
  });

  if (!res.ok) throw new Error(`Status API error ${res.status}`);

  return res.json();
}
