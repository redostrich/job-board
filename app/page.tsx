// app/page.tsx
"use client";

import { useMemo, useState } from "react";

type Status = "Bidding" | "Submitted" | "Awarded";

type Bid = {
  id: number;
  projectName: string;
  address: string;

  bidDueDate: string; // YYYY-MM-DD (used for grouping)
  bidDueTime: string;

  siteVisitDate: string | null;
  siteVisitTime: string | null;

  invitesFrom: string;
  invitesMore?: number;

  takeoffPerson: string;
  takeoffStatus: "Assigned" | "Accepted";

  estimator: string;
  estimatorStatus: "Assigned" | "Pending";

  status: Status;
  teammate: string;
};

type GroupMode = "daily" | "weekly" | "monthly";

const BIDS: Bid[] = [
  // ====== WEEK 1 (June 23–29, 2025) ======
  {
    id: 1,
    projectName: "The Big Box Store",
    address: "123 Songbird Lane, Marietta",
    bidDueDate: "2025-06-23",
    bidDueTime: "2 p.m.",
    siteVisitDate: "2025-06-20",
    siteVisitTime: "10 a.m.",
    invitesFrom: "Anderson",
    takeoffPerson: "John C.",
    takeoffStatus: "Assigned",
    estimator: "TBD",
    estimatorStatus: "Pending",
    status: "Bidding",
    teammate: "John C.",
  },
  {
    id: 2,
    projectName: "The Paper Factory",
    address: "456 Hummingbird Dr, Athens",
    bidDueDate: "2025-06-25",
    bidDueTime: "1 p.m.",
    siteVisitDate: "2025-06-21",
    siteVisitTime: "3 p.m.",
    invitesFrom: "Turner",
    invitesMore: 3,
    takeoffPerson: "Amy",
    takeoffStatus: "Assigned",
    estimator: "Scott",
    estimatorStatus: "Assigned",
    status: "Bidding",
    teammate: "Amy",
  },
  {
    id: 3,
    projectName: "The Byrianni House",
    address: "789 Samosa Court, Atlanta",
    bidDueDate: "2025-06-27",
    bidDueTime: "11 a.m.",
    siteVisitDate: "2025-06-24",
    siteVisitTime: "8 a.m.",
    invitesFrom: "Mortensen",
    takeoffPerson: "John C.",
    takeoffStatus: "Accepted",
    estimator: "Lisa",
    estimatorStatus: "Assigned",
    status: "Bidding",
    teammate: "Lisa",
  },

  // ====== WEEK 2 (June 30–July 6, 2025) ======
  {
    id: 4,
    projectName: "Retail Plaza Expansion",
    address: "902 Peach Grove Rd, Roswell",
    bidDueDate: "2025-07-01",
    bidDueTime: "4 p.m.",
    siteVisitDate: "2025-06-30",
    siteVisitTime: "9 a.m.",
    invitesFrom: "DPR",
    takeoffPerson: "Amy",
    takeoffStatus: "Assigned",
    estimator: "Lisa",
    estimatorStatus: "Assigned",
    status: "Bidding",
    teammate: "Amy",
  },
  {
    id: 5,
    projectName: "City Library Renovation",
    address: "77 Heritage Ave, Atlanta",
    bidDueDate: "2025-07-03",
    bidDueTime: "10 a.m.",
    siteVisitDate: "2025-07-01",
    siteVisitTime: "2 p.m.",
    invitesFrom: "Sundt",
    takeoffPerson: "John C.",
    takeoffStatus: "Assigned",
    estimator: "Scott",
    estimatorStatus: "Assigned",
    status: "Bidding",
    teammate: "John C.",
  },

  // ====== WEEK 3 (July 7–13, 2025) ======
  {
    id: 6,
    projectName: "The Greenway Offices",
    address: "19 Greenway Pkwy, Alpharetta",
    bidDueDate: "2025-07-09",
    bidDueTime: "2 p.m.",
    siteVisitDate: "2025-07-07",
    siteVisitTime: "10 a.m.",
    invitesFrom: "Holder",
    takeoffPerson: "Lisa",
    takeoffStatus: "Assigned",
    estimator: "TBD",
    estimatorStatus: "Pending",
    status: "Bidding",
    teammate: "Lisa",
  },

  // ====== WEEK 5 (AUGUST — new month clearly shown) ======
  {
    id: 7,
    projectName: "Midtown Parking Garage",
    address: "2004 Spring St NW, Atlanta",
    bidDueDate: "2025-08-04",
    bidDueTime: "3 p.m.",
    siteVisitDate: "2025-08-02",
    siteVisitTime: "1 p.m.",
    invitesFrom: "Brasfield & Gorrie",
    takeoffPerson: "Scott",
    takeoffStatus: "Assigned",
    estimator: "Lisa",
    estimatorStatus: "Assigned",
    status: "Bidding",
    teammate: "Scott",
  },
  {
    id: 8,
    projectName: "Warehouse Distribution Center",
    address: "614 Freight Ln, Duluth",
    bidDueDate: "2025-08-06",
    bidDueTime: "12 p.m.",
    siteVisitDate: "2025-08-04",
    siteVisitTime: "9 a.m.",
    invitesFrom: "JE Dunn",
    takeoffPerson: "Amy",
    takeoffStatus: "Assigned",
    estimator: "TBD",
    estimatorStatus: "Pending",
    status: "Bidding",
    teammate: "Amy",
  }
];


