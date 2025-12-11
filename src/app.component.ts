
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService, AnalysisResult } from './services/gemini.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  userText = signal<string>('');
  isLoading = signal<boolean>(false);
  analysisResult = signal<AnalysisResult | null>(null);
  error = signal<string | null>(null);

  onTextInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.userText.set(target.value);
  }

  async analyze(): Promise<void> {
    if (!this.userText().trim()) {
      this.error.set('解析するテキストを入力してください。');
      return;
    }

    this.isLoading.set(true);
    this.analysisResult.set(null);
    this.error.set(null);

    try {
      const result = await this.geminiService.analyzeCompliance(this.userText());
      this.analysisResult.set(result);
    } catch (err) {
      console.error('API Error:', err);
      this.error.set('解析中にエラーが発生しました。しばらくしてから再度お試しください。');
    } finally {
      this.isLoading.set(false);
    }
  }
}
