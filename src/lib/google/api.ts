import { createClient } from '@supabase/supabase-js'
import { refreshAccessToken } from './oauth'

const ACCOUNT_MGMT_URL = 'https://mybusinessaccountmanagement.googleapis.com/v1'
const BUSINESS_INFO_URL = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const REVIEWS_URL       = 'https://mybusiness.googleapis.com/v4'

// ────────────────────────────────────────────────────────────
// Token management
// ────────────────────────────────────────────────────────────

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/**
 * Returns a valid access token for the user.
 * Refreshes and persists the new token if expired.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const admin = getAdmin()
  const { data: user } = await admin
    .from('users')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('id', userId)
    .single()

  if (!user?.google_refresh_token) {
    throw new Error('No Google account connected')
  }

  const expiry = user.google_token_expiry ? new Date(user.google_token_expiry) : new Date(0)
  const isExpired = expiry <= new Date(Date.now() + 60_000) // refresh 1 min early

  if (!isExpired && user.google_access_token) {
    return user.google_access_token
  }

  // Refresh
  const tokens = await refreshAccessToken(user.google_refresh_token)
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await admin
    .from('users')
    .update({ google_access_token: tokens.access_token, google_token_expiry: newExpiry })
    .eq('id', userId)

  return tokens.access_token
}

// ────────────────────────────────────────────────────────────
// GBP API calls
// ────────────────────────────────────────────────────────────

async function gbpFetch(url: string, token: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const err = await res.text()
    console.error(`[gbpFetch] ${res.status} ${url}\n${err}`)
    throw new Error(`GBP API error ${res.status}: ${err}`)
  }
  return res.json()
}

export interface GBPAccount {
  name: string          // accounts/123456789
  accountName: string
  type: string
  verificationState: string
}

export interface GBPLocation {
  name: string          // accounts/123/locations/456
  title: string
  storefrontAddress?: { addressLines?: string[]; locality?: string; regionCode?: string }
  phoneNumbers?: { primaryPhone?: string }
  websiteUri?: string
}

export interface GBPReview {
  name: string          // accounts/.../locations/.../reviews/...
  reviewId: string
  reviewer: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
  comment?: string
  createTime: string
  updateTime: string
  reviewReply?: { comment: string; updateTime: string }
}

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
}

export function starToNumber(star: string): number {
  return STAR_MAP[star] ?? 0
}

/** List all GBP accounts the user has access to */
export async function listAccounts(token: string): Promise<GBPAccount[]> {
  const data = await gbpFetch(`${ACCOUNT_MGMT_URL}/accounts`, token)
  return data.accounts ?? []
}

/** List all locations for a given account */
export async function listLocations(accountName: string, token: string): Promise<GBPLocation[]> {
  const readMask = 'name,title,storefrontAddress,phoneNumbers,websiteUri'
  const url = `${BUSINESS_INFO_URL}/${accountName}/locations?readMask=${encodeURIComponent(readMask)}&pageSize=100`
  const data = await gbpFetch(url, token)
  return data.locations ?? []
}

/** List reviews for a location (up to 50 most recent) */
export async function listReviews(locationName: string, token: string, pageToken?: string): Promise<{
  reviews: GBPReview[]
  nextPageToken?: string
  totalReviewCount?: number
  averageRating?: number
}> {
  let url = `${REVIEWS_URL}/${locationName}/reviews?pageSize=50`
  if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`
  const data = await gbpFetch(url, token)
  return {
    reviews:          data.reviews ?? [],
    nextPageToken:    data.nextPageToken,
    totalReviewCount: data.totalReviewCount,
    averageRating:    data.averageRating,
  }
}

/** Post or update a reply to a GBP review */
export async function replyToReview(reviewName: string, comment: string, token: string): Promise<void> {
  const url = `${REVIEWS_URL}/${reviewName}/reply`
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GBP reply error ${res.status}: ${err}`)
  }
}

/** Fetch ALL reviews for a location (paginating automatically) */
export async function listAllReviews(locationName: string, token: string): Promise<GBPReview[]> {
  const all: GBPReview[] = []
  let pageToken: string | undefined

  do {
    const page = await listReviews(locationName, token, pageToken)
    all.push(...page.reviews)
    pageToken = page.nextPageToken
  } while (pageToken)

  return all
}
