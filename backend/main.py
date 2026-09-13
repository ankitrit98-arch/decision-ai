from http.server import BaseHTTPRequestHandler, HTTPServer
import json

HOST = "127.0.0.1"
PORT = 8000


def contains(text, words):
    text = (text or "").lower()
    for word in words:
        if word in text:
            return True
    return False


def clamp(value, low=0.0, high=10.0):
    return max(low, min(high, value))


def option_score(decision, option, context):
    d = (decision or "").lower()
    o = (option or "").lower()
    c = (context or "").lower()
    text = d + " " + c

    score = {
        "Money": 5.0,
        "Career": 5.0,
        "Time": 5.0,
        "Risk": 5.0
    }

    # STUDY / EXAM
    study_goal = contains(text, [
        "exam", "test", "marks", "grade", "study",
        "top", "rank", "class", "academic"
    ])

    study = contains(o, [
        "study", "revise", "revision", "read",
        "practice", "learn", "prepare"
    ])

    sleep = contains(o, ["sleep", "rest", "nap"])
    play = contains(o, ["play", "game", "gaming", "fun"])

    if study_goal:
        if study:
            score["Career"] += 3.0
            score["Time"] += 1.0
            score["Risk"] += 1.0

        if sleep:
            score["Career"] += 1.0
            score["Risk"] += 2.0

        if play:
            score["Career"] -= 2.0
            score["Risk"] -= 1.0

        if contains(text, [
            "tired", "exhausted", "sleepy",
            "slept only", "no energy", "fatigue"
        ]):
            if sleep:
                score["Career"] += 2.0
                score["Risk"] += 2.0
            if study:
                score["Risk"] -= 1.0

        if contains(text, [
            "tomorrow", "today", "tonight", "exam soon"
        ]):
            if study:
                score["Career"] += 1.5

    # MONEY
    money_goal = contains(text, [
        "money", "budget", "cheap", "cheapest",
        "afford", "cost", "expense", "save"
    ])

    if money_goal:
        if contains(o, [
            "cheap", "cheaper", "budget",
            "save", "free", "used"
        ]):
            score["Money"] += 3.0

        if contains(o, [
            "expensive", "premium", "luxury",
            "new", "buy"
        ]):
            score["Money"] -= 2.0

    # CAREER
    if contains(text, [
        "career", "job", "salary", "work",
        "business", "future", "professional"
    ]):
        if contains(o, [
            "career", "job", "course",
            "study", "learn", "skill",
            "work", "business"
        ]):
            score["Career"] += 2.5

    # TIME
    if contains(text, [
        "time", "quick", "fast", "productive",
        "productivity", "deadline", "efficient"
    ]):
        if contains(o, [
            "quick", "fast", "easy",
            "simple", "automate"
        ]):
            score["Time"] += 2.5

        if contains(o, [
            "slow", "long", "manual", "difficult"
        ]):
            score["Time"] -= 1.5

    # LAPTOP / TECH
    laptop_goal = contains(text, [
        "laptop", "computer", "coding",
        "programming", "developer",
        "editing", "gaming"
    ])

    mac = contains(o, ["macbook", "mac"])
    windows = contains(o, ["windows", "windows laptop", "pc"])

    if laptop_goal:

        if contains(text, [
            "coding", "programming",
            "developer", "development"
        ]):
            if mac:
                score["Career"] += 2.0
                score["Time"] += 1.5
                score["Risk"] += 0.5

            if windows:
                score["Career"] += 1.5
                score["Time"] += 1.0

        if contains(text, ["gaming", "game", "games"]):
            if windows:
                score["Career"] += 2.0
                score["Time"] += 1.0
                score["Risk"] += 0.5

            if mac:
                score["Career"] -= 0.5

        if contains(text, [
            "budget", "cheap", "low cost", "affordable"
        ]):
            if windows:
                score["Money"] += 2.5
                score["Risk"] += 0.5

            if mac:
                score["Money"] -= 1.5

        # Generic laptop comparison
        if not contains(text, [
            "coding", "programming", "developer",
            "development", "gaming", "game",
            "budget", "cheap"
        ]):
            if mac:
                score["Career"] += 1.5
                score["Time"] += 1.0
                score["Money"] -= 0.5

            if windows:
                score["Money"] += 1.5
                score["Career"] += 1.0
                score["Time"] += 0.5

    for key in score:
        score[key] = round(clamp(score[key]), 2)

    return score


def analyze_decision(decision, option_a, option_b, context):
    options = [option_a, option_b]

    result = []

    for option in options:
        scores = option_score(decision, option, context)
        average = sum(scores.values()) / len(scores)

        result.append({
            "name": option,
            "score": round(average, 2),
            "scores": scores,
            "advantages": [
                "Fits some of your stated priorities."
            ],
            "risks": [
                {
                    "label": "Key assumption risk",
                    "level": "Medium"
                }
            ]
        })

    factor_values = {}
    for factor in ["Money", "Career", "Time", "Risk"]:
        factor_values[factor] = max(
            x["scores"][factor] for x in result
        ) - min(
            x["scores"][factor] for x in result
        )

    strongest = max(
        factor_values,
        key=factor_values.get
    )

    winner = max(
        result,
        key=lambda x: x["score"]
    )

    difference = abs(
        result[0]["score"] - result[1]["score"]
    )

    if difference < 0.1:
        summary = "This is a very close decision."
    else:
        summary = winner["name"] + " currently looks stronger."

    return {
        "summary": summary,
        "strongest_factor": strongest,
        "biggest_uncertainty": (
            "The result depends on information that was "
            "not provided about your situation."
        ),
        "missing_information": [
            "Your exact constraints or budget",
            "Time available for each option",
            "Which outcome matters most to you"
        ],
        "sensitivity": {
            "difference": round(difference, 2)
        },
        "options": result
    }


class DecisionHandler(BaseHTTPRequestHandler):

    def send_json(self, status, data):
        body = json.dumps(data).encode("utf-8")

        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header(
            "Access-Control-Allow-Methods",
            "GET,POST,OPTIONS"
        )
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_json(200, {})

    def do_GET(self):
        if self.path == "/health":
            self.send_json(200, {
                "status": "ok"
            })
        else:
            self.send_json(404, {
                "error": "Not found"
            })

    def do_POST(self):
        if self.path != "/analyze":
            self.send_json(404, {
                "error": "Not found"
            })
            return

        try:
            length = int(
                self.headers.get("Content-Length", "0")
            )

            raw = self.rfile.read(length)
            payload = json.loads(
                raw.decode("utf-8")
            )

            decision = payload.get("decision", "")
            option_a = payload.get("optionA", "Option A")
            option_b = payload.get("optionB", "Option B")
            context = payload.get("context", "")

            data = analyze_decision(
                decision,
                option_a,
                option_b,
                context
            )

            self.send_json(200, data)

        except Exception as e:
            self.send_json(500, {
                "error": str(e)
            })


server = HTTPServer(
    (HOST, PORT),
    DecisionHandler
)

print(
    "Decision.AI backend running on "
    "http://127.0.0.1:8000"
)

server.serve_forever()
