import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Brain,
  ArrowRight,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  SlidersHorizontal
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";

import "./styles.css";

const API = "https://decision-chatbox-backend.onrender.com";

function App(){

  const [screen,setScreen] = useState("login");
  const [loggedIn,setLoggedIn] = useState(false);
  const [loginEmail,setLoginEmail] = useState("");
  const [loginPassword,setLoginPassword] = useState("");

  const [decision,setDecision] = useState("");
  const [a,setA] = useState("");
  const [b,setB] = useState("");

  const [priorities,setPriorities] = useState([
    "Money",
    "Career",
    "Time"
  ]);

  const [context,setContext] = useState("");

  const [data,setData] = useState(null);

  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const [vars,setVars] = useState({
    money:50,
    career:50,
    time:50,
    risk:50
  });

  const [scenario,setScenario] = useState("realistic");


  /* =========================
     ANALYZE
  ========================= */

  const analyze = async()=>{

    if(!decision || !a || !b){

      setError(
        "Decision and both options are required."
      );

      return;
    }

    setLoading(true);
    setError("");

    try{

      const r = await fetch(
        `${API}/analyze`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            decision,
            optionA:a,
            optionB:b,
            priorities,
            context
          })
        }
      );

      if(!r.ok){
        throw new Error("Backend error");
      }

      const d = await r.json();

      setData(d);
      setScreen("analysis");

    }catch(e){

      setError(
        "Backend not reachable. Start the backend on port 8000."
      );

    }

    setLoading(false);
  };


  /* =========================
     PRIORITIES
  ========================= */

  const togglePriority = (p)=>{

    setPriorities(prev=>{

      if(prev.includes(p)){
        return prev.filter(x=>x!==p);
      }

      return [...prev,p];
    });

  };


  /* =========================
     DYNAMIC SCORES
  ========================= */

  const scores = useMemo(()=>{

    if(!data){
      return [];
    }

    const priorityWeights = {
      Money:vars.money,
      Career:vars.career,
      Time:vars.time,
      Risk:vars.risk
    };

    return data.options.map(o=>{

      let total = 0;
      let weightTotal = 0;

      Object.entries(o.scores).forEach(
        ([factor,value])=>{

          const key =
            factor.charAt(0).toUpperCase() +
            factor.slice(1);

          const weight =
            priorityWeights[key] !== undefined
              ? priorityWeights[key]
              : 50;

          total += value * weight;
          weightTotal += weight;

        }
      );

      let score =
        weightTotal
          ? total / weightTotal
          : 0;


      if(scenario === "optimistic"){
        score += 0.6;
      }

      if(scenario === "worst"){
        score -= 0.8;
      }


      return {
        name:o.name,
        score:Math.max(
          0,
          Math.min(
            10,
            +score.toFixed(2)
          )
        )
      };

    });

  },[data,vars,scenario]);


  if(screen === "login"){
    return (
      <div className="loginPage">
        <div className="loginCard">
          <div className="loginLogo">
            <Brain size={28}/>
          </div>
          <div className="presentedBy">Presented by <b>TEACH CREW</b></div><h1>Decision<span>.Chatbox</span></h1>
          <p>Think smarter. Simulate better decisions.</p>

          <input
            type="email"
            placeholder="Email"
            value={loginEmail}
            onChange={e=>setLoginEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={e=>setLoginPassword(e.target.value)}
          />

          <button
            className="loginButton"
            onClick={()=>{
              setLoggedIn(true);
              setScreen("home");
            }}
          >
            Login <ArrowRight size={17}/>
          </button>

          <small>Demo login • No account required</small>
        </div>
      </div>
    );
  }


  /* =========================
     WINNER
  ========================= */

  const winner =
    scores.length
      ? scores.reduce(
          (x,y)=>y.score>x.score ? y : x
        )
      : null;


  /* =========================
     SCORE DIFFERENCE
  ========================= */

  const scoreDifference =
    scores.length > 1
      ? Math.abs(
          scores[0].score -
          scores[1].score
        )
      : 0;


  const decisionStrength =
    scoreDifference >= 1
      ? "Strong"
      : scoreDifference >= 0.5
        ? "Moderate"
        : "Close call";


  /* =========================
     RADAR DATA
  ========================= */

  const radar = data
    ? Object.keys(
        data.options[0].scores
      ).map(factor=>{

        const row = {
          factor
        };

        data.options.forEach(o=>{
          row[o.name] =
            o.scores[factor];
        });

        return row;

      })
    : [];


  /* =========================
     RESET
  ========================= */

  const reset = ()=>{

    setScreen("home");

    setData(null);

    setDecision("");
    setA("");
    setB("");

    setContext("");

    setError("");

    setScenario("realistic");

    setVars({
      money:50,
      career:50,
      time:50,
      risk:50
    });

  };


  /* =========================
     HOME SCREEN
  ========================= */

  if(screen === "home"){

    return(

      <div className="app">

        <header>

          <div className="brand">

            <Brain/>

            Decision<span>.Chatbox</span>

          </div>

          <div className="live">
            AI DECISION ENGINE</div><div className="teamCredit">Built by TEACH CREW
          </div>

        </header>


        <main className="hero">

          <div className="eyebrow">

            <Sparkles size={15}/>

            THINK IN SCENARIOS

          </div>


          <h1>

            Don’t just make a decision.

            <br/>

            <em>Simulate it.</em>

          </h1>


          <p className="lead">

            Compare your options, change your priorities,
            and explore how different futures could change
            your decision.

          </p>


          <div className="formCard">


            <label>
              What decision are you trying to make?
            </label>

            <input
              value={decision}
              onChange={e=>
                setDecision(e.target.value)
              }
              placeholder="e.g. Should I buy a new laptop?"
            />


            <div className="grid2">


              <div>

                <label>
                  Option A
                </label>

                <input
                  value={a}
                  onChange={e=>
                    setA(e.target.value)
                  }
                  placeholder="e.g. MacBook"
                />

              </div>


              <div>

                <label>
                  Option B
                </label>

                <input
                  value={b}
                  onChange={e=>
                    setB(e.target.value)
                  }
                  placeholder="e.g. Windows Laptop"
                />

              </div>


            </div>


            <label>

              What matters most?

              <small>
                {" "}Select one or more
              </small>

            </label>


            <div className="chips">

              {[
                "Money",
                "Career",
                "Time",
                "Risk"
              ].map(p=>(

                <button
                  key={p}
                  className={
                    priorities.includes(p)
                      ? "chip active"
                      : "chip"
                  }
                  onClick={()=>
                    togglePriority(p)
                  }
                >
                  {p}
                </button>

              ))}

            </div>


            <label>

              Additional context

              <small>
                {" "}Optional
              </small>

            </label>


            <textarea
              value={context}
              onChange={e=>
                setContext(e.target.value)
              }
              placeholder="Tell the simulator anything important..."
            />


            {error && (

              <div className="error">
                {error}
              </div>

            )}


            <button
              className="primary"
              onClick={analyze}
              disabled={loading}
            >

              {loading
                ? "Simulating..."
                : "Run Simulation"
              }

              {!loading && (
                <ArrowRight size={17}/>
              )}

            </button>


          </div>

        </main>

      </div>

    );

  }


  /* =========================
     RESULT SCREEN
  ========================= */

  return(

    <div className="app">


      <header>

        <div className="brand">

          <Brain/>

          Decision<span>.Chatbox</span>

        </div>


        <button
          className="ghost"
          onClick={reset}
        >

          <RotateCcw size={15}/>

          New Decision

        </button>

      </header>


      <main className="dashboard">


        {/* TITLE */}

        <div className="dashTitle">

          <div>

            <div className="eyebrow">

              <SlidersHorizontal size={14}/>

              SIMULATION RESULT

            </div>


            <h2>
              {decision}
            </h2>

          </div>


          {winner && (

            <div className="winner">

              Current leader

              <strong>
                {winner.name}
              </strong>


              {scores.length > 1 && (

                <small>

                  {scoreDifference < 0.1
                    ? "Very close decision"
                    : `by ${scoreDifference.toFixed(2)} points`
                  }

                </small>

              )}

            </div>

          )}

        </div>


        {/* OPTIONS */}

        <div className="topGrid">


          {data.options.map((o,i)=>{

            const current =
              scores.find(
                x=>x.name===o.name
              );


            return(

              <div
                className="optionCard"
                key={o.name}
              >


                <div className="optionHead">

                  <span>
                    OPTION {i===0 ? "A" : "B"}
                  </span>

                  <span className="score">

                    {current?.score.toFixed(2)}/10

                  </span>

                </div>


                <h3>
                  {o.name}
                </h3>


                <div className="scorebar">

                  <i
                    style={{
                      width:
                        `${(current?.score || 0)*10}%`
                    }}
                  />

                </div>


                <div className="proscons">


                  <div>

                    <b>
                      Advantages
                    </b>


                    {o.advantages?.map(
                      (x,i)=>(

                        <p key={i}>
                          + {x}
                        </p>

                      )
                    )}

                  </div>


                  <div>

                    <b>
                      Risks
                    </b>


                    {o.risks?.map(
                      (x,i)=>(

                        <p key={i}>

                          − {x.label || x}

                          {x.level
                            ? ` (${x.level})`
                            : ""
                          }

                        </p>

                      )
                    )}

                  </div>


                </div>


              </div>

            );

          })}


        </div>


        {/* WHAT IF */}

        <div className="panel">


          <div className="panelHead">

            <div>

              <SlidersHorizontal/>

              <div>

                <h3>
                  What-If Simulator
                </h3>

                <p>
                  Change your assumptions and watch
                  the decision change.
                </p>

              </div>

            </div>

          </div>


          <div className="sliders">


            {[
              ["Money","money"],
              ["Career","career"],
              ["Time","time"],
              ["Risk","risk"]
            ].map(
              ([label,key])=>(

                <div
                  className="slider"
                  key={key}
                >


                  <label>

                    <span>
                      {label}
                    </span>

                    <b>
                      {vars[key]}%
                    </b>

                  </label>


                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vars[key]}
                    onChange={e=>

                      setVars({
                        ...vars,
                        [key]:
                          Number(e.target.value)
                      })

                    }
                  />


                  <div className="rangeLabels">

                    <span>
                      Low
                    </span>

                    <span>
                      High
                    </span>

                  </div>


                </div>

              )
            )}


          </div>


        </div>


        {/* SCENARIO */}

        <div className="scenarioBox">


          <div className="scenarioTitle">

            <b>
              Scenario Simulator
            </b>

            <span>
              Test different futures
            </span>

          </div>


          <div className="scenarioButtons">


            <button
              className={
                scenario==="optimistic"
                  ? "active"
                  : ""
              }
              onClick={()=>
                setScenario("optimistic")
              }
            >
              Optimistic
            </button>


            <button
              className={
                scenario==="realistic"
                  ? "active"
                  : ""
              }
              onClick={()=>
                setScenario("realistic")
              }
            >
              Realistic
            </button>


            <button
              className={
                scenario==="worst"
                  ? "active"
                  : ""
              }
              onClick={()=>
                setScenario("worst")
              }
            >
              Worst Case
            </button>


          </div>


        </div>


        {/* BAR CHART */}

        <div className="panel chart">


          <div className="panelHead">

            <div>

              <SlidersHorizontal/>

              <div>

                <h3>
                  Decision Comparison
                </h3>

                <p>
                  Current score after your assumptions.
                </p>

              </div>

            </div>

          </div>


          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <BarChart data={scores}>

              <XAxis dataKey="name"/>

              <YAxis
                domain={[0,10]}
              />

              <Tooltip/>

              <Bar
                dataKey="score"
              />

            </BarChart>

          </ResponsiveContainer>


        </div>


        {/* RADAR CHART */}

        <div className="panel chart">


          <div className="panelHead">

            <div>

              <div>

                <h3>
                  Factor Profile
                </h3>

                <p>
                  How each option performs across factors.
                </p>

              </div>

            </div>

          </div>


          <ResponsiveContainer
            width="100%"
            height={340}
          >

            <RadarChart
              data={radar}
              cx="50%"
              cy="50%"
              outerRadius="72%"
            >

              <PolarGrid/>

              <PolarAngleAxis
                dataKey="factor"
              />

              <PolarRadiusAxis
                domain={[0,10]}
                tickCount={6}
              />


              <Radar
                name={data.options[0].name}
                dataKey={data.options[0].name}
                strokeWidth={2}
                fillOpacity={0.15}
              />


              <Radar
                name={data.options[1].name}
                dataKey={data.options[1].name}
                strokeWidth={2}
                fillOpacity={0.15}
              />


              <Tooltip/>


            </RadarChart>

          </ResponsiveContainer>


        </div>

{/* DECISION IMPACT */}

<div className="panel impactPanel">

  <div className="panelHead">

    <div>

      <Sparkles/>

      <div>

        <h3>Decision Impact</h3>

        <p>
          Why the current recommendation looks this way.
        </p>

      </div>

    </div>

  </div>


  <div className="impactText">

    {scoreDifference < 0.1 ? (

      <p>
        <b>This is a very close decision.</b>{" "}
        Small changes in your priorities or assumptions
        could change the recommendation.
      </p>

    ) : (

      <p>
        <b>{winner?.name}</b>{" "}
        currently leads by{" "}
        <b>{scoreDifference.toFixed(2)} points</b>.
      </p>

    )}


    <p>
      The strongest factor is{" "}
      <b>{data.strongest_factor}</b>,
      which has a major influence on the current result.
    </p>


    <p>
      Your current priorities are weighted at{" "}
      <b>{vars.money}% Money</b>,{" "}
      <b>{vars.career}% Career</b>,{" "}
      <b>{vars.time}% Time</b> and{" "}
      <b>{vars.risk}% Risk</b>.
    </p>


    <p>
      <b>What-if insight:</b>{" "}
      Moving a slider changes the assumptions behind
      the decision. If the leader changes, the decision
      is sensitive to that factor.
    </p>

  </div>

</div>
        {/* FINAL RECOMMENDATION */}

        <section className="finalCard">


          <div>

            <div className="eyebrow">

              <Sparkles size={15}/>

              FINAL RECOMMENDATION

            </div>


            <h2>
              {winner?.name}
            </h2>


            <p>

              {scoreDifference < 0.1
                ? "This is a very close decision. Small changes in your priorities could change the result."
                : "This option currently has the strongest fit with your priorities."
              }

            </p>


          </div>


          <div className="finalStats">


            <div>

              <strong>
                {winner?.score?.toFixed(2) || "0.00"}
              </strong>

              <span>
                Score / 10
              </span>

            </div>


            <div>

              <strong>

                {winner
                  ? Math.round(
                      (winner.score/10)*100
                    )
                  : 0
                }%

              </strong>

              <span>
                Confidence
              </span>

            </div>


            <div>

              <strong>

                {
                  scoreDifference < 0.1
                    ? "Medium"
                    : winner && winner.score>=7.5
                      ? "Low"
                      : winner && winner.score>=6
                        ? "Medium"
                        : "High"
                }

              </strong>

              <span>
                Risk
              </span>

            </div>


          </div>


        </section>


        {/* INSIGHTS */}

        <section className="insightGrid">


          <div className="panel insight">


            <div className="icon">

              <Sparkles/>

            </div>


            <h3>
              AI Insight
            </h3>


            <p>
              {data.summary}
            </p>


            <p>

              <b>
                Strongest factor:
              </b>{" "}

              {data.strongest_factor}

            </p>


            <p>

              <b>
                Why this option won:
              </b>{" "}

              {winner?.name} has the strongest overall
              fit with your selected priorities and assumptions.

            </p>


            <p>

              <b>
                Decision strength:
              </b>{" "}

              {decisionStrength}

            </p>


            <p>

              <b>
                Confidence:
              </b>{" "}

              {winner
                ? Math.round(
                    (winner.score/10)*100
                  )
                : 0
              }%

            </p>


            <p>

              <b>
                Risk level:
              </b>{" "}

              {
                scoreDifference < 0.1
                  ? "Medium"
                  : winner && winner.score>=7.5
                    ? "Low"
                    : winner && winner.score>=6
                      ? "Medium"
                      : "High"
              }

            </p>


          </div>


          <div className="panel insight">


            <div className="icon warn">

              <AlertTriangle/>

            </div>


            <h3>
              Biggest uncertainty
            </h3>


            <p>
              {data.biggest_uncertainty}
            </p>


            <h4>
              Information that could change your decision
            </h4>


            {data.missing_information?.map(
              (x,i)=>(

                <p
                  className="bullet"
                  key={i}
                >
                  → {x}
                </p>

              )
            )}


          </div>


        </section>


        <footer>

          Scores are estimates based on your assumptions —
          not predictions or professional advice.

        </footer>


      </main>

    </div>

  );

}


createRoot(
  document.getElementById("root")
).render(
  <App/>
);
