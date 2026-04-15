export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API 키가 설정되지 않았습니다." });
  }

  const { text } = req.body;

  try {
    // 구글 AI 서버에 직접 요청 (도구 설치 필요 없음)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `당신은 초등학생 기행문 채점 전문가입니다. 다음 기행문을 10가지 기준에 따라 채점하고 JSON으로 응답하세요. 마크다운 기호 없이 순수 JSON만 보내주세요.
    {
      "totalScore": 0,
      "criteria": [
        {"id": 1, "title": "기준명", "maxScore": 5, "score": 0, "reason": "이유"}
      ],
      "overallFeedback": "총평",
      "howToGet95": "개선방안"
    }
    
    [학생 글]: ${text}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "AI 서버 응답 오류");
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    return res.status(200).json(JSON.parse(aiResponse));

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
