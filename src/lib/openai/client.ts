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
        generationConfig: { maxOutputTokens, temperature: 0.55 },
      })
      const result = await model.generateContent(prompt)
      const candidate = result.response.candidates?.[0]
      if (candidate?.finishReason === 'MAX_TOKENS') {
        console.warn(`[gemini] ${modelName} hit MAX_TOKENS (${maxOutputTokens}) — response truncated`)
      }
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
  const hasComment = context.comment?.trim().length > 0

  const prompt = `You are an expert at writing public Google Business review replies on behalf of "${context.businessName}".

REVIEW DATA:
- Reviewer: ${context.reviewerName}
- Rating: ${context.rating} out of 5 stars
- Comment: ${hasComment ? `"${context.comment}"` : '(no written comment, rating only)'}

YOUR TASK:
Write a complete, genuine reply that the business owner will post publicly on Google. The reply must feel human and personal — never generic or templated.

FORMATTING RULES:
- Output ONLY the reply text. No labels, no "Here is the reply:", nothing else.
- Do NOT use letter/email format. Do NOT start with "Dear".
- Begin naturally: address the reviewer by name in the opening line.
- Write in flowing prose — no bullet points, no numbered lists.
- Always write complete sentences. Never end mid-sentence.

LENGTH:
- No comment (rating only): 2–3 sentences.
- Short or vague comment: 3–4 sentences.
- Detailed or specific comment: 4–6 sentences that address each point raised.

TONE BY RATING:
★★★★★ (5 stars): Enthusiastic, warm gratitude. Call out specific things they loved. Invite them back.
★★★★ (4 stars): Genuine thanks. Acknowledge what they highlighted. Gently note you are working on anything they mentioned could be better.
★★★ (3 stars): Balanced and appreciative. Thank them for honest feedback. Acknowledge the gap between their expectation and experience. Commit to improvement.
★★ (2 stars): Empathetic, not defensive. Apologise for the experience. Acknowledge the specific issue. Offer a path forward (invite them to contact you directly).
★ (1 star): Calm, professional, empathetic. Do not argue. Apologise sincerely. Acknowledge the issue by name. Give a clear resolution step and direct contact invitation.

SPECIAL CASES — handle these exactly as described:
- No written comment: Thank them warmly for the rating and invite them to share more next time.
- Translated review (starts with "Translated by Google"): Reply in the same language as the ORIGINAL text at the bottom, not the English translation.
- Fake review / identity dispute: Stay calm. State firmly but professionally that you take such claims seriously. Do NOT admit fault. Invite them to contact you directly to investigate. Do not argue or accuse.
- Complaint about a specific staff member: Acknowledge the concern without naming or blaming the employee publicly. Apologise for the experience and invite direct contact to follow up.
- Complaint about a specific product or service: Name the product or service in your reply to show you read it. Acknowledge what went wrong and what you will do about it.
- Aggressive or inappropriate tone from reviewer: Remain calm and professional. Do not mirror their tone. Acknowledge their frustration and offer a resolution.
- Review praising a specific staff member: Mention that person by name and pass on the kind words.

Always end with a forward-looking line (e.g. hope to see them again, commitment to improvement, or invitation to reach out).`

  try {
    return await generateText(prompt, 700)
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
