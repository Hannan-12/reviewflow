import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ReplyContext {
  reviewerName: string;
  rating: number;
  comment: string;
  businessName: string;
  businessType?: string;
}

export async function generateReplyFromAI(context: ReplyContext): Promise<string> {
  try {
    const prompt = `You are a professional customer service representative for "${context.businessName}".
A customer left a ${context.rating}-star review:

**${context.reviewerName}:**
"${context.comment}"

Generate a professional, warm, and helpful reply to this review.
- Keep it concise (2-3 sentences max)
- Address their specific feedback
- If negative, offer a solution or invite them to discuss further
- If positive, thank them warmly
- Sound genuine, not robotic
- Do NOT use emojis

Just provide the reply text, nothing else.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const reply = message.content[0];
    if (reply.type === 'text') {
      return reply.text.trim();
    }

    throw new Error('Unexpected response format from AI');
  } catch (error) {
    console.error('Error generating reply from AI:', error);
    throw error;
  }
}

export async function generateBulkReplies(
  reviews: ReplyContext[]
): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    reviews.map((context) => generateReplyFromAI(context))
  );

  return results.map((result) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    console.error('Error generating reply:', result.reason);
    return null;
  });
}

// ─── Sentiment Analysis ────────────────────────────────────────────────────

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1.0 to 1.0
}

/**
 * Analyze the sentiment of a review comment using Claude Haiku (cheapest).
 * Falls back to rating-based heuristic if comment is empty or AI fails.
 */
export async function analyzeSentiment(
  comment: string,
  rating: number
): Promise<SentimentResult> {
  if (!comment?.trim()) {
    if (rating >= 4) return { sentiment: 'positive', score: rating === 5 ? 1.0 : 0.5 };
    if (rating === 3) return { sentiment: 'neutral', score: 0.0 };
    return { sentiment: 'negative', score: rating === 1 ? -1.0 : -0.5 };
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [
        {
          role: 'user',
          content: `Analyze the sentiment of this ${rating}-star review. Respond with ONLY a JSON object like {"sentiment":"positive","score":0.8} where sentiment is "positive", "neutral", or "negative" and score is -1.0 to 1.0.

Review: "${comment.slice(0, 500)}"`,
        },
      ],
    });

    const text = message.content[0];
    if (text.type !== 'text') throw new Error('Unexpected response');

    const parsed = JSON.parse(text.text.trim()) as SentimentResult;
    parsed.score = Math.max(-1, Math.min(1, parsed.score));
    return parsed;
  } catch (error) {
    console.error('analyzeSentiment error:', error);
    if (rating >= 4) return { sentiment: 'positive', score: rating === 5 ? 0.9 : 0.5 };
    if (rating === 3) return { sentiment: 'neutral', score: 0.0 };
    return { sentiment: 'negative', score: rating === 1 ? -0.9 : -0.5 };
  }
}

// ─── AI Auto-Tagging ───────────────────────────────────────────────────────

/**
 * Suggest tag names for a review from the user's available tag list.
 * Returns up to 3 matching tag names.
 */
export async function suggestTagsForReview(
  comment: string,
  rating: number,
  availableTags: string[]
): Promise<string[]> {
  if (!availableTags.length) return [];

  if (!comment?.trim()) {
    if (rating >= 4) return availableTags.includes('Positive') ? ['Positive'] : [];
    if (rating <= 2) return availableTags.includes('Negative') ? ['Negative'] : [];
    return [];
  }

  try {
    const tagList = availableTags.join(', ');
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [
        {
          role: 'user',
          content: `Tag this ${rating}-star review. Available tags: [${tagList}]. Choose 0-3 relevant tags. Respond with ONLY a JSON array, e.g. ["Positive","Service"] or [].

Review: "${comment.slice(0, 500)}"`,
        },
      ],
    });

    const text = message.content[0];
    if (text.type !== 'text') return [];

    const suggested = JSON.parse(text.text.trim()) as string[];
    const lowerAvailable = availableTags.map((t) => t.toLowerCase());
    return suggested.filter(
      (t) => typeof t === 'string' && lowerAvailable.includes(t.toLowerCase())
    );
  } catch (error) {
    console.error('suggestTagsForReview error:', error);
    return [];
  }
}
