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
    // 1. v1beta 주소로 다시 돌아가되, 모델명을 가장 기본인 'gemini-1.5-flash'로 설정합니다.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `당신은 초등학생 기행문 채점 전문가입니다. 다음 기행문을 10가지 기준에 따라 채점하고 반드시 JSON 형식으로만 응답하세요. 
    다른 설명 없이 오직 { ... } 데이터만 보내주세요.
    
    {
      "totalScore": 0,
      "criteria": [
        {"id": 1, "title": "기준명", "maxScore": 5, "score": 0, "reason": "이유"}
      ],
      "overallFeedback": "총평",
      "howToGet95": "개선방안"
    }
    
    [학생 글]: ${text}`;

    // 2. 에러를 유발했던 'generationConfig' 설정을 완전히 삭제했습니다.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      // 만약 여기서 또 'not found'가 뜬다면, 구글 AI 스튜디오에서 API 키가 활성화되었는지 확인이 필요할 수 있습니다.
      throw new Error(data.error?.message || "AI 서버 응답 오류");
    }

    const aiResponse = data.candidates[0].content.parts[0].text;
    
    // 3. AI 답변에서 JSON만 쏙 골라내는 가장 튼튼한 방식입니다.
    const jsonStart = aiResponse.indexOf('{');
    const jsonEnd = aiResponse.lastIndexOf('}') + 1;
    const cleanJson = aiResponse.substring(jsonStart, jsonEnd);
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
