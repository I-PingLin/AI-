
import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface AnalysisResult {
  isCompliant: boolean;
  reason: string;
  detectedPhrases: string[];
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set");
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeCompliance(text: string): Promise<AnalysisResult> {
    const prompt = `あなたは台湾のAIコンテンツ規制に関するコンプライアンスチェッカーです。提供されたテキストを分析し、コンテンツがAIによって生成された、またはディープフェイク技術を使用していることを明確に示しているかどうかを判断してください。

規制では、「AI生成」、「AIによる作成」、「ディープフェイク技術使用」などの明確な文言が必要です。

以下のテキストを分析し、指定されたJSON形式で結果を返してください。
- isCompliant: 規制に準拠している場合はtrue、していない場合はfalse。
- reason: あなたの判断の理由を簡潔に日本語で説明してください。
- detectedPhrases: 準拠の根拠となった具体的な文言を配列でリストアップしてください。準拠していない場合は空の配列にしてください。

テキスト:
---
${text}
---
`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        isCompliant: {
          type: Type.BOOLEAN,
          description: 'コンテンツが表示義務に準拠しているか',
        },
        reason: {
          type: Type.STRING,
          description: '判断理由（日本語）',
        },
        detectedPhrases: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'コンプライアンスの根拠として検出されたフレーズ',
        },
      },
      required: ['isCompliant', 'reason', 'detectedPhrases'],
    };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const jsonString = response.text.trim();
      const result = JSON.parse(jsonString) as AnalysisResult;
      
      return result;

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to analyze text with Gemini API.');
    }
  }
}
