// Gemini가 "플랜/결제 확인" 문구와 함께 429를 주는 건 재시도로는 풀리지 않는
// 하드 쿼터 초과다. 정확한 리셋 시각은 알 수 없어 보수적으로 1시간 쿨다운을 둔다.
const QUOTA_COOLDOWN_MS = 60 * 60_000

export const QUOTA_EXCEEDED_MESSAGE = '오늘 사용 가능한 무료 생성 횟수를 모두 사용했어요. 잠시 후 다시 시도해주세요.'

let exhaustedUntil = 0

export function isQuotaExhausted(): boolean {
  return Date.now() < exhaustedUntil
}

export function markQuotaExhausted(): void {
  exhaustedUntil = Date.now() + QUOTA_COOLDOWN_MS
}
