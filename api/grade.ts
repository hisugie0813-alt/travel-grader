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
    // 1. 가장 안정적인 v1 주소를 사용합니다.
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `당신은 초등학생 기행문 채점 전문가입니다. 다음 기행문을 10가지 기준에 따라 채점하고 반드시 JSON 형식으로만 응답하세요. 
    다른 설명은 하지 말고 오직 { ... } 로 시작하는 JSON 데이터만 보내주세요.
    
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

    // 2. 에러를 일으키는 generationConfig 설정을 아예 삭제했습니다.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "AI 서버 응답 오류");
    }

    // 3. AI가 보낸 답변에서 JSON만 추출하는 튼튼한 코드입니다.
    let aiResponse = data.candidates[0].content.parts[0].text;
    
    // 혹시 AI가 ```json ... ``` 같은 기호를 붙여도 다 지워버립니다.
    const jsonStart = aiResponse.indexOf('{');
    const jsonEnd = aiResponse.lastIndexOf('}') + 1;
    const cleanJson = aiResponse.substring(jsonStart, jsonEnd);
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
