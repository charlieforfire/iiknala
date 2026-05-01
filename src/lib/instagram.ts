export interface InstagramPost {
  id: string
  media_url: string
  thumbnail_url?: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  timestamp: string
}

async function getIgAccountId(token: string): Promise<string | null> {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/me?fields=instagram_business_account&access_token=${token}`
  )
  const data = await res.json()
  return data.instagram_business_account?.id ?? null
}

export async function getInstagramPosts(limit = 9): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return null

  try {
    const igId = await getIgAccountId(token)
    if (!igId) return null

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${igId}/media?fields=id,media_url,thumbnail_url,permalink,media_type,timestamp&access_token=${token}&limit=${limit * 2}`,
      { next: { revalidate: 3600 } }
    )
    const json = await res.json()
    if (!json.data) return null

    return (json.data as InstagramPost[])
      .filter(p => p.media_type === 'IMAGE' || p.media_type === 'CAROUSEL_ALBUM')
      .slice(0, limit)
  } catch {
    return null
  }
}
