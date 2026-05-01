export async function getZoomToken(): Promise<string> {
  const credentials = Buffer.from(
    `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${process.env.ZOOM_ACCOUNT_ID}`,
    { method: 'POST', headers: { Authorization: `Basic ${credentials}` } }
  )
  const data = await res.json()
  if (!data.access_token) throw new Error('No se pudo obtener token de Zoom')
  return data.access_token
}

export async function createZoomMeeting({
  topic,
  startTime,
  duration,
}: {
  topic: string
  startTime: string  // ISO: "2026-05-01T07:30:00"
  duration: number   // minutos
}) {
  const token = await getZoomToken()

  const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      type: 2,
      start_time: startTime,
      duration,
      timezone: 'America/Merida',
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: false,
        mute_upon_entry: true,
        auto_recording: 'none',
      },
    }),
  })

  const data = await res.json()
  if (!data.join_url) throw new Error(data.message ?? 'Error al crear reunión Zoom')
  return { joinUrl: data.join_url as string, meetingId: data.id as number }
}
