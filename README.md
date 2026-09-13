# Decision.AI — What-If Decision Simulator

Decision.AI is an interactive decision simulator that helps users compare two choices, understand the factors behind a recommendation, and explore how changing priorities can change the outcome.

Instead of giving a simple yes/no answer, Decision.AI lets users experiment with different assumptions and see how the decision responds.

## 🚀 Features

- 🧠 Structured decision analysis
- ⚖️ Custom priority weighting
- 🎚️ Interactive What-If sliders
- 🔮 Optimistic, Realistic and Worst Case scenarios
- 📊 Decision comparison chart
- 🕸️ Factor Profile radar chart
- 💡 Decision Impact explanation
- ⚠️ Biggest Uncertainty detection
- 📱 Responsive interface

## 🎯 How It Works

1. Enter a decision.
2. Provide two options.
3. Add optional context.
4. Adjust priorities such as:
   - Money
   - Career
   - Time
   - Risk
5. Compare the results.
6. Change the assumptions and simulate different outcomes.

The goal is not to pretend there is always one objectively correct answer, but to show **why a recommendation changes when priorities or assumptions change.**

## 🧪 Example

**Decision:** Should I focus on studying or playing?

**Option A:** Study  
**Option B:** Play

The simulator evaluates both options across multiple factors and produces a recommendation.

Users can then change their priorities and immediately explore how the decision changes.

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Recharts
- Lucide React
- CSS

### Backend
- Python
- HTTP/JSON API
- Rule-based decision analysis engine

## 🏗️ Project Structure

```text
decision-ai/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
│
└── README.md
