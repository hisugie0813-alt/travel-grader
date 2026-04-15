export interface GradingCriterion {
  id: number;
  title: string;
  maxScore: number;
  score: number;
  reason: string;
  improvement?: string;
}

export interface GradingResult {
  totalScore: number;
  criteria: GradingCriterion[];
  overallFeedback: string;
  howToGet95: string;
}
