import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const API = "http://127.0.0.1:8000";
const COLORS = ["#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6","#ec4899","#14b8a6","#f97316","#8b5cf6","#84cc16"];

/* ─── Animated Counter ─── */
function useCounter(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return val;
}

/* ─── Skeleton ─── */
function Skeleton({ w = "100%", h = 20, radius = 6 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: "linear-gradient(90deg,#2a2a3e 25%,#3a3a52 50%,#2a2a3e 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
  );
}

/* ─── Stat Card ─── */
function StatCard({ label, value, icon, loading }) {
  const count = useCounter(typeof value === "number" ? value : 0);
  return (
    <div style={{ background: "#1e1e2e", border: "1px solid #2e2e42", borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
      {loading ? <Skeleton h={28} w="60%" /> : (
        <div style={{ color: "#fff", fontSize: typeof value === "number" ? 26 : 18, fontWeight: 700, lineHeight: 1 }}>
          {typeof value === "number" ? count.toLocaleString() : value}
        </div>
      )}
      <div style={{ color: "#666", fontSize: 11, marginTop: 5, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

/* ─── Chart Card ─── */
function ChartCard({ title, children, loading, action }) {
  return (
    <div style={{ background: "#1e1e2e", border: "1px solid #2e2e42", borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ color: "#c9d1e0", fontSize: 14, fontWeight: 600 }}>{title}</span>
        {action}
      </div>
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton h={180} radius={8} />
        </div>
      ) : children}
    </div>
  );
}

/* ─── Tooltip ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#2a2a3e", border: "1px solid #3e3e58", borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ color: "#aaa", margin: 0, fontSize: 12 }}>{label || payload[0].name}</p>
      <p style={{ color: "#fff", margin: "4px 0 0", fontWeight: 700 }}>{payload[0].value.toLocaleString()} listings</p>
    </div>
  );
};

/* ─── City Modal ─── */
function CityModal({ city, data, onClose }) {
  if (!city) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#1a1a2e", border: "1px solid #3e3e58", borderRadius: 16, padding: 28, width: 480, maxWidth: "90vw" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>📍 {city}</div>
            <div style={{ color: "#666", fontSize: 12, marginTop: 2 }}>Category breakdown</div>
          </div>
          <button onClick={onClose} style={{ background: "#2e2e42", border: "none", color: "#fff", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}>✕ Close</button>
        </div>
        {data.length === 0 ? <div style={{ color: "#666", textAlign: "center", padding: 20 }}>No data</div> : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fill: "#888", fontSize: 11 }} />
              <YAxis dataKey="category" type="category" tick={{ fill: "#ccc", fontSize: 11 }} width={120} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff0d" }} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [cityData, setCityData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [listings, setListings] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [selectedCity, setSelectedCity] = useState(null);
  const [cityModalData, setCityModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const searchTimer = useRef(null);

  const isDark = theme === "dark";
  const bg = isDark ? "#13131f" : "#f0f0f8";
  const cardBg = isDark ? "#1e1e2e" : "#ffffff";
  const border = isDark ? "#2e2e42" : "#e0e0f0";
  const text = isDark ? "#e2e8f0" : "#1a1a2e";
  const muted = isDark ? "#888" : "#666";

  // Fetch charts data
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [city, cat, src] = await Promise.all([
          fetch(`${API}/city-count`).then(r => r.json()),
          fetch(`${API}/category-count`).then(r => r.json()),
          fetch(`${API}/source-count`).then(r => r.json()),
        ]);
        setCityData(city);
        setCategoryData(cat);
        setSourceData(src);
      } catch {
        setError("Cannot connect to backend. Make sure FastAPI is running on port 8000.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Fetch listings table
  useEffect(() => {
    const fetchListings = async () => {
      setTableLoading(true);
      try {
        const res = await fetch(`${API}/listings?search=${encodeURIComponent(search)}&page=${page}&limit=15`);
        const data = await res.json();
        setListings(data.data);
        setTotalListings(data.total);
      } catch {}
      setTableLoading(false);
    };
    fetchListings();
  }, [search, page]);

  // Search debounce
  const handleSearchInput = (val) => {
    setSearchInput(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  };

  // City bar click
  const handleCityClick = async (data) => {
    if (!data?.activePayload?.[0]) return;
    const city = data.activePayload[0].payload.city;
    setSelectedCity(city);
    setModalLoading(true);
    setCityModalData([]);
    try {
      const res = await fetch(`${API}/city-details/${encodeURIComponent(city)}`);
      const d = await res.json();
      setCityModalData(d);
    } catch {}
    setModalLoading(false);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["ID","Business Name","Category","City","Address","Phone","Source"];
    const rows = listings.map(r => [r.id, `"${r.business_name}"`, `"${r.category}"`, `"${r.city}"`, `"${r.address}"`, r.phone, r.source]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "listings.csv"; a.click();
  };

  const totalPages = Math.ceil(totalListings / 15);
  const topCity = cityData[0]?.city || "—";
  const topCategory = categoryData[0]?.category?.slice(0, 16) || "—";

  if (error) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#13131f", color: "#ef4444", fontSize: 15, padding: 40, textAlign: "center" }}>
      ⚠️ {error}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3e3e58; border-radius: 3px; }
        .row-hover:hover { background: #ffffff08 !important; }
        .city-bar { cursor: pointer; }
      `}</style>

      <div style={{ background: bg, minHeight: "100vh", color: text, transition: "background 0.3s" }}>

        {/* Header */}
        <div style={{ borderBottom: `1px solid ${border}`, padding: "16px 36px", display: "flex", alignItems: "center", gap: 12, background: cardBg, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#6366f1" }} />
          <span style={{ fontSize: 18, fontWeight: 700 }}>Business Listings Dashboard</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: muted, background: isDark ? "#2a2a3e" : "#f0f0f8", padding: "3px 10px", borderRadius: 20, border: `1px solid ${border}` }}>
            FastAPI + MySQL
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={exportCSV} style={{ background: "#6366f1", border: "none", color: "#fff", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500 }}>
              ⬇ Export CSV
            </button>
            <button onClick={() => setTheme(isDark ? "light" : "dark")} style={{ background: isDark ? "#2e2e42" : "#e0e0f0", border: "none", color: text, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 14 }}>
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>

        <div style={{ padding: "28px 36px" }}>

          {/* Stat Cards */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard label="Total Listings" value={cityData.reduce((s, d) => s + d.count, 0)} icon="📋" loading={loading} />
            <StatCard label="Cities" value={cityData.length} icon="🏙️" loading={loading} />
            <StatCard label="Categories" value={categoryData.length} icon="🏷️" loading={loading} />
            <StatCard label="Sources" value={sourceData.length} icon="🌐" loading={loading} />
            <StatCard label="Top City" value={topCity} icon="📍" loading={loading} />
            <StatCard label="Top Category" value={topCategory} icon="⭐" loading={loading} />
          </div>

          {/* Charts Row 1 - City */}
          <div style={{ marginBottom: 20 }}>
            <ChartCard title="📍 City-wise Count  —  click a bar to see breakdown" loading={loading}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cityData.slice(0, 15)} margin={{ bottom: 50 }} onClick={handleCityClick} className="city-bar">
                  <XAxis dataKey="city" tick={{ fill: muted, fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                  <YAxis tick={{ fill: muted, fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {cityData.slice(0, 15).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p style={{ color: muted, fontSize: 11, textAlign: "center", marginTop: 4 }}>💡 Click any bar to view category breakdown for that city</p>
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

            <ChartCard title="🏷️ Top Categories" loading={loading}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" tick={{ fill: muted, fontSize: 11 }} />
                  <YAxis dataKey="category" type="category" tick={{ fill: muted, fontSize: 10 }} width={130} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {categoryData.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="🌐 Source Distribution" loading={loading}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={sourceData} dataKey="count" nameKey="source" cx="50%" cy="45%" outerRadius={100} innerRadius={55} paddingAngle={3}
                    label={({ source, percent }) => `${source} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: muted }}>
                    {sourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: muted, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

          {/* Listings Table */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <span style={{ color: text, fontSize: 14, fontWeight: 600 }}>📊 All Listings  <span style={{ color: muted, fontWeight: 400 }}>({totalListings.toLocaleString()} total)</span></span>
              <input
                value={searchInput}
                onChange={e => handleSearchInput(e.target.value)}
                placeholder="🔍  Search by name, city, category..."
                style={{ background: isDark ? "#2a2a3e" : "#f5f5ff", border: `1px solid ${border}`, borderRadius: 8, padding: "8px 14px", color: text, fontSize: 13, width: 280, outline: "none" }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${border}` }}>
                    {["#","Business Name","Category","City","Phone","Source"].map(h => (
                      <th key={h} style={{ color: muted, padding: "10px 12px", textAlign: "left", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    Array(8).fill(0).map((_, i) => (
                      <tr key={i}><td colSpan={6} style={{ padding: "10px 12px" }}><Skeleton h={16} /></td></tr>
                    ))
                  ) : listings.map((row, i) => (
                    <tr key={row.id} className="row-hover" style={{ borderBottom: `1px solid ${border}`, background: i % 2 === 0 ? "transparent" : (isDark ? "#ffffff03" : "#f9f9ff") }}>
                      <td style={{ padding: "10px 12px", color: muted }}>{row.id}</td>
                      <td style={{ padding: "10px 12px", color: text, fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.business_name}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ background: isDark ? "#6366f120" : "#ededff", color: "#6366f1", padding: "3px 9px", borderRadius: 20, fontSize: 11, whiteSpace: "nowrap" }}>{row.category?.slice(0, 20)}</span>
                      </td>
                      <td style={{ padding: "10px 12px", color: text }}>{row.city}</td>
                      <td style={{ padding: "10px 12px", color: muted }}>{row.phone}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ background: isDark ? "#10b98120" : "#e6fff5", color: "#10b981", padding: "3px 9px", borderRadius: 20, fontSize: 11 }}>{row.source?.slice(0, 15)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, flexWrap: "wrap", gap: 8 }}>
              <span style={{ color: muted, fontSize: 12 }}>Page {page} of {totalPages}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ background: isDark ? "#2e2e42" : "#ededff", border: "none", color: page === 1 ? muted : text, borderRadius: 7, padding: "6px 14px", cursor: page === 1 ? "default" : "pointer", fontSize: 13 }}>
                  ← Prev
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2 + i, totalPages - 4 + i));
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      style={{ background: p === page ? "#6366f1" : (isDark ? "#2e2e42" : "#ededff"), border: "none", color: p === page ? "#fff" : text, borderRadius: 7, padding: "6px 12px", cursor: "pointer", fontSize: 13, minWidth: 34 }}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ background: isDark ? "#2e2e42" : "#ededff", border: "none", color: page === totalPages ? muted : text, borderRadius: 7, padding: "6px 14px", cursor: page === totalPages ? "default" : "pointer", fontSize: 13 }}>
                  Next →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* City Modal */}
      {selectedCity && (
        <CityModal
          city={selectedCity}
          data={modalLoading ? [] : cityModalData}
          onClose={() => setSelectedCity(null)}
        />
      )}
    </>
  );
}