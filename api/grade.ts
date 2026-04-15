export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API 키가 설정되지 않았습니다. Vercel 설정을 확인하세요." });

  const { text } = req.body;

  try {
    // 1. 가장 표준적인 v1beta 주소를 사용합니다.
    // 모델 이름을 'gemini-1.5-flash'로 시도합니다.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `당신은 초등학생 기행문 채점 전문가입니다. 다음 기행문을 채점하고 JSON으로만 응답하세요.
    {
      "totalScore": 0,
      "criteria": [{"id": 1, "title": "기준", "maxScore": 5, "score": 0, "reason": "이유"}],
      "overallFeedback": "총평",
      "howToGet95": "개선방안"
    }
    [학생 글]: ${text}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      // 만약 여기서 또 'not found'가 뜨면, 모델 이름을 'gemini-pro'로 바꿔서 한 번 더 시도합니다.
      if (data.error?.message?.includes("not found")) {
        return res.status(500).json({ 
          error: "모델을 찾을 수 없습니다. API 키가 'Google AI Studio'에서 생성된 것이 맞는지, 혹은 제한된 키가 아닌지 확인해 주세요.",
          debug: data.error.message 
        });
      }
      throw new Error(data.error?.message || "AI 서버 응답 오류");
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    const jsonStart = aiResponse.indexOf('{');
    const jsonEnd = aiResponse.lastIndexOf('}') + 1;
    return res.status(200).json(JSON.parse(aiResponse.substring(jsonStart, jsonEnd)));

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
