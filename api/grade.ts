import { GoogleGenAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  try {
    // 1. API 키 확인
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(500).json({ error: "Vercel 설정에서 GEMINI_API_KEY를 찾을 수 없습니다." });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: "POST 요청만 허용됩니다." });
    }

    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "기행문 내용이 없습니다." });
    }

    // 2. AI 모델 설정
    const genAI = new GoogleGenAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `당신은 초등학생 기행문 채점 전문가입니다. 다음 기행문을 10가지 기준에 따라 채점하고 반드시 순수한 JSON 형식으로만 응답하세요. 마크다운 기호(\`\`\`)는 쓰지 마세요.
    응답 형식: { "totalScore": 숫자, "criteria": [...], "overallFeedback": "문자열", "howToGet95": "문자열" }
    
    [학생 글]
    ${text}`;

    // 3. AI 실행
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // AI 응답에서 JSON만 추출 (혹시 모를 마크다운 제거)
    const jsonContent = responseText.replace(/```json|```/g, "").trim();
    
    res.status(200).json(JSON.parse(jsonContent));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "알 수 없는 서버 오류가 발생했습니다." });
  }
}
