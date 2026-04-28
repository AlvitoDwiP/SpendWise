export type Greeting = {
  emoji: string;
  text: string;
};

export function getGreeting(date: Date = new Date()): Greeting {
  const hour = date.getHours();

  if (hour >= 5 && hour < 11) {
    return { text: "Good Morning", emoji: "☀️" };
  }
  if (hour >= 11 && hour < 15) {
    return { text: "Good Afternoon", emoji: "🌤️" };
  }
  if (hour >= 15 && hour < 19) {
    return { text: "Good Evening", emoji: "🌇" };
  }

  return { text: "Good Night", emoji: "🌙" };
}
