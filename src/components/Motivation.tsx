// src/components/Motivation.tsx
import React from "react";

const quotes = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "The secret of getting ahead is getting started.",
  "Don’t watch the clock; do what it does. Keep going.",
  "It always seems impossible until it’s done.",
  "You don’t have to be great to start, but you have to start to be great.",
  "The future depends on what you do today.",
  "Small progress is still progress.",
  "Push yourself, because no one else is going to do it for you.",
  "Dream bigger. Do bigger.",
  "Don’t stop until you’re proud."
];

function getQuoteOfTheDay() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return quotes[dayOfYear % quotes.length];
}

const Motivation: React.FC = () => {
  const quote = getQuoteOfTheDay();
  return (
    <div className="glass-card rounded-xl p-6 mb-6 flex flex-col md:flex-row md:items-center md:gap-6 gap-2 items-start">
      <span className="font-semibold text-primary text-base mb-1 md:mb-0 md:mr-2 whitespace-nowrap bg-primary/10 px-3 py-1 rounded-lg">Quote of the Day</span>
      <span className="font-bold text-2xl text-foreground leading-snug">{quote}</span>
    </div>
  );
};

export default Motivation;
