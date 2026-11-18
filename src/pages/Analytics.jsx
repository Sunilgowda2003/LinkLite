import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  ExternalLink,
  Globe,
  Link2,
  LoaderCircle,
  Moon,
  MousePointerClick,
  QrCode,
  RefreshCw,
  Sun,
  TrendingUp,
  X,
} from "lucide-react";

import analyticsService from "../services/analyticsService";
import QRCodeModal from "../components/QRCodeModal";
import "./Analytics.css";

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(value ?? 0);

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

const getShortUrl = (code) => `${window.location.origin}/${code}`;

const getLocalDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatRelativeTime = (value) => {
  if (!value) return "Unknown time";
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return "Unknown time";
  const minutes = Math.max(0, Math.floor((Date.now() - timestamp.getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return timestamp.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatExactTimestamp = (value) => {
  if (!value) return "—";
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) return "—";
  return timestamp.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
};

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [dailyClicks, setDailyClicks] = useState([]);
  const [topUrls, setTopUrls] = useState([]);
  
  const [recentClicks, setRecentClicks] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedAnalytics, setSelectedAnalytics] = useState(null);
  const [selectedQrUrl, setSelectedQrUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");
  const [dateFilter, setDateFilter] = useState({ range: "7d" });
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("linklite-theme") !== "light"
  );

  useEffect(() => {
    localStorage.setItem("linklite-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const loadAnalytics = useCallback(
    async (isRefresh = false, filters = { range: "7d" }) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const [summaryData, dailyData, topData, recentData, comparisonResult] =
          await Promise.all([
            analyticsService.getSummary(),
            analyticsService.getDailyClicks(filters),
            analyticsService.getTopUrls(),
            analyticsService.getRecentClicks(),
            analyticsService.getUrlPerformanceComparison(filters),
          ]);

        setSummary(summaryData);
        setDailyClicks(Array.isArray(dailyData) ? dailyData : []);
        setTopUrls(Array.isArray(topData) ? topData : []);
        setRecentClicks(Array.isArray(recentData) ? recentData : []);
        setComparisonData(
          Array.isArray(comparisonResult) ? comparisonResult : []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load analytics. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadAnalytics(false, dateFilter);
  }, [loadAnalytics, dateFilter]);

  const chartData = useMemo(
    () =>
      dailyClicks.map((item) => ({
        ...item,
        label: formatDate(item.date),
        clicks: Number(item.clicks ?? 0),
      })),
    [dailyClicks]
  );

  const totalClicks = Number(summary?.totalClicks ?? 0);
  const totalUrls = Number(summary?.totalUrls ?? 0);

  const clicksInPeriod = chartData.reduce(
    (sum, item) => sum + item.clicks,
    0
  );

  const averageClicks =
    chartData.length > 0
      ? (clicksInPeriod / chartData.length).toFixed(1)
      : "0.0";

  const comparisonChartData = comparisonData
    .slice()
    .sort(
      (a, b) =>
        Number(b.currentPeriodClicks ?? 0) -
        Number(a.currentPeriodClicks ?? 0)
    )
    .slice(0, 8)
    .map((item) => ({
      ...item,
      label: `/${item.shortCode}`,
      currentClicks: Number(item.currentPeriodClicks ?? 0),
      previousClicks: Number(item.previousPeriodClicks ?? 0),
    }));

  const mostPerformingUrl = comparisonData.reduce(
    (best, item) =>
      !best ||
      Number(item.currentPeriodClicks ?? 0) >
        Number(best.currentPeriodClicks ?? 0)
        ? item
        : best,
    null
  );

  const leastPerformingUrl = comparisonData.reduce(
    (least, item) =>
      !least ||
      Number(item.currentPeriodClicks ?? 0) <
        Number(least.currentPeriodClicks ?? 0)
        ? item
        : least,
    null
  );

  const formatGrowth = (value) => {
    if (value == null) return "New activity";
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return "—";
    if (numericValue > 0) return `+${numericValue.toFixed(1)}%`;
    return `${numericValue.toFixed(1)}%`;
  };

  const applyDateRange = (range) => {
    setDateFilter({ range });
  };

  const applyCustomDateRange = () => {
    if (!customStartDate || !customEndDate) {
      setError("Please select both start and end dates.");
      return;
    }

    if (customStartDate > customEndDate) {
      setError("Start date cannot be after end date.");
      return;
    }

    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    if (customEndDate > todayString) {
      setError("Future dates are not allowed.");
      return;
    }

    setDateFilter({
      startDate: customStartDate,
      endDate: customEndDate,
    });
  };

  const getPeriodLabel = () => {
    if (dateFilter.startDate && dateFilter.endDate) {
      return `${formatDate(dateFilter.startDate)} - ${formatDate(
        dateFilter.endDate
      )}`;
    }

    switch (dateFilter.range) {
      case "today":
        return "Today";
      case "30d":
        return "Last 30 days";
      default:
        return "Last 7 days";
    }
  };

  const openUrlAnalytics = async (url) => {
    setDetailLoading(true);
    setDetailError("");
    setSelectedAnalytics(null);

    try {
      const data = await analyticsService.getUrlAnalytics(url.id);
      setSelectedAnalytics(data);
    } catch (err) {
      setDetailError(
        err.response?.data?.message ||
          "Unable to load details for this URL."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const copyShortUrl = async (code) => {
    try {
      await navigator.clipboard.writeText(getShortUrl(code));
      setCopiedCode(code);
      window.setTimeout(() => setCopiedCode(""), 1800);
    } catch {
      setError("Unable to copy the URL. Please copy it manually.");
    }
  };

  const exportCsv = () => {
    const rows = [
      ["LinkLite Analytics Report"],
      ["Generated At", new Date().toLocaleString()],
      ["Selected Period", getPeriodLabel()],
      [],
      ["Overview"],
      ["Total URLs", totalUrls],
      ["Total Clicks", totalClicks],
      [],
      ["Daily Click Performance"],
      ["Date", "Clicks"],
      ...dailyClicks.map((item) => [item.date, item.clicks]),
      [],
      ["Top Performing URLs"],
      ["Short Code", "Original URL", "Total Clicks"],
      ...topUrls.map((url) => [
        url.shortCode,
        url.originalUrl,
        url.totalClicks,
      ]),
      [],
      ["URL Performance Comparison"],
      [
        "Short Code",
        "Original URL",
        "Total Clicks",
        "Current Period Clicks",
        "Previous Period Clicks",
        "Growth Percentage",
      ],
      ...comparisonData.map((item) => [
        item.shortCode,
        item.originalUrl,
        item.totalClicks,
        item.currentPeriodClicks,
        item.previousPeriodClicks,
        item.growthPercentage == null ? "N/A" : `${Number(item.growthPercentage).toFixed(1)}%`,
      ]),
      [],
      ["Recent Click Activity"],
      ["Short Code", "Original URL", "Clicked At"],
      ...recentClicks.map((click) => [
        click.shortCode,
        click.originalUrl,
        click.clickedAt,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "linklite-analytics-report.csv";
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  };

  return (
    <div className={`analytics-page ${darkMode ? "analytics-dark" : "analytics-light"}`}>
      <aside className="analytics-sidebar">
        <Link to="/dashboard" className="analytics-brand">
          <span className="analytics-brand-icon">
            <Link2 size={22} />
          </span>
          <span>
            <strong>LinkLite</strong>
            <small>URL MANAGEMENT</small>
          </span>
        </Link>

        <div className="analytics-nav-label">WORKSPACE</div>

        <nav className="analytics-nav">
          <Link to="/dashboard" className="analytics-nav-item">
            <Link2 size={18} />
            <span>My Links</span>
          </Link>

          <Link to="/analytics" className="analytics-nav-item active">
            <BarChart3 size={18} />
            <span>Analytics</span>
            <span className="analytics-nav-dot" />
          </Link>
        </nav>

        <div className="analytics-sidebar-bottom">
          <div className="analytics-help-card">
            <span className="analytics-help-icon">
              <CircleHelp size={18} />
            </span>
            <strong>Need help?</strong>
            <p>Track your links and understand your audience.</p>
            <Link to="/dashboard">
              Manage your links <ChevronRight size={14} />
            </Link>
          </div>

          <div className="analytics-sidebar-footer">
            <Globe size={15} />
            <span>LinkLite Analytics Pro</span>
          </div>
        </div>
      </aside>

      <main className="analytics-main">
        <header className="analytics-topbar">
          <div>
            <div className="analytics-breadcrumb">
              Workspace <ChevronRight size={13} /> Analytics
            </div>
            <p className="analytics-topbar-caption">
              Understand how your links are performing.
            </p>
          </div>

          <div className="analytics-topbar-actions">
            <button
              className="analytics-icon-button"
              onClick={() => setDarkMode((current) => !current)}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              className="analytics-refresh-button"
              onClick={() => loadAnalytics(true, dateFilter)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? "analytics-spin" : ""}
              />
              <span>{refreshing ? "Refreshing" : "Refresh"}</span>
            </button>

            <button className="analytics-export-button" onClick={exportCsv}>
              <Activity size={16} />
              <span>Export CSV</span>
            </button>
          </div>
        </header>

        <section className="analytics-content">
          <div className="analytics-heading-row">
            <div>
              <div className="analytics-eyebrow">
                <span className="analytics-live-dot" />
                PERFORMANCE OVERVIEW
              </div>
              <h1>Analytics Overview</h1>
              <p>Monitor your link performance and click activity.</p>
            </div>

            <div className="analytics-period">
              <CalendarDays size={16} />
              <span>{getPeriodLabel()}</span>
            </div>
          </div>

          <div className="analytics-date-filters">
            <div className="analytics-filter-buttons">
              <button
                className={dateFilter.range === "today" ? "active" : ""}
                onClick={() => applyDateRange("today")}
              >
                Today
              </button>
              <button
                className={dateFilter.range === "7d" ? "active" : ""}
                onClick={() => applyDateRange("7d")}
              >
                7 Days
              </button>
              <button
                className={dateFilter.range === "30d" ? "active" : ""}
                onClick={() => applyDateRange("30d")}
              >
                30 Days
              </button>
            </div>

            <div className="analytics-custom-filter">
              <input
                type="date"
                aria-label="Start date"
                value={customStartDate}
                max={getLocalDateString()}
                onChange={(event) => setCustomStartDate(event.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                aria-label="End date"
                value={customEndDate}
                min={customStartDate || undefined}
                max={getLocalDateString()}
                onChange={(event) => setCustomEndDate(event.target.value)}
              />
              <button onClick={applyCustomDateRange}>Apply</button>
            </div>
          </div>

          {error && (
            <div className="analytics-error">
              <span>{error}</span>
              <button onClick={() => loadAnalytics(true, dateFilter)}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="analytics-loading">
              <LoaderCircle className="analytics-spin" size={30} />
              <span>Loading your analytics...</span>
            </div>
          ) : (
            <>
              <div className="analytics-stat-grid">
                <motion.div
                  className="analytics-stat-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="analytics-stat-top">
                    <span>Total URLs</span>
                    <span className="analytics-stat-icon violet">
                      <Link2 size={19} />
                    </span>
                  </div>
                  <h2>{formatNumber(totalUrls)}</h2>
                  <p>
                    <span className="analytics-neutral-indicator">
                      <Activity size={13} /> Your links
                    </span>
                    <span>Created links</span>
                  </p>
                </motion.div>

                <motion.div
                  className="analytics-stat-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.06 }}
                >
                  <div className="analytics-stat-top">
                    <span>Total Clicks</span>
                    <span className="analytics-stat-icon cyan">
                      <MousePointerClick size={19} />
                    </span>
                  </div>
                  <h2>{formatNumber(totalClicks)}</h2>
                  <p>
                    <span className="analytics-neutral-indicator">
                      <TrendingUp size={13} /> All time
                    </span>
                    <span>Recorded clicks</span>
                  </p>
                </motion.div>

                <motion.div
                  className="analytics-stat-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.12 }}
                >
                  <div className="analytics-stat-top">
                    <span>Clicks in Period</span>
                    <span className="analytics-stat-icon green">
                      <ArrowUpRight size={19} />
                    </span>
                  </div>
                  <h2>{formatNumber(clicksInPeriod)}</h2>
                  <p>
                    <span className="analytics-neutral-indicator">
                      <CalendarDays size={13} /> Selected range
                    </span>
                    <span>From daily activity</span>
                  </p>
                </motion.div>

                <motion.div
                  className="analytics-stat-card"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.18 }}
                >
                  <div className="analytics-stat-top">
                    <span>Daily Average</span>
                    <span className="analytics-stat-icon orange">
                      <BarChart3 size={19} />
                    </span>
                  </div>
                  <h2>{averageClicks}</h2>
                  <p>
                    <span className="analytics-neutral-indicator">
                      <Activity size={13} /> Selected period
                    </span>
                    <span>Clicks per day</span>
                  </p>
                </motion.div>
              </div>

              <div className="analytics-chart-card">
                <div className="analytics-card-heading">
                  <div>
                    <h3>Click Performance</h3>
                    <p>Your daily click activity for {getPeriodLabel()}</p>
                  </div>
                  <span className="analytics-chart-badge">
                    <span className="analytics-live-dot" />
                    Daily activity
                  </span>
                </div>

                <div className="analytics-chart">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="linkliteClickGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.32}
                            />
                            <stop
                              offset="100%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.01}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="4 5"
                          vertical={false}
                          stroke="var(--analytics-grid)"
                        />

                        <XAxis
                          dataKey="label"
                          tick={{ fill: "var(--analytics-muted)", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          dy={10}
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "var(--analytics-muted)", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip
                          contentStyle={{
                            background: "var(--analytics-tooltip)",
                            border: "1px solid var(--analytics-border)",
                            borderRadius: "12px",
                            color: "var(--analytics-text)",
                          }}
                          labelStyle={{ color: "var(--analytics-muted)" }}
                          formatter={(value) => [
                            `${formatNumber(value)} clicks`,
                            "Clicks",
                          ]}
                        />

                        <Area
                          type="monotone"
                          dataKey="clicks"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          fill="url(#linkliteClickGradient)"
                          activeDot={{
                            r: 6,
                            stroke: "#8b5cf6",
                            strokeWidth: 3,
                            fill: "var(--analytics-surface)",
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="analytics-empty-chart">
                      <BarChart3 size={30} />
                      <strong>No click activity available</strong>
                      <span>Your daily click data will appear here.</span>
                    </div>
                  )}
                </div>
              </div>

              <section className="analytics-comparison-section">
                <div className="analytics-comparison-heading">
                  <div>
                    <span className="analytics-comparison-eyebrow">
                      PERIOD-OVER-PERIOD INSIGHTS
                    </span>
                    <h3>URL Performance Comparison</h3>
                    <p>
                      Compare each link's clicks in {getPeriodLabel()} with
                      the immediately preceding period of equal length.
                    </p>
                  </div>
                  <span className="analytics-chart-badge">
                    <Activity size={14} />
                    {comparisonData.length} links compared
                  </span>
                </div>

                {comparisonData.length > 0 ? (
                  <>
                    <div className="analytics-comparison-highlights">
                      <div className="analytics-comparison-highlight">
                        <span>Most performing</span>
                        <strong>
                          {mostPerformingUrl
                            ? `/${mostPerformingUrl.shortCode}`
                            : "—"}
                        </strong>
                        <small>
                          {formatNumber(
                            mostPerformingUrl?.currentPeriodClicks
                          )}{" "}
                          clicks in selected period
                        </small>
                      </div>
                      <div className="analytics-comparison-highlight">
                        <span>Least performing</span>
                        <strong>
                          {leastPerformingUrl
                            ? `/${leastPerformingUrl.shortCode}`
                            : "—"}
                        </strong>
                        <small>
                          {formatNumber(
                            leastPerformingUrl?.currentPeriodClicks
                          )}{" "}
                          clicks in selected period
                        </small>
                      </div>
                    </div>

                    <div className="analytics-chart-card analytics-comparison-chart-card">
                      <div className="analytics-card-heading">
                        <div>
                          <h3>Current vs Previous Period</h3>
                          <p>
                            Showing up to eight links ranked by current-period
                            clicks.
                          </p>
                        </div>
                      </div>
                      <div className="analytics-comparison-chart">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={comparisonChartData}
                            margin={{ top: 12, right: 12, left: -18, bottom: 8 }}
                          >
                            <CartesianGrid
                              strokeDasharray="4 5"
                              vertical={false}
                              stroke="var(--analytics-grid)"
                            />
                            <XAxis
                              dataKey="label"
                              tick={{
                                fill: "var(--analytics-muted)",
                                fontSize: 11,
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              allowDecimals={false}
                              tick={{
                                fill: "var(--analytics-muted)",
                                fontSize: 11,
                              }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <Tooltip
                              contentStyle={{
                                background: "var(--analytics-tooltip)",
                                border: "1px solid var(--analytics-border)",
                                borderRadius: "10px",
                                color: "var(--analytics-text)",
                              }}
                              formatter={(value, name) => [
                                `${formatNumber(value)} clicks`,
                                name,
                              ]}
                            />
                            <Legend />
                            <Bar
                              dataKey="previousClicks"
                              name="Previous period"
                              fill="#06b6d4"
                              radius={[5, 5, 0, 0]}
                            />
                            <Bar
                              dataKey="currentClicks"
                              name="Current period"
                              fill="#8b5cf6"
                              radius={[5, 5, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="analytics-table-card analytics-comparison-table-card">
                      <div className="analytics-card-heading">
                        <div>
                          <h3>Link-by-Link Comparison</h3>
                          <p>
                            All your links, including links with zero clicks.
                          </p>
                        </div>
                      </div>
                      <div className="analytics-table-wrapper">
                        <table className="analytics-table">
                          <thead>
                            <tr>
                              <th>SHORT LINK</th>
                              <th>TOTAL CLICKS</th>
                              <th>CURRENT PERIOD</th>
                              <th>PREVIOUS PERIOD</th>
                              <th>GROWTH</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparisonData.map((item) => {
                              const growth = item.growthPercentage;
                              const growthClass =
                                growth == null
                                  ? "neutral"
                                  : Number(growth) > 0
                                    ? "positive"
                                    : Number(growth) < 0
                                      ? "negative"
                                      : "neutral";

                              return (
                                <tr key={item.urlId}>
                                  <td>
                                    <div className="analytics-short-link">
                                      <span className="analytics-link-icon">
                                        <Link2 size={15} />
                                      </span>
                                      <strong>/{item.shortCode}</strong>
                                      <button
                                        className="analytics-copy-button"
                                        onClick={() =>
                                          copyShortUrl(item.shortCode)
                                        }
                                        title="Copy short URL"
                                      >
                                        {copiedCode === item.shortCode ? (
                                          <Check size={14} />
                                        ) : (
                                          <Copy size={14} />
                                        )}
                                      </button>
                                    </div>
                                  </td>
                                  <td>
                                    <strong className="analytics-click-count">
                                      {formatNumber(item.totalClicks)}
                                    </strong>
                                  </td>
                                  <td>
                                    {formatNumber(item.currentPeriodClicks)}
                                  </td>
                                  <td>
                                    {formatNumber(item.previousPeriodClicks)}
                                  </td>
                                  <td>
                                    <span
                                      className={`analytics-growth-pill ${growthClass}`}
                                    >
                                      {growthClass === "positive" ? (
                                        <TrendingUp size={13} />
                                      ) : growthClass === "negative" ? (
                                        <ArrowUpRight
                                          size={13}
                                          className="analytics-growth-down"
                                        />
                                      ) : null}
                                      {formatGrowth(growth)}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="analytics-empty-table">
                    <BarChart3 size={28} />
                    <strong>No URLs available for comparison</strong>
                    <span>
                      Create a short link to start comparing its performance.
                    </span>
                    <Link to="/dashboard">Create a short link</Link>
                  </div>
                )}
              </section>

              <div className="analytics-table-card">
                <div className="analytics-card-heading">
                  <div>
                    <h3>Top Performing Links</h3>
                    <p>Your five most-clicked links</p>
                  </div>
                  <Link to="/dashboard" className="analytics-view-all">
                    View all links <ChevronRight size={15} />
                  </Link>
                </div>

                {topUrls.length > 0 ? (
                  <div className="analytics-table-wrapper">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>SHORT LINK</th>
                          <th>DESTINATION</th>
                          <th>CLICKS</th>
                          <th>PERFORMANCE</th>
                          <th>ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topUrls.map((url, index) => {
                          const maxClicks = Math.max(
                            ...topUrls.map((item) =>
                              Number(item.totalClicks ?? 0)
                            ),
                            1
                          );
                          const percentage =
                            (Number(url.totalClicks ?? 0) / maxClicks) * 100;

                          return (
                            <tr key={url.id}>
                              <td>
                                <div className="analytics-short-link">
                                  <span className="analytics-link-icon">
                                    <Link2 size={15} />
                                  </span>
                                  <strong>/{url.shortCode}</strong>
                                  <button
                                    className="analytics-copy-button"
                                    onClick={() => copyShortUrl(url.shortCode)}
                                    title="Copy short URL"
                                  >
                                    {copiedCode === url.shortCode ? (
                                      <Check size={14} />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                </div>
                              </td>

                              <td>
                                <div className="analytics-destination">
                                  <span title={url.originalUrl}>
                                    {url.originalUrl}
                                  </span>
                                  <a
                                    href={url.originalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Open destination"
                                  >
                                    <ExternalLink size={13} />
                                  </a>
                                </div>
                              </td>

                              <td>
                                <strong className="analytics-click-count">
                                  {formatNumber(url.totalClicks)}
                                </strong>
                              </td>

                              <td>
                                <div className="analytics-progress">
                                  <div>
                                    <span style={{ width: `${percentage}%` }} />
                                  </div>
                                  <small>{Math.round(percentage)}%</small>
                                </div>
                              </td>

                              <td>
                                <div className="analytics-row-actions">
  <button
    className="analytics-qr-button"
    type="button"
    onClick={() => setSelectedQrUrl(url)}
    title="Generate QR Code"
  >
    <QrCode size={15} />
    QR Code
  </button>

  <button
    className="analytics-details-button"
    onClick={() => openUrlAnalytics(url)}
  >
    Details <ChevronRight size={14} />
  </button>
</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="analytics-empty-table">
                    <MousePointerClick size={28} />
                    <strong>No links to display yet</strong>
                    <span>Create and share a short link to see its performance.</span>
                    <Link to="/dashboard">Create a short link</Link>
                  </div>
                )}
              </div>

              <div className="analytics-table-card analytics-recent-card">
                <div className="analytics-card-heading">
                  <div>
                    <h3>Recent Click Activity</h3>
                    <p>Your latest 10 recorded link visits</p>
                  </div>
                  <span className="analytics-chart-badge">
                    <span className="analytics-live-dot" />
                    Latest activity
                  </span>
                </div>
                {recentClicks.length > 0 ? (
                  <div className="analytics-table-wrapper">
                    <table className="analytics-table">
                      <thead>
                        <tr>
                          <th>SHORT LINK</th>
                          <th>DESTINATION</th>
                          <th>CLICKED</th>
                          <th>DATE &amp; TIME</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentClicks.map((click) => (
                          <tr key={click.id}>
                            <td>
                              <div className="analytics-short-link">
                                <span className="analytics-link-icon"><Link2 size={15} /></span>
                                <strong>/{click.shortCode}</strong>
                                <button className="analytics-copy-button" onClick={() => copyShortUrl(click.shortCode)} title="Copy short URL">
                                  {copiedCode === click.shortCode ? <Check size={14} /> : <Copy size={14} />}
                                </button>
                              </div>
                            </td>
                            <td>
                              <div className="analytics-destination">
                                <span title={click.originalUrl}>{click.originalUrl}</span>
                                <a href={click.originalUrl} target="_blank" rel="noreferrer" title="Open destination"><ExternalLink size={13} /></a>
                              </div>
                            </td>
                            <td><strong className="analytics-click-count">{formatRelativeTime(click.clickedAt)}</strong></td>
                            <td><span title={formatExactTimestamp(click.clickedAt)}>{formatExactTimestamp(click.clickedAt)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="analytics-empty-table">
                    <MousePointerClick size={28} />
                    <strong>No click activity yet</strong>
                    <span>When someone visits one of your short links, it will appear here.</span>
                    <Link to="/dashboard">Manage your short links</Link>
                  </div>
                )}
              </div>

              <footer className="analytics-footer">
                <span>© {new Date().getFullYear()} LinkLite. All rights reserved.</span>
                <span>
                  <span className="analytics-live-dot" />
                  Connected to your analytics API
                </span>
              </footer>
            </>
          )}
        </section>
      </main>

      {(detailLoading || selectedAnalytics || detailError) && (
        <div
          className="analytics-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedAnalytics(null);
              setDetailError("");
            }
          }}
        >
          <motion.div
            className="analytics-detail-modal"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
          >
            <div className="analytics-modal-heading">
              <div>
                <span>LINK PERFORMANCE</span>
                <h3>URL Analytics</h3>
              </div>
              <button
                className="analytics-icon-button"
                onClick={() => {
                  setSelectedAnalytics(null);
                  setDetailError("");
                }}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            {detailLoading ? (
              <div className="analytics-modal-loading">
                <LoaderCircle size={28} className="analytics-spin" />
                Loading URL analytics...
              </div>
            ) : detailError ? (
              <div className="analytics-modal-error">{detailError}</div>
            ) : selectedAnalytics ? (
              <>
                <div className="analytics-detail-url">
                  <span>SHORT LINK</span>
                  <strong>/{selectedAnalytics.shortCode}</strong>
                  <p title={selectedAnalytics.originalUrl}>
                    {selectedAnalytics.originalUrl}
                  </p>
                </div>

                <div className="analytics-detail-stats">
                  <div>
                    <span>Total clicks</span>
                    <strong>
                      {formatNumber(selectedAnalytics.totalClicks)}
                    </strong>
                  </div>
                  <div>
                    <span>Last 7 days</span>
                    <strong>
                      {formatNumber(selectedAnalytics.clicksLast7Days)}
                    </strong>
                  </div>
                </div>

                <h4 className="analytics-detail-chart-title">
                  Last 7 days performance
                </h4>

                <div className="analytics-detail-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={(selectedAnalytics.dailyClicks ?? []).map((item) => ({
                        ...item,
                        label: formatDate(item.date),
                        clicks: Number(item.clicks ?? 0),
                      }))}
                    >
                      <defs>
                        <linearGradient
                          id="linkliteDetailGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="4 5"
                        vertical={false}
                        stroke="var(--analytics-grid)"
                      />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "var(--analytics-muted)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "var(--analytics-muted)", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--analytics-tooltip)",
                          border: "1px solid var(--analytics-border)",
                          borderRadius: "10px",
                          color: "var(--analytics-text)",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#06b6d4"
                        strokeWidth={2.5}
                        fill="url(#linkliteDetailGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      )}
          {selectedQrUrl && (
        <QRCodeModal
          open={Boolean(selectedQrUrl)}
          onClose={() => setSelectedQrUrl(null)}
          shortCode={selectedQrUrl.shortCode}
          originalUrl={selectedQrUrl.originalUrl}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