const teamOptions = ["All Teammates", "John C.", "Amy", "Lisa", "Scott"];

/* ----------------------- Date helpers ----------------------- */

function parseLocalDate(dateStr: string) {
  // force local midnight so grouping doesn't shift by timezone
  return new Date(dateStr + "T00:00:00");
}

function formatDateHeading(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMMDDYYYY(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
}

function getWeekStart(date: Date) {
  // Monday as start of week
  const d = new Date(date);
  const day = d.getDay(); // 0 Sun ... 6 Sat
  const diff = (day === 0 ? -6 : 1) - day; // shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekKey(dateStr: string) {
  const d = parseLocalDate(dateStr);
  const monday = getWeekStart(d);
  const yyyy = monday.getFullYear();
  const mm = String(monday.getMonth() + 1).padStart(2, "0");
  const dd = String(monday.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`; // key = Monday date
}

function formatWeekHeading(weekKey: string) {
  const start = parseLocalDate(weekKey);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const startText = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const endText = end.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `Week of ${startText} – ${endText}`;
}

function getMonthKey(dateStr: string) {
  const d = parseLocalDate(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`; // key = YYYY-MM
}

function formatMonthHeading(monthKey: string) {
  const [yyyy, mm] = monthKey.split("-");
  const d = new Date(Number(yyyy), Number(mm) - 1, 1);
  return d.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/* ----------------------- Grouping ----------------------- */

function groupBids(bids: Bid[], mode: GroupMode) {
  const map = new Map<string, Bid[]>();

  for (const bid of bids) {
    let key: string;

    if (mode === "weekly") key = getWeekKey(bid.bidDueDate);
    else if (mode === "monthly") key = getMonthKey(bid.bidDueDate);
    else key = bid.bidDueDate; // daily

    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(bid);
  }

  const groups = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bids]) => ({ key, bids }));

  return groups;
}

/* ----------------------- Page ----------------------- */

