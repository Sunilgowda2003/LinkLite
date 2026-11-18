
import { useCallback, useEffect, useMemo, useState } from "react";

import ProfileDropdown from "../components/ProfileDropdown";
import { Link } from "react-router-dom";
import urlService from "../services/urlService";
import { useAuth } from "../context/AuthContext";
import "../App.css";

import QRCodeModal from "../components/QRCodeModal";

function Dashboard() {
  const { user } = useAuth();

  const [originalUrl, setOriginalUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [aliasDraft, setAliasDraft] = useState("");

const [expirationDraft, setExpirationDraft] = useState("");
const [updatingId, setUpdatingId] = useState(null);
  const [urls, setUrls] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [expirationFilter, setExpirationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentTime, setCurrentTime] = useState(Date.now());

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  const [qrUrl, setQrUrl] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  const [selectedUrl, setSelectedUrl] = useState(null);

  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("linklite-theme") === "dark"
  );

  // Save theme preference
  useEffect(() => {
    localStorage.setItem(
      "linklite-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  // Refresh expiration status periodically while the dashboard stays open
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Check whether a URL has reached its expiration time
  function isUrlExpired(item) {
    return Boolean(
      item.expiresAt &&
      new Date(item.expiresAt).getTime() <= currentTime
    );
  }

  // Load user's URLs
  const loadUrls = useCallback(async () => {
    setFetching(true);
    setError("");

    try {
      const data = await urlService.getUrls();
      setUrls(data);
      setSelectedIds([]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load your links."
      );
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    loadUrls();
  }, [loadUrls]);

  // Create short URL
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setNotice("");
    setLoading(true);

    try {
   const data = await urlService.createUrl(
  originalUrl.trim(),
  expiresAt || null,
  customAlias.trim() || null
);

      setUrls((previous) =>
        [data, ...previous.filter((item) => item.id !== data.id)]
          .slice(0, 50)
      );

      setOriginalUrl("");
setExpiresAt("");
setCustomAlias("");
setNotice("Your short link is ready!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to shorten this URL."
      );
    } finally {
      setLoading(false);
    }
  }

  // Copy short URL
  async function handleCopy(url, code) {
    try {
      await navigator.clipboard.writeText(url);

      setCopiedCode(code);
      setNotice("Short link copied to clipboard!");
      setError("");
    } catch {
      setError(
        "Clipboard access failed. Copy the link manually."
      );
    }
  }

  // Delete URL
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this short URL?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      await urlService.deleteUrl(id);

      setUrls((previous) =>
        previous.filter((item) => item.id !== id)
      );

      setSelectedIds((previous) =>
        previous.filter((selectedId) => selectedId !== id)
      );

      setSelectedUrl((previous) =>
        previous?.id === id ? null : previous
      );

      setNotice("URL deleted successfully!");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete URL."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Delete all selected URLs
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} selected URL(s)? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId("bulk");
    setError("");
    setNotice("");

    const deletedIds = [];
    const failedIds = [];

    // Delete sequentially so individual failures can be handled safely.
    for (const id of selectedIds) {
      try {
        await urlService.deleteUrl(id);
        deletedIds.push(id);
      } catch {
        failedIds.push(id);
      }
    }

    if (deletedIds.length > 0) {
      setUrls((previous) =>
        previous.filter((item) => !deletedIds.includes(item.id))
      );
      setSelectedUrl((previous) =>
        previous && deletedIds.includes(previous.id) ? null : previous
      );
    }

    setSelectedIds(failedIds);
    setDeletingId(null);

    if (failedIds.length === 0) {
      setNotice(`${deletedIds.length} URL(s) deleted successfully!`);
    } else {
      setError(
        `${deletedIds.length} URL(s) deleted. ${failedIds.length} URL(s) could not be deleted. You can retry the remaining selections.`
      );
    }
  }

  // Activate or deactivate all selected URLs
  async function handleBulkStatusChange(active) {
    if (selectedIds.length === 0) return;

    const action = active ? "activate" : "deactivate";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} the selected URLs?`
    );
    if (!confirmed) return;

    setUpdatingId("bulk-status");
    setError("");
    setNotice("");

    const selectedUrls = urls.filter((item) => selectedIds.includes(item.id));
    const expiredIds = selectedUrls
      .filter((item) => isUrlExpired(item))
      .map((item) => item.id);
    const pendingUrls = selectedUrls.filter(
      (item) => !isUrlExpired(item) && item.active !== active
    );
    const updatedUrls = [];
    const failedIds = [];

    for (const item of pendingUrls) {
      try {
        const updated = await urlService.updateUrlStatus(item.id, active);
        updatedUrls.push(updated);
      } catch {
        failedIds.push(item.id);
      }
    }

    if (updatedUrls.length > 0) {
      setUrls((previous) =>
        previous.map((item) =>
          updatedUrls.find((updated) => updated.id === item.id) || item
        )
      );
      setSelectedUrl((previous) =>
        previous
          ? updatedUrls.find((updated) => updated.id === previous.id) || previous
          : previous
      );
    }

    // Keep failed and expired URLs selected so the user can review them.
    setSelectedIds([...new Set([...failedIds, ...expiredIds])]);
    setUpdatingId(null);

    const changedCount = updatedUrls.length;
    const unchangedCount = selectedUrls.length - pendingUrls.length - expiredIds.length;
    const messages = [`${changedCount} URL(s) ${active ? "activated" : "deactivated"}.`];
    if (unchangedCount > 0) messages.push(`${unchangedCount} already had that status.`);
    if (expiredIds.length > 0) messages.push(`${expiredIds.length} expired URL(s) were skipped.`);
    if (failedIds.length > 0) messages.push(`${failedIds.length} URL(s) failed and remain selected.`);

    if (failedIds.length > 0) {
      setError(messages.join(" "));
    } else {
      setNotice(messages.join(" "));
    }
  }

  // Activate or deactivate a short URL
async function handleToggleStatus(item) {
  if (isUrlExpired(item)) {
    setError("This URL has expired. Update its expiration date before activating it.");
    setNotice("");
    return;
  }

  setUpdatingId(item.id);
  setError("");
  setNotice("");

  try {
    const updated = await urlService.updateUrlStatus(
      item.id,
      !item.active
    );

    setUrls((previous) =>
      previous.map((url) =>
        url.id === item.id ? updated : url
      )
    );

    setSelectedUrl((previous) =>
      previous?.id === item.id ? updated : previous
    );

    setNotice(
      updated.active
        ? "URL activated successfully!"
        : "URL deactivated successfully!"
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to update URL status."
    );
  } finally {
    setUpdatingId(null);
  }
}

  // Update or remove URL expiration
async function handleUpdateExpiration() {
  if (!selectedUrl) return;

  setUpdatingId(selectedUrl.id);
  setError("");
  setNotice("");

  try {
    const updated = await urlService.updateUrlExpiration(
      selectedUrl.id,
      expirationDraft || null
    );

    setUrls((previous) =>
      previous.map((url) =>
        url.id === selectedUrl.id ? updated : url
      )
    );

    setSelectedUrl(updated);

    setExpirationDraft(
      updated.expiresAt
        ? updated.expiresAt.slice(0, 16)
        : ""
    );

    setNotice("Expiration settings updated successfully!");
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to update expiration."
    );
  } finally {
    setUpdatingId(null);
  }
}


// Update or remove custom alias
async function handleUpdateCustomAlias() {
  if (!selectedUrl) return;

  setUpdatingId(selectedUrl.id);
  setError("");
  setNotice("");

  try {
    const updated = await urlService.updateCustomAlias(
      selectedUrl.id,
      aliasDraft.trim() || null
    );

    setUrls((previous) =>
      previous.map((url) =>
        url.id === selectedUrl.id ? updated : url
      )
    );

    setSelectedUrl(updated);
    setAliasDraft(updated.customAlias || "");

    setNotice(
      updated.customAlias
        ? "Custom alias updated successfully!"
        : "Custom alias removed. A new random code was generated!"
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to update custom alias."
    );
  } finally {
    setUpdatingId(null);
  }
}


  // Select or deselect an individual URL
  function handleSelectUrl(id) {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((selectedId) => selectedId !== id)
        : [...previous, id]
    );
  }

  // Select or deselect all URLs currently shown by the filters
  function handleSelectAll() {
    const filteredIds = filteredUrls.map((item) => item.id);
    const allSelected =
      filteredIds.length > 0 &&
      filteredIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((previous) =>
        previous.filter((id) => !filteredIds.includes(id))
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([...previous, ...filteredIds]),
      ]);
    }
  }

  // Format original URL for display
  function shortenDisplay(url) {
    try {
      const parsed = new URL(url);
      return parsed.hostname + parsed.pathname + parsed.search;
    } catch {
      return url;
    }
  }

  // Search, filter, date range and sort URLs
  const filteredUrls = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;
    const fromTime = createdFrom
      ? new Date(`${createdFrom}T00:00:00`).getTime()
      : null;
    const toTime = createdTo
      ? new Date(`${createdTo}T23:59:59.999`).getTime()
      : null;

    const result = urls.filter((item) => {
      const matchesSearch =
        item.originalUrl.toLowerCase().includes(query) ||
        item.shortCode.toLowerCase().includes(query) ||
        item.shortUrl.toLowerCase().includes(query);

      const createdAt = new Date(item.createdAt).getTime();
      const expiresAtTime = item.expiresAt
        ? new Date(item.expiresAt).getTime()
        : null;
      const expired = Boolean(expiresAtTime && expiresAtTime <= currentTime);

      let matchesFilter = true;
      switch (filter) {
        case "recent": matchesFilter = createdAt >= sevenDaysAgo; break;
        case "active": matchesFilter = item.active && !expired; break;
        case "inactive": matchesFilter = !item.active && !expired; break;
        case "expired": matchesFilter = expired; break;
        default: matchesFilter = true;
      }

      const matchesCreatedFrom = fromTime === null || createdAt >= fromTime;
      const matchesCreatedTo = toTime === null || createdAt <= toTime;
      let matchesExpiration = true;
      if (expirationFilter === "has-expiration") {
  matchesExpiration = expiresAtTime !== null;
}
      if (expirationFilter === "never-expires") matchesExpiration = expiresAtTime === null;
      if (expirationFilter === "expired") matchesExpiration = expired;

      return matchesSearch && matchesFilter && matchesCreatedFrom &&
        matchesCreatedTo && matchesExpiration;
    });

    result.sort((a, b) => {
      const aCreated = new Date(a.createdAt).getTime();
      const bCreated = new Date(b.createdAt).getTime();
      if (sortBy === "oldest") return aCreated - bCreated;
      if (sortBy === "url-az") return a.originalUrl.localeCompare(b.originalUrl);
      if (sortBy === "url-za") return b.originalUrl.localeCompare(a.originalUrl);
      return bCreated - aCreated;
    });

    return result;
  }, [urls, search, filter, currentTime, createdFrom, createdTo, expirationFilter, sortBy]);

  const allFilteredSelected =
    filteredUrls.length > 0 &&
    filteredUrls.every((item) => selectedIds.includes(item.id));

  // Recent URL count
  const recentCount = urls.filter(
    (item) =>
      new Date(item.createdAt).getTime() >=
      currentTime - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <div className={`app-shell ${darkMode ? "dark" : ""}`}>

      {/* Header */}
      <header className="topbar">
        <a
          className="brand"
          href="/dashboard"
          aria-label="LinkLite home"
        >
          <span className="brand-icon">↗</span>

          <span>
            Link<span className="brand-accent">Lite</span>
          </span>
        </a>

        
<div className="header-actions">

  <span className="status-pill">
    <span className="status-dot" />
    URL Shortener
  </span>

  <Link to="/analytics" className="analytics-nav-button">
    <span>↗</span>
    Analytics
  </Link>

  <button
    className="theme-button"
    type="button"
    onClick={() =>
      setDarkMode((previous) => !previous)
    }
    aria-label="Toggle theme"
  >
    {darkMode ? "☀️" : "🌙"}
  </button>

  <ProfileDropdown />

</div>

      </header>

      {/* Main Content */}
      <main className="main-content">

        {/* Hero Section */}
        <section className="hero">
          <div className="eyebrow">
            <span>✦</span> SIMPLE. FAST. SHAREABLE.
          </div>

          <h1>
            Long links, <span>meet short links.</span>
          </h1>

          <p className="hero-description">
            Turn lengthy URLs into clean, shareable links in seconds.
            Your next great link starts here.
          </p>
        </section>

        {/* URL Shortener Form */}
        <section className="shorten-card">

          <div className="card-heading">
            <div>
              <h2>Shorten a URL</h2>
              <p>Paste the destination you want to share.</p>
            </div>

            <span className="link-symbol">↗</span>
          </div>

          <form onSubmit={handleSubmit}>

            <label htmlFor="originalUrl">
              Destination URL
            </label>

            <div className="input-wrap">
              <span className="input-icon">⌁</span>

              <input
                id="originalUrl"
                type="url"
                placeholder="https://example.com/my-long-url"
                value={originalUrl}
                onChange={(event) =>
                  setOriginalUrl(event.target.value)
                }
                maxLength={2048}
                required
              />
            </div>

            <div className="expiration-input-group">
  <label htmlFor="expiresAt">
    Expiration Date (Optional)
  </label>

  <input
  id="expiresAt"
  type="datetime-local"
  className={`expiration-input ${darkMode ? "dark-mode" : "light-mode"}`}
  value={expiresAt}
  onChange={(e) => setExpiresAt(e.target.value)}
/>

  <small>
    Leave empty if you want your short link to remain permanent.
  </small>

<div className="custom-alias-input-group">

  <label htmlFor="customAlias">
    Custom Alias (Optional)
  </label>

  <div className="input-wrap">
    <span className="input-icon">✦</span>

    <input
      id="customAlias"
      type="text"
      placeholder="e.g. my-brand"
      value={customAlias}
      onChange={(event) =>
        setCustomAlias(event.target.value)
      }
      minLength={3}
      maxLength={30}
      pattern="[a-zA-Z0-9_-]{3,30}"
      title="Use 3-30 letters, numbers, hyphens or underscores"
    />
  </div>

  <small>
    Choose your own short link name. Use 3-30 letters,
    numbers, hyphens or underscores. Leave empty for an
    automatically generated code.
  </small>

</div>

</div>

            <button
              className="primary-button"
              disabled={loading}
              type="submit"
            >
              {loading
                ? "Creating your link..."
                : "Create short link"}

              {!loading && <span>→</span>}
            </button>

          </form>

          {error && (
            <div
              className="message error-message"
              role="alert"
            >
              {error}
            </div>
          )}

          {notice && !error && (
            <div
              className="message success-message"
              role="status"
            >
              {notice}
            </div>
          )}

        </section>

        {/* Dashboard Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-icon">↗</span>

            <div>
              <p>Loaded links</p>
              <h3>{urls.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">◷</span>

            <div>
              <p>Created in last 7 days</p>
              <h3>{recentCount}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">⌕</span>

            <div>
              <p>Matching links</p>
              <h3>{filteredUrls.length}</h3>
            </div>
          </div>

        </section>

        {/* URL Management Section */}
        <section className="links-section">

          <div className="section-heading">
            <div>
              <h2>Your recent links</h2>
              <p>Manage your shortened URLs.</p>
            </div>

            <span className="count-badge">
              {filteredUrls.length} links
            </span>
          </div>

          {/* Search and Filter */}
          <div className="toolbar">

            <div className="search-box">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Search URLs or short codes..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                aria-label="Search URLs"
              />
            </div>

            <select
              className="filter-select"
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value)
              }
              aria-label="Filter URLs"
            >
              <option value="all">All links</option>
              <option value="recent">Last 7 days</option>
              <option value="active">Active links</option>
              <option value="inactive">Inactive links</option>
              <option value="expired">Expired links</option>
            </select>

          </div>

          {/* Advanced URL Filters */}
          <div className="advanced-filter-toolbar">
            <label>
              <span>Created from</span>
              <input type="date" value={createdFrom} max={createdTo || undefined}
                onChange={(event) => setCreatedFrom(event.target.value)} />
            </label>
            <label>
              <span>Created to</span>
              <input type="date" value={createdTo} min={createdFrom || undefined}
                onChange={(event) => setCreatedTo(event.target.value)} />
            </label>
            <label>
              <span>Expiration</span>
              <select value={expirationFilter} onChange={(event) => setExpirationFilter(event.target.value)}>
                <option value="all">All expiration types</option>
                <option value="has-expiration">Has expiration</option>
                <option value="never-expires">Never expires</option>
                <option value="expired">Expired</option>
              </select>
            </label>
            <label>
              <span>Sort by</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="url-az">Destination A–Z</option>
                <option value="url-za">Destination Z–A</option>
              </select>
            </label>
            <button type="button" className="clear-filters-button"
              onClick={() => { setSearch(""); setFilter("all"); setCreatedFrom(""); setCreatedTo(""); setExpirationFilter("all"); setSortBy("newest"); }}>
              Clear filters
            </button>
          </div>

          {/* Bulk Selection Toolbar */}
          {filteredUrls.length > 0 && (
            <div className="bulk-selection-toolbar">
              <label className="select-all-label">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={handleSelectAll}
                />
                <span>Select all</span>
              </label>

              <div className="bulk-selection-actions">
                <span className="selection-count">
                  {selectedIds.length} selected
                </span>
                <button
                  className="bulk-status-button activate"
                  type="button"
                  onClick={() => handleBulkStatusChange(true)}
                  disabled={selectedIds.length === 0 || updatingId === "bulk-status" || deletingId === "bulk"}
                >
                  {updatingId === "bulk-status" ? "Updating..." : "Activate selected"}
                </button>
                <button
                  className="bulk-status-button deactivate"
                  type="button"
                  onClick={() => handleBulkStatusChange(false)}
                  disabled={selectedIds.length === 0 || updatingId === "bulk-status" || deletingId === "bulk"}
                >
                  Deactivate selected
                </button>
                <button
                  className="bulk-delete-button"
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0 || deletingId === "bulk" || updatingId === "bulk-status"}
                >
                  {deletingId === "bulk" ? "Deleting..." : "Delete selected"}
                </button>
              </div>
            </div>
          )}

          {/* URL List */}
          {fetching ? (

            <div className="empty-state">
              Loading your links...
            </div>

          ) : filteredUrls.length === 0 ? (

            <div className="empty-state">
              <div className="empty-icon">↗</div>

              <h3>
                {urls.length === 0
                  ? "No links yet"
                  : "No matching links"}
              </h3>

              <p>
                {urls.length === 0
                  ? "Create your first short URL using the form above."
                  : "Try another search or change your filter."}
              </p>
            </div>

          ) : (

            <div className="links-list">

              {filteredUrls.map((item) => (

                <article
                  className={`link-card ${
                    selectedIds.includes(item.id) ? "selected-link-card" : ""
                  }`}
                  key={item.id}
                >
                  <div className="url-selection-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => handleSelectUrl(item.id)}
                      aria-label={`Select URL ${item.shortCode}`}
                    />
                  </div>

                  <div className="link-info">

                    <div className="destination-icon">
                      ↗
                    </div>

                    <div className="link-text">

                      {isUrlExpired(item) ? (
                        <span className="short-url expired-short-url">
                          {item.shortUrl.replace(/^https?:\/\//, "")}
                        </span>
                      ) : (
                        <a
                          className="short-url"
                          href={item.shortUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {item.shortUrl.replace(/^https?:\/\//, "")}

                        </a>
                      )}
                      <span className={`alias-type-badge ${
  item.customAlias ? "custom" : "generated"
}`}>
  {item.customAlias ? "Custom" : "Generated"}
</span>

                      <p
                        className="original-url"
                        title={item.originalUrl}
                      >
                        {shortenDisplay(item.originalUrl)}
                      </p>

                      <p className="created-date">
                        Created{" "}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>

                      <div className="url-status-info">
                        <span
                          className={`url-status ${
                            isUrlExpired(item)
                              ? "expired"
                              : item.active
                                ? "active"
                                : "inactive"
                          }`}
                        >
                          {isUrlExpired(item)
                            ? "Expired"
                            : item.active
                              ? "Active"
                              : "Inactive"}
                        </span>

                        {item.expiresAt ? (
                          <span className="url-expiration">
                            {isUrlExpired(item) ? "Expired on: " : "Expires: "}
                            {new Date(item.expiresAt).toLocaleString()}
                          </span>
                        ) : (
                          <span className="url-expiration">Never expires</span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* URL Actions */}
                  <div className="link-actions">

                    <button
                      className="copy-button"
                      type="button"
                      onClick={() =>
                        handleCopy(
                          item.shortUrl,
                          item.shortCode
                        )
                      }
                    >
                      {copiedCode === item.shortCode
                        ? "✓ Copied"
                        : "Copy"}
                    </button>

                    <button
                      className="details-button"
                      type="button"
                 onClick={() => {
  setSelectedUrl(item);

  setExpirationDraft(
    item.expiresAt
      ? item.expiresAt.slice(0, 16)
      : ""
  );

  setAliasDraft(item.customAlias || "");
}}
                    >
                      Details
                    </button>

                    <button
  className="qr-button"
  type="button"
                      disabled={isUrlExpired(item)}
                      title={isUrlExpired(item) ? "Expired links cannot be opened" : "Generate QR code"}
  onClick={() => setQrUrl(item)}
>
  QR Code
</button>

                    <button
                      className="delete-button"
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() =>
                        handleDelete(item.id)
                      }
                    >
                      {deletingId === item.id
                        ? "..."
                        : "Delete"}
                    </button>


<button
                      className="status-toggle-button"
                      type="button"
                      disabled={updatingId === item.id || isUrlExpired(item)}
                      onClick={() => handleToggleStatus(item)}
                    >
                      {isUrlExpired(item)
                        ? "Expired"
                        : updatingId === item.id
                          ? "Updating..."
                          : item.active
                            ? "Deactivate"
                            : "Activate"}
                    </button>
                  </div>

                </article>

              ))}


            </div>

          )}

        </section>

      </main>

      {/* URL Details Modal */}
      {selectedUrl && (

        <div
          className="modal-overlay"
          onClick={() => setSelectedUrl(null)}
        >

          <div
            className="details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onClick={(event) => event.stopPropagation()}
          >

            <div className="modal-heading">

              <div>
                <h2 id="details-title">
                  URL Details
                </h2>

                <p>
                  Information about your shortened link.
                </p>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={() => setSelectedUrl(null)}
                aria-label="Close details"
              >
                ×
              </button>

            </div>

            <div className="detail-field">
              <label>Original URL</label>
              <p>{selectedUrl.originalUrl}</p>
            </div>

            <div className="detail-field">
              <label>Short URL</label>
              <p>{selectedUrl.shortUrl}</p>
            </div>

            <div className="detail-field">
              <label>Short Code</label>
              <p>{selectedUrl.shortCode}</p>
            </div>


<div className="detail-field custom-alias-editor">
  <label htmlFor="aliasDraft">
    Custom Alias
  </label>

  <input
    id="aliasDraft"
    type="text"
    placeholder="Enter custom alias"
    value={aliasDraft}
    onChange={(event) =>
      setAliasDraft(event.target.value)
    }
    minLength={3}
    maxLength={30}
    pattern="[a-zA-Z0-9_-]{3,30}"
    title="Use 3-30 letters, numbers, hyphens or underscores"
  />

  <small>
    Leave empty to generate a new random short code.
  </small>
</div>

<div className="modal-actions">
  <button
    className="primary-button"
    type="button"
    disabled={updatingId === selectedUrl.id}
    onClick={handleUpdateCustomAlias}
  >
    {updatingId === selectedUrl.id
      ? "Saving..."
      : "Save Custom Alias"}
  </button>
</div>


            <div className="detail-field">
              <label>Created At</label>

              <p>
                {new Date(
                  selectedUrl.createdAt
                ).toLocaleString()}
              </p>

              <div className="detail-field">
  <label>URL Status</label>

  <p>
    {isUrlExpired(selectedUrl)
      ? "Expired"
      : selectedUrl.active ? "Active" : "Inactive"}
  </p>
</div>

<div className="detail-field">
  <label htmlFor="expirationDraft">
    Expiration Date
  </label>

  <input
    id="expirationDraft"
    type="datetime-local"
    value={expirationDraft}
    onChange={(event) =>
      setExpirationDraft(event.target.value)
    }
  />

  <small>
    Leave empty to remove the expiration date.
  </small>
</div>

<div className="modal-actions">
  <button
    className="primary-button"
    type="button"
    disabled={updatingId === selectedUrl.id}
    onClick={handleUpdateExpiration}
  >
    {updatingId === selectedUrl.id
      ? "Saving..."
      : "Save Expiration"}
  </button>

  <button
    className="status-toggle-button"
    type="button"
    disabled={updatingId === selectedUrl.id || isUrlExpired(selectedUrl)}
    onClick={() => handleToggleStatus(selectedUrl)}
  >
    {isUrlExpired(selectedUrl)
      ? "Expired"
      : selectedUrl.active
        ? "Deactivate URL"
        : "Activate URL"}
  </button>
</div>
            </div>

            <div className="modal-actions">

              <button
                className="copy-button"
                type="button"
                onClick={() =>
                  handleCopy(
                    selectedUrl.shortUrl,
                    selectedUrl.shortCode
                  )
                }
              >
                Copy Link
              </button>

              {isUrlExpired(selectedUrl) ? (
                <button
                  className="primary-button modal-open-button"
                  type="button"
                  disabled
                  title="This short URL has expired"
                >
                  Link Expired
                </button>
              ) : (
                <a
                  className="primary-button modal-open-button"
                  href={selectedUrl.shortUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Link ↗
                </a>
              )}

            </div>

          </div>

        </div>

      )}

      {/* Footer */}
      <footer className="footer">
        <span>
          LinkLite © {new Date().getFullYear()}
        </span>

        <span>
          Shorten less. Share more.
        </span>
     {qrUrl && (
  <QRCodeModal
    open={Boolean(qrUrl)}
    onClose={() => setQrUrl(null)}
    shortCode={qrUrl.shortCode}
    originalUrl={qrUrl.originalUrl}
    darkMode={darkMode}
  />
)}
      </footer>

    </div>
  );
}

export default Dashboard;
