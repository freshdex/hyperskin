import { GREETING_TEMPLATES } from '@shared/defaults'
import type { Greeting, TimeOfDay } from '@shared/types'

/**
 * Determines the time of day based on the current hour.
 */
function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning'
  if (hour < 17) return 'Afternoon'
  return 'Evening'
}

/**
 * Generates a greeting message by picking a random template
 * and substituting {time} and {name} placeholders.
 */
export function generateGreeting(name: string): Greeting {
  const timeOfDay = getTimeOfDay()
  const index = Math.floor(Math.random() * GREETING_TEMPLATES.length)
  const template = GREETING_TEMPLATES[index]

  const message = template
    .replace('{time}', timeOfDay)
    .replace('{name}', name)

  return {
    message,
    timeOfDay
  }
}
