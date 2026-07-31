import type { IncomingMessage, ServerResponse } from 'node:http'

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const MAX_BODY_BYTES = 4_000_000

export async function readJsonBody<T = unknown>(req: IncomingMessage): Promise<T> {
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of req) {
    total += (chunk as Buffer).length
    if (total > MAX_BODY_BYTES) {
      throw new HttpError(413, '이미지 용량이 너무 큽니다. 더 작은 사진으로 시도해주세요.')
    }
    chunks.push(chunk as Buffer)
  }
  const raw = Buffer.concat(chunks).toString('utf-8')
  if (!raw) return {} as T
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new HttpError(400, '요청 본문을 해석할 수 없습니다.')
  }
}

export function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify(data))
}

export async function withJsonHandler(
  req: IncomingMessage,
  res: ServerResponse,
  fn: (body: any) => Promise<unknown>,
) {
  try {
    const body = await readJsonBody(req)
    const result = await fn(body)
    sendJson(res, 200, result)
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status >= 500) console.error('[api]', e.status, e.message)
      sendJson(res, e.status, { error: e.message })
    } else {
      console.error('[api] unhandled error', e)
      sendJson(res, 500, { error: e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.' })
    }
  }
}
