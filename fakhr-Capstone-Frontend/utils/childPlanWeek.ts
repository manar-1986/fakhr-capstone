import type { CarePathTask } from "../api/care-path.api";

export function saturdayWeek(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (start.getDay() + 1) % 7);
  return start;
}
export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function taskDate(task: CarePathTask): Date | null {
  if (!task.dueDate) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate) ? new Date(`${task.dueDate}T00:00:00`) : new Date(task.dueDate);
  return Number.isNaN(date.getTime()) ? null : date;
}
export function weekTasks(tasks: CarePathTask[], start: Date): CarePathTask[] {
  const end = new Date(start); end.setDate(end.getDate() + 7);
  return tasks.filter(task => { const date = taskDate(task); return !!date && date >= start && date < end; });
}
export function weeklyProgress(tasks: CarePathTask[]) {
  const done = tasks.filter(task => task.status === "completed").length;
  return { done, total: tasks.length, percent: tasks.length ? Math.round(done / tasks.length * 100) : 0 };
}
