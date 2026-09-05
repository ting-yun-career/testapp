export const FAN_MAX_VISIBLE = 7
export const FAN_HALF = 3

export function getFanInitialCenterIndex(totalCards: number) {
  return totalCards > FAN_MAX_VISIBLE ? FAN_HALF : totalCards >> 1
}
