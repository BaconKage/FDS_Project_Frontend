import { useEffect, useRef, useState } from "react";

/* ---------- Backend base URL (env-first) ---------- */
const API =
  import.meta.env.VITE_API_URL?.toString().replace(/\/+$/, "") ||
  (typeof window !== "undefined" ? window.location.origin : "");

/* --- Safely render Plotly HTML strings --- */
function PlotlyHTML({ html }: { html?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = html || "";
    // Re-run any inline <script> tags Plotly includes
    const scripts = Array.from(el.getElementsByTagName("script"));
    scripts.forEach((oldS) => {
      const s = document.createElement("script");
      for (const a of Array.from(oldS.attributes)) s.setAttribute(a.name, a.value);
      if (oldS.src) s.src = oldS.src;
      else s.text = oldS.innerHTML;
      oldS.parentNode?.replaceChild(s, oldS);
    });
  }, [html]);
  return <div ref={ref} />;
}

/* --- Types --- */
type Card = { title: string; value: number | string | null; unit: string };
type Charts = {
  bmi?: string;
  hr_sleep?: string;
  bp_scatter?: string;
  hr_hist?: string;
  sleep_hist?: string;
};
type DashboardResp = { cards: Card[]; charts: Charts };

type Comp = {
  label: string;
  user_value: number | null;
  dataset_avg: number | null;
  difference: number | null;
  percentile: number | null;
  status: string | null;
};
type CompareResp = { comparisons: Record<string, Comp>; charts: Charts };

export default function Dashboard() {
  const [cards, setCards] = useState<Card[]>([]);
  const [globalCharts, setGlobalCharts] = useState<Charts>({});
  const [cmp, setCmp] = useState<CompareResp | null>(null);
  const [error, setError] = useState<string>("");

  /* Load global KPIs + charts */
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/dashboard`, {
          headers: { Accept: "application/json" },
        });
        if (!r.ok) throw new Error(`Dashboard ${r.status} ${r.statusText}`);
        const d: DashboardResp = await r.json();
        setCards(d.cards || []);
        setGlobalCharts(d.charts || {});
      } catch (e: any) {
        setError(String(e?.message || e));
      }
    })();
  }, []);

  /* Load personalized comparison if we have a saved submission */
  useEffect(() => {
    const raw = localStorage.getItem("lastSubmission");
    if (!raw) return;
    try {
      const last = JSON.parse(raw);
      (async () => {
        try {
          const r = await fetch(`${API}/compare`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              Height: last.Height,
              Weight: last.Weight,
              SystolicBP: last.SystolicBP,
              DiastolicBP: last.DiastolicBP,
              HeartRate: last.HeartRate,
              SleepDuration: last.SleepDuration,
            }),
          });
          if (!r.ok) throw new Error(`Compare ${r.status} ${r.statusText}`);
          const d: CompareResp = await r.json();
          setCmp(d);
        } catch (e) {
          console.error(e);
        }
      })();
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (error) {
    return (
      <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* KPI Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="text-gray-500 text-sm">{c.title}</div>
            <div className="mt-1 text-2xl font-semibold">
              {c.value ?? "—"}{" "}
              <span className="text-sm text-gray-500">{c.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Personalized comparison table (if available) */}
      {cmp && (
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="font-semibold text-gray-800">Your Stats vs Global Dataset</h3>
            <p className="text-xs text-gray-500">
              “Percentile” shows where you stand within the dataset (higher = larger than more
              people).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-gray-600 border-b">
                <tr>
                  <th className="text-left py-2 pr-4">Metric</th>
                  <th className="text-left py-2 pr-4">You</th>
                  <th className="text-left py-2 pr-4">Dataset Avg</th>
                  <th className="text-left py-2 pr-4">Diff</th>
                  <th className="text-left py-2 pr-4">Percentile</th>
                  <th className="text-left py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(cmp.comparisons).map((m, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-2 pr-4 font-medium">{m.label}</td>
                    <td className="py-2 pr-4">{m.user_value ?? "—"}</td>
                    <td className="py-2 pr-4">{m.dataset_avg ?? "—"}</td>
                    <td className="py-2 pr-4">{m.difference ?? "—"}</td>
                    <td className="py-2 pr-4">
                      {m.percentile == null ? "—" : `${m.percentile}th`}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          m.status?.startsWith("Above")
                            ? "bg-emerald-100 text-emerald-700"
                            : m.status?.startsWith("Below")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {m.status ?? "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="lg:col-span-3 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold mb-2 text-gray-800">
            BMI Distribution {cmp ? "(Your marker)" : ""}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Dashed line marks your BMI.</p>
          <PlotlyHTML html={cmp?.charts?.bmi ?? globalCharts.bmi} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold mb-2 text-gray-800">
            Heart Rate vs Sleep {cmp ? "(Your marker)" : ""}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Your point appears as a red star; more sleep often correlates with lower resting HR.
          </p>
          <PlotlyHTML html={cmp?.charts?.hr_sleep ?? globalCharts.hr_sleep} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold mb-2 text-gray-800">
            Systolic vs Diastolic {cmp ? "(Your marker)" : ""}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Typical healthy adults are near 120/80 mmHg; sustained points above 140/90 indicate risk.
          </p>
          <PlotlyHTML html={cmp?.charts?.bp_scatter ?? globalCharts.bp_scatter} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="font-semibold mb-2 text-gray-800">
            Heart Rate Distribution {cmp ? "(Your marker)" : ""}
          </h3>
          <p className="text-sm text-gray-500 mb-4">Dashed line marks your heart rate.</p>
          <PlotlyHTML html={cmp?.charts?.hr_hist ?? globalCharts.hr_hist} />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 xl:col-span-2">
          <h3 className="font-semibold mb-2 text-gray-800">
            Sleep Duration Distribution {cmp ? "(Your marker)" : ""}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Aim for 7–8 hours/night; dashed line marks your sleep duration.
          </p>
          <PlotlyHTML html={cmp?.charts?.sleep_hist ?? globalCharts.sleep_hist} />
        </div>
      </div>

      {/* Tableau embed */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <h3 className="font-semibold mb-2 text-gray-800">
          Global Health Dataset – Tableau Visualization
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Visualization of the same cleaned dataset in Tableau, as required for the course.
        </p>
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            src="https://public.tableau.com/views/WorldHealthDashboard_17621721986600/WorldHealthDashboard?:showVizHome=no&:embed=true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
