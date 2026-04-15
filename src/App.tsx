import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PenTool, Loader2, ClipboardCheck, Lightbulb, AlertCircle } from "lucide-react";
import { gradeTravelogue } from "./lib/gemini";
import { GradingResult } from "./types";

export default function App() {
  const [text, setText] = useState("");
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = async () => {
    if (!text.trim()) return;
    setIsGrading(true);
    setError(null);
    try {
      const gradingResult = await gradeTravelogue(text);
      setResult(gradingResult);
    } catch (err) {
      setError("채점 중 오류가 발생했습니다.");
    } finally {
      setIsGrading(false);
    }
  };

  const getCriterionStatus = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return "high";
    if (ratio <= 0.4) return "low";
    return "";
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-5 font-sans text-[#2d3436]">
      <div className="max-w-6xl mx-auto space-y-5">
        <header className="bg-white rounded-[12px] shadow-sm h-20 flex items-center px-8">
          <h1 className="text-xl font-bold text-[#0984e3] flex items-center gap-2">
            <PenTool className="w-5 h-5" /> TravelWriter AI Grader
          </h1>
        </header>

        {!result ? (
          <div className="max-w-3xl mx-auto pt-10">
            <div className="bg-white rounded-[12px] shadow-md p-8">
              <h2 className="text-2xl font-bold mb-2">기행문 채점하기</h2>
              <p className="text-gray-500 mb-6">작성하신 기행문을 아래에 입력해 주세요.</p>
              <textarea
                className="w-full min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50/30"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="여기에 내용을 입력하세요..."
              />
              <button
                onClick={handleGrade}
                disabled={isGrading || !text.trim()}
                className="w-full mt-6 bg-[#0984e3] text-white rounded-full h-12 text-lg font-bold disabled:opacity-50"
              >
                {isGrading ? "분석 중..." : "채점 시작하기"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
            <aside className="bg-white rounded-[12px] shadow-md p-8 flex flex-col items-center h-fit">
              <div className="w-[140px] h-[140px] rounded-full border-[8px] border-[#0984e3] flex flex-col justify-center items-center mb-5">
                <div className="text-[42px] font-bold leading-none">{result.totalScore}</div>
                <div className="text-[12px] text-gray-500 font-bold tracking-widest mt-1">TOTAL SCORE</div>
              </div>
              <div className="w-full pt-6 border-t">
                <span className="font-bold mb-2 block">총평</span>
                <p className="text-[13px] leading-relaxed text-gray-600 italic">{result.overallFeedback}</p>
              </div>
              <button onClick={() => {setResult(null); setText("");}} className="mt-8 text-blue-500 text-sm font-bold">새로운 글 작성하기</button>
            </aside>

            <main className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.criteria.map((item) => (
                  <div key={item.id} className={`criteria-card-minimal ${getCriterionStatus(item.score, item.maxScore)}`}>
                    <div className="flex justify-between font-bold text-[12px] mb-1">
                      <span>{item.id}. {item.title}</span>
                      <span className="text-[#0984e3]">{item.score}/{item.maxScore}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{item.reason}</p>
                  </div>
                ))}
              </div>
              <section className="upgrade-tip-minimal">
                <div className="flex items-center gap-2 text-[#01579b] font-bold text-[14px] mb-2">
                  <Lightbulb className="w-4 h-4" /> 이렇게 고치면 95점 가능!
                </div>
                <div className="text-[13px] text-[#01579b] whitespace-pre-wrap">{result.howToGet95}</div>
              </section>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
