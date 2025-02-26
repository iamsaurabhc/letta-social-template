import { addDays, addWeeks, setHours, setMinutes, parse } from 'date-fns';

export function calculateScheduleDates(
  frequency: 'daily' | 'weekly' | 'custom',
  postsPerPeriod: number,
  customSchedule?: { days: string[]; time: string }
) {
  const dates: Date[] = [];
  const now = new Date();
  
  switch (frequency) {
    case 'daily':
      for (let i = 0; i < postsPerPeriod; i++) {
        dates.push(addDays(now, i));
      }
      break;
      
    case 'weekly':
      for (let i = 0; i < postsPerPeriod; i++) {
        dates.push(addDays(now, Math.floor(i * (7 / postsPerPeriod))));
      }
      break;
      
    case 'custom':
      if (customSchedule?.days && customSchedule.time) {
        const [hours, minutes] = customSchedule.time.split(':').map(Number);
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        for (const day of customSchedule.days) {
          const dayIndex = daysOfWeek.indexOf(day);
          let date = setHours(setMinutes(now, minutes), hours);
          
          // Adjust to next occurrence of this day
          while (date.getDay() !== dayIndex) {
            date = addDays(date, 1);
          }
          
          dates.push(date);
        }
      }
      break;
  }
  
  return dates;
} 