import { Card } from "../../components/ui/index.js";

const HELP_ITEMS = [
  ["Home", "What is happening? Your financial command centre for the month."],
  ["Budget", "Plan your money before the month starts."],
  ["Money", "What actually happened — every transaction and account, in one place."],
  ["Goals", "Tell Tabbi what you're saving for and we'll calculate what you need."],
  ["Investments", "What am I growing? Track balances across your holdings."],
  ["Debt", "What am I paying off? See a realistic path to zero."],
  ["Insurance", "What am I protecting? Plan the savings behind every premium."],
  ["Net Worth", "Your assets minus what you owe."],
  ["Insights", "What is my money telling me?"],
  ["Challenges", "Small money habits, made fun."],
  ["Roast Me", "Call me out 😂 — based on your real spending."],
  ["Money Notes", "What am I learning? A journal for your money thoughts."],
  ["Start New Month", "Close the previous month safely and prepare the next one."],
];

export default function Help() {
  return (
    <div>
      <p style={{ color: "var(--ink-soft)", marginTop: -6 }}>A quick guide to every part of Tabbi.</p>
      <div className="tb-grid tb-grid-2">
        {HELP_ITEMS.map(([title, body]) => (
          <Card key={title}>
            <h3 className="font-display" style={{ margin: "0 0 6px", fontSize: 17 }}>{title}</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: 0 }}>{body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