export default function HomePage() {
  const [statusFilter, setStatusFilter] = useState<Status | "All">("Bidding");
  const [teamFilter, setTeamFilter] = useState("All Teammates");
  const [groupMode, setGroupMode] = useState<GroupMode>("daily");
  const [searchTerm, setSearchTerm] = useState("");

  // 1) filter + search first
  const filteredBids = useMemo(() => {
    return BIDS.filter((bid) => {
      if (statusFilter !== "All" && bid.status !== statusFilter) return false;
      if (teamFilter !== "All Teammates" && bid.teammate !== teamFilter)
        return false;

      if (!searchTerm.trim()) return true;

      const haystack = (
        bid.projectName +
        " " +
        bid.address +
        " " +
        bid.invitesFrom +
        " " +
        bid.takeoffPerson +
        " " +
        bid.estimator +
        " " +
        bid.status +
        " " +
        bid.teammate
      ).toLowerCase();

      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [statusFilter, teamFilter, searchTerm]);

  // 2) group after filtering
  const grouped = useMemo(() => {
    return groupBids(filteredBids, groupMode);
  }, [filteredBids, groupMode]);

  function renderGroupHeading(key: string) {
    if (groupMode === "weekly") return formatWeekHeading(key);
    if (groupMode === "monthly") return formatMonthHeading(key);
    return formatDateHeading(key); // daily
  }

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="sidebar-logo-square" />
          <span className="sidebar-title">Bid Boardly</span>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">
            <span className="nav-icon" />
            <span>Bid Board</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon" />
            <span>Submitted Bids</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon" />
            <span>Customers</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon" />
            <span>Team</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon" />
            <span className="nav-label-with-badge">
              Notifications <span className="badge">2</span>
            </span>
          </button>
          <button className="nav-item">
            <span className="nav-icon" />
            <span>Settings</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="signout-btn">Sign Out</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        <header className="topbar">
          {/* LEFT side: title + filters (matches screenshot) */}
          <div className="topbar-left">
            <h1 className="page-title">Bid Board</h1>

            <select
              className="topbar-select"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as Status | "All")
              }
            >
              <option value="Bidding">Bidding</option>
              <option value="Submitted">Submitted</option>
              <option value="Awarded">Awarded</option>
              <option value="All">All Statuses</option>
            </select>

            <select
              className="topbar-select"
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
            >
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select
              className="topbar-select"
              value={groupMode}
              onChange={(e) => setGroupMode(e.target.value as GroupMode)}
              aria-label="Group by"
            >
              <option value="daily">Group by Date</option>
              <option value="weekly">Group by Week</option>
              <option value="monthly">Group by Month</option>
            </select>
          </div>

          {/* RIGHT side: action + search */}
          <div className="topbar-right">
            <button className="new-bid-btn">+ New Bid</button>

            <div className="topbar-search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="topbar-search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>

        <section className="board-section">
          {grouped.length === 0 && (
            <div className="empty-state">
              No bids found for the selected filters.
            </div>
          )}

          {grouped.map((group) => (
            <div key={group.key} className="day-card">
              <h2 className="day-heading">{renderGroupHeading(group.key)}</h2>

              <table className="bids-table">
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Bid Due</th>
                    <th>Site Visit</th>
                    <th>Invites From</th>
                    <th>Takeoff</th>
                    <th>Estimator</th>
                    <th>Status</th>
                    <th className="actions-col">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {group.bids.map((bid) => (
                    <tr key={bid.id}>
                      <td>
                        <div className="project-name">{bid.projectName}</div>
                        <div className="project-address">{bid.address}</div>
                      </td>

                      <td>
                        <div>{formatMMDDYYYY(bid.bidDueDate)}</div>
                        <div className="muted">{bid.bidDueTime}</div>
                      </td>

                      <td>
                        {bid.siteVisitDate ? (
                          <>
                            <div>{formatMMDDYYYY(bid.siteVisitDate)}</div>
                            <div className="muted">
                              {bid.siteVisitTime ?? ""}
                            </div>
                          </>
                        ) : (
                          <span className="muted">TBD</span>
                        )}
                      </td>

                      <td>
                        <div>{bid.invitesFrom}</div>
                        {bid.invitesMore && (
                          <button className="link-button">
                            See ({bid.invitesMore}) more
                          </button>
                        )}
                      </td>

                      <td>
                        <div className="person-name">{bid.takeoffPerson}</div>
                        <span className="pill">{bid.takeoffStatus}</span>
                      </td>

                      <td>
                        <div className="person-name">{bid.estimator}</div>
                        <span className="pill">{bid.estimatorStatus}</span>
                      </td>

                      <td>
                        <span className="status-text">{bid.status}</span>
                      </td>

                      <td className="actions-col">
                        <button className="icon-btn" aria-label="Edit bid">
                          ✎
                        </button>
                        <button className="icon-btn" aria-label="Delete bid">
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
