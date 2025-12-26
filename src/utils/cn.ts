/**
 * Утилита для объединения CSS классов
 * @param classes - Классы для объединения
 * @returns Строка с объединенными классами
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}