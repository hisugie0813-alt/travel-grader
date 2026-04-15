export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Vercel 설정에서 GEMINI_API_KEY를 확인해 주세요." });
  }

  const { text } = req.body;

  try {
    // 주소를 v1beta에서 v1으로 바꾸고, 모델명도 가장 확실한 것으로 변경했습니다.
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `당신은 초등학생 기행문 채점 전문가입니다. 다음 기행문을 10가지 기준에 따라 채점하고 반드시 JSON 형식으로만 응답하세요.
    응답 형식:
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
        generationConfig: { 
          // JSON 형태로만 답하도록 강제하는 설정입니다.
          responseMimeType: "application/json" 
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      // 에러가 나면 구체적인 이유를 화면에 띄워줍니다.
      throw new Error(data.error?.message || "AI 서버 응답 오류");
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    return res.status(200).json(JSON.parse(aiResponse));

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
