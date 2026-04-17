import { GoogleGenerativeAI } from '@google/generative-ai'

// Priority-ordered fallback chain. When one model hits its daily free-tier
// quota (429 / RESOURCE_EXHAUSTED) or is unavailable (404), the next is tried.
const MODEL_CHAIN = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
]

function getClient() {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')
  return new GoogleGenerativeAI(key)
}

function isRetryableError(err: unknown): boolean {
  const e = err as { status?: number; message?: string } | null
  if (!e) return false
  // Retry on quota/rate-limit (429) and model-not-found (404)
  if (e.status === 429 || e.status === 404 || e.status === 503) return true
  const msg = (e.message ?? '').toLowerCase()
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota') || msg.includes('not found')
}

async function generateText(prompt: string, maxOutputTokens: number): Promise<string> {
  const client = getClient()
  let lastErr: unknown

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        generationConfig: { maxOutputTokens, temperature: 0.7 },
      })
      const result = await model.generateContent(prompt)
      return result.response.text().trim()
    } catch (err) {
      lastErr = err
      if (!isRetryableError(err)) throw err
      console.warn(`[gemini] ${modelName} unavailable, falling back`)
    }
  }

  throw lastErr ?? new Error('All Gemini models rate-limited')
}

export interface ReplyContext {
  reviewerName: string
  rating: number
  comment: string
  businessName: string
  businessType?: string
}

export async function generateReplyFromAI(context: ReplyContext): Promise<string> {
  const prompt = `You are a professional customer service representative for "${context.businessName}".
A customer left a ${context.rating}-star review:

Reviewer: ${context.reviewerName}
Review: "${context.comment}"

Write a genuine, helpful reply on behalf of the business. Follow these rules:
- 3 to 5 sentences — enough to feel personal and complete, not a one-liner
- Open by thanking the reviewer by name
- Acknowledge the specific points they raised (mention details from their review)
- If the review is positive (4-5 stars): express genuine gratitude, highlight what they praised, invite them back
- If the review is neutral (3 stars): thank them, acknowledge what could be better, mention you are working on it
- If the review is negative (1-2 stars): apologise sincerely, take responsibility, offer a concrete next step (contact email, invitation to return, promise to fix the issue)
- Tone: warm, professional, human — never robotic or generic
- Do NOT use emojis
- Do NOT include any intro like "Here is a reply:" — output the reply text only

Reply:`

  try {
    return await generateText(prompt, 450)
  } catch (error) {
    console.error('Error generating reply from AI:', error)
    throw error
  }
}

export async function generateBulkReplies(
  reviews: ReplyContext[]
): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    reviews.map((context) => generateReplyFromAI(context))
  )

  return results.map((result) => {
    if (result.status === 'fulfilled') return result.value
    console.error('Error generating reply:', result.reason)
    return null
  })
}

// ─── Sentiment Analysis ────────────────────────────────────────────────────

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
}

function stripJsonFence(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
}

export async function analyzeSentiment(
  comment: string,
  rating: number
): Promise<SentimentResult> {
  if (!comment?.trim()) {
    if (rating >= 4) return { sentiment: 'positive', score: rating === 5 ? 1.0 : 0.5 }
    if (rating === 3) return { sentiment: 'neutral', score: 0.0 }
    return { sentiment: 'negative', score: rating === 1 ? -1.0 : -0.5 }
  }

  try {
    const text = await generateText(
      `Analyze the sentiment of this ${rating}-star review. Respond with ONLY a JSON object like {"sentiment":"positive","score":0.8} where sentiment is "positive", "neutral", or "negative" and score is -1.0 to 1.0.

Review: "${comment.slice(0, 500)}"`,
      60
    )

    const parsed = JSON.parse(stripJsonFence(text)) as SentimentResult
    parsed.score = Math.max(-1, Math.min(1, parsed.score))
    return parsed
  } catch (error) {
    console.error('analyzeSentiment error:', error)
    if (rating >= 4) return { sentiment: 'positive', score: rating === 5 ? 0.9 : 0.5 }
    if (rating === 3) return { sentiment: 'neutral', score: 0.0 }
    return { sentiment: 'negative', score: rating === 1 ? -0.9 : -0.5 }
  }
}

// ─── AI Auto-Tagging ───────────────────────────────────────────────────────

export async function suggestTagsForReview(
  comment: string,
  rating: number,
  availableTags: string[]
): Promise<string[]> {
  if (!availableTags.length) return []

  if (!comment?.trim()) {
    if (rating >= 4) return availableTags.includes('Positive') ? ['Positive'] : []
    if (rating <= 2) return availableTags.includes('Negative') ? ['Negative'] : []
    return []
  }

  try {
    const tagList = availableTags.join(', ')
    const text = await generateText(
      `Tag this ${rating}-star review. Available tags: [${tagList}]. Choose 0-3 relevant tags. Respond with ONLY a JSON array, e.g. ["Positive","Service"] or [].

Review: "${comment.slice(0, 500)}"`,
      80
    )

    const suggested = JSON.parse(stripJsonFence(text)) as string[]
    const lowerAvailable = availableTags.map((t) => t.toLowerCase())
    return suggested.filter(
      (t) => typeof t === 'string' && lowerAvailable.includes(t.toLowerCase())
    )
  } catch (error) {
    console.error('suggestTagsForReview error:', error)
    return []
  }
}
