import { GoogleGenAI, SchemaType } from "@google/genai";

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // 속도가 빠른 플래시 모델 추천

    const prompt = `당신은 초등학생 기행문 채점 전문가입니다. 다음 기행문을 10가지 기준에 따라 채점하고 JSON으로 응답하세요. 총점(totalScore), 기준별 점수(criteria: id, title, maxScore, score, reason), 총평(overallFeedback), 개선방안(howToGet95)을 포함하세요. \n\n[학생 글]\n${text}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    res.status(200).json(JSON.parse(responseText));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI 채점 중 오류가 발생했습니다.' });
  }
}
