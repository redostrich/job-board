// app/page.tsx
"use client";

import { useMemo, useState } from "react";

type Status = "Bidding" | "Submitted" | "Awarded";

type Bid = {
  id: number;
  projectName: string;
  address: string;
  bidDueDate: string; // YYYY-MM-DD
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

const BIDS: Bid[] = [
  {
    id: 1,
    projectName: "The Big Box Store",
    address: "123 Songbird Lane, Marietta",
    bidDueDate: "2025-06-25",
    bidDueTime: "2 p.m.",
    siteVisitDate: null,
    siteVisitTime: null,
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
    bidDueTime: "2 p.m.",
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
    bidDueDate: "2025-06-25",
    bidDueTime: "5 p.m.",
    siteVisitDate: "2025-06-19",
    siteVisitTime: "8 a.m.",
    invitesFrom: "Mortensen",
    takeoffPerson: "John C.",
    takeoffStatus: "Accepted",
    estimator: "Lisa",
    estimatorStatus: "Assigned",
    status: "Bidding",
    teammate: "Lisa",
  },
  {
    id: 4,
    projectName: "The Big Box Store",
    address: "123 Songbird Lane, Marietta",
    bidDueDate: "2025-06-26",
    bidDueTime: "2 p.m.",
    siteVisitDate: "2025-06-25",
    siteVisitTime: "9 a.m.",
    invitesFrom: "Anderson",
    takeoffPerson: "John C.",
    takeoffStatus: "Assigned",
    estimator: "TBD",
    estimatorStatus: "Pending",
    status: "Bidding",
    teammate: "John C.",
  },
];

const teamOptions = ["All Teammates", "John C.", "Amy", "Lisa", "Scott"];

function formatDateHeading(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomePage() {
  const [statusFilter, setStatusFilter] = useState<Status | "All">("Bidding");
  const [teamFilter, setTeamFilter] = useState<string>("All Teammates");
  const [searchTerm, setSearchTerm] = useState("");

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
        bid.takeoffPerson
      ).toLowerCase();

      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [statusFilter, teamFilter, searchTerm]);

  const groupedByDate = useMemo(() => {
    const map = new Map<string, Bid[]>();
    filteredBids.forEach((bid) => {
      if (!map.has(bid.bidDueDate)) {
        map.set(bid.bidDueDate, []);
      }
      map.get(bid.bidDueDate)!.push(bid);
    });

    return Array.from(map.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([date, bids]) => ({
        date,
        bids,
      }));
  }, [filteredBids]);

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
              Notifications
              <span className="badge">2</span>
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
          <h1 className="page-title">Bid Board</h1>

          <div className="topbar-controls">
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

            <button className="new-bid-btn">+ New Bid</button>
          </div>

          <div className="topbar-search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="topbar-search"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <section className="board-section">
          {groupedByDate.length === 0 && (
            <div className="empty-state">
              No bids found for the selected filters.
            </div>
          )}

          {groupedByDate.map((group) => (
            <div key={group.date} className="day-card">
              <h2 className="day-heading">
                {formatDateHeading(group.date)}
              </h2>

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
                        <div className="project-name">
                          {bid.projectName}
                        </div>
                        <div className="project-address">
                          {bid.address}
                        </div>
                      </td>

                      <td>
                        <div>{new Date(bid.bidDueDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}</div>
                        <div className="muted">{bid.bidDueTime}</div>
                      </td>

                      <td>
                        {bid.siteVisitDate ? (
                          <>
                            <div>
                              {new Date(bid.siteVisitDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "2-digit",
                                  day: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <div className="muted">
                              {bid.siteVisitTime}
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
                        <span className="pill">
                          {bid.takeoffStatus}
                        </span>
                      </td>

                      <td>
                        <div className="person-name">{bid.estimator}</div>
                        <span className="pill">
                          {bid.estimatorStatus}
                        </span>
                      </td>

                      <td>
                        <span className="status-text">{bid.status}</span>
                      </td>

                      <td className="actions-col">
                        <button
                          className="icon-btn"
                          aria-label="Edit bid"
                        >
                          ✎
                        </button>
                        <button
                          className="icon-btn"
                          aria-label="Delete bid"
                        >
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
