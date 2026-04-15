import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // 1. POST 요청인지 확인
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. API 키 확인
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Vercel 설정에 GEMINI_API_KEY가 없습니다. Settings 메뉴를 확인해 주세요." });
    }

    // 3. 입력 내용 확인
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "채점할 내용이 입력되지 않았습니다." });
    }

    // 4. AI 실행 (가장 빠른 gemini-1.5-flash 모델 사용)
    const genAI = new GoogleGenAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    // AI 응답에서 JSON만 깔끔하게 추출
    const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return res.status(200).json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("Server Error:", error);
    return res.status(500).json({ 
      error: "AI 채점 중 오류가 발생했습니다.", 
      details: error.message 
    });
  }
}
