import { GoogleGenerativeAI } from '@google/generative-ai'

// Priority-ordered fallback chain. When one model hits its daily free-tier
// quota (429 / RESOURCE_EXHAUSTED), the next is tried. Each model has its
// own independent free-tier quota, so stacking multiplies daily capacity.
const MODEL_CHAIN = [
  'gemini-2.5-flash-preview-04-17',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
]

function getClient() {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY is not set')
  return new GoogleGenerativeAI(key)
}

function isRateLimitError(err: unknown): boolean {
  const e = err as { status?: number; message?: string } | null
  if (!e) return false
  if (e.status === 429) return true
  const msg = (e.message ?? '').toLowerCase()
  return msg.includes('429') || msg.includes('resource_exhausted') || msg.includes('quota')
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
      if (!isRateLimitError(err)) throw err
      console.warn(`[gemini] ${modelName} rate-limited, falling back`)
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

**${context.reviewerName}:**
"${context.comment}"

Generate a professional, warm, and helpful reply to this review.
- Keep it concise (2-3 sentences max)
- Address their specific feedback
- If negative, offer a solution or invite them to discuss further
- If positive, thank them warmly
- Sound genuine, not robotic
- Do NOT use emojis

Just provide the reply text, nothing else.`

  try {
    return await generateText(prompt, 200)
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
