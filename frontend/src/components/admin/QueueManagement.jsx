import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../shared/Sidebar";
import axios from "axios";
import socket from "../../socket";
import "../../styles/admin.css";
import "../../styles/global.css";

const QueueManagement = ({ onNavigate, goBack, currentPage }) => {
  const [queueData, setQueueData] = useState([]);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const fetchQueueData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/queue", getAuthConfig());
      setQueueData(res.data || []);
    } catch (err) {
      console.error("Error fetching queue:", err);
    }
  };

  useEffect(() => {
    fetchQueueData();

    socket.on("queue:update", (data) => {
      if (Array.isArray(data.queue)) {
        setQueueData(data.queue);
      } else {
        setQueueData([]);
      }
    });

    return () => {
      socket.off("queue:update");
    };
  }, []);

  const applyQueueAction = async (id, nextStatus, endpoint, errorLabel) => {
    const previous = queueData;
    setQueueData((prev) =>
      prev.map((item) =>
        item._id === id
          ? {
              ...item,
              status: nextStatus,
            }
          : item
      )
    );

    try {
      await axios.put(`http://localhost:5000/api/queue/${id}/${endpoint}`, {}, getAuthConfig());
    } catch (error) {
      console.error(errorLabel, error);
      setQueueData(previous);
    }
  };

  const startQueue = (id) => applyQueueAction(id, "serving", "start", "Error starting queue:");
  const completeQueue = (id) => applyQueueAction(id, "completed", "complete", "Error completing queue:");
  const cancelQueue = (id) => applyQueueAction(id, "cancelled", "cancel", "Error cancelling queue:");
  const revokeQueue = (id) => applyQueueAction(id, "waiting", "revoke", "Error revoking queue:");

  const getStatusBadge = (status) => {
    switch (status) {
      case "waiting":
        return <span className="badge badge-yellow">WAITING</span>;
      case "serving":
        return <span className="badge badge-green">IN PROGRESS</span>;
      case "cancelled":
        return <span className="badge badge-red">CANCELLED</span>;
      case "completed":
        return <span className="badge badge-blue">COMPLETED</span>;
      default:
        return <span className="badge badge-yellow">{status}</span>;
    }
  };

  const waitingQueue = useMemo(
    () => queueData.filter((item) => item.status === "waiting"),
    [queueData]
  );

  const inProgressQueue = useMemo(
    () => queueData.filter((item) => item.status === "serving"),
    [queueData]
  );

  const cancelledQueue = useMemo(
    () => queueData.filter((item) => item.status === "cancelled"),
    [queueData]
  );

  const completedQueue = useMemo(
    () => queueData.filter((item) => item.status === "completed"),
    [queueData]
  );

  const renderQueueSection = ({ title, subtitle, sectionColor, rows, emptyText, renderActions }) => (
    <div
      className="card"
      style={{
        marginBottom: "1.5rem",
        borderTop: `4px solid ${sectionColor}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h3 style={{ margin: 0, color: sectionColor }}>{title}</h3>
          <p style={{ margin: "0.35rem 0 0 0", color: "var(--color-gray-500)", fontSize: "0.875rem" }}>{subtitle}</p>
        </div>
        <span className="badge" style={{ backgroundColor: sectionColor, color: "#fff" }}>
          {rows.length}
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="queue-table" style={{ boxShadow: "none" }}>
          <thead>
            <tr>
              <th>Token Number</th>
              <th>Service</th>
              <th>Status</th>
              <th>Joined At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((queue) => (
                <tr key={queue._id}>
                  <td style={{ fontWeight: 600, color: "var(--color-primary)" }}>T{queue.tokenNumber}</td>
                  <td>{queue.service}</td>
                  <td>{getStatusBadge(queue.status)}</td>
                  <td>
                    {new Date(queue.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td>{renderActions(queue)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} goBack={goBack} />

      <main className="admin-main">
        <div className="admin-header">
          <h1>Queue Management</h1>
        </div>

        {renderQueueSection({
          title: "Section 1 - Waiting",
          subtitle: "Tokens waiting to be served",
          sectionColor: "#d97706",
          rows: waitingQueue,
          emptyText: "No waiting tokens",
          renderActions: (queue) => (
            <div className="action-buttons">
              <button className="action-btn btn-primary" onClick={() => startQueue(queue._id)}>
                Start
              </button>
              <button className="action-btn btn-danger" onClick={() => cancelQueue(queue._id)}>
                Cancel
              </button>
            </div>
          )
        })}

        {renderQueueSection({
          title: "Section 2 - In Progress",
          subtitle: "Tokens currently being served",
          sectionColor: "#16a34a",
          rows: inProgressQueue,
          emptyText: "No tokens in progress",
          renderActions: (queue) => (
            <div className="action-buttons">
              <button className="action-btn btn-danger" onClick={() => completeQueue(queue._id)}>
                Complete
              </button>
            </div>
          )
        })}

        {renderQueueSection({
          title: "Section 3 - Cancelled",
          subtitle: "Tokens cancelled by admin",
          sectionColor: "#dc2626",
          rows: cancelledQueue,
          emptyText: "No cancelled tokens",
          renderActions: (queue) => (
            <div className="action-buttons">
              <button
                className="action-btn"
                onClick={() => revokeQueue(queue._id)}
                style={{ backgroundColor: "#334155", color: "#fff", border: "none" }}
              >
                Revoke
              </button>
            </div>
          )
        })}

        {renderQueueSection({
          title: "Section 4 - Completed",
          subtitle: "Tokens completed successfully",
          sectionColor: "#2563eb",
          rows: completedQueue,
          emptyText: "No completed tokens",
          renderActions: () => <span style={{ color: "var(--color-gray-500)", fontSize: "0.875rem" }}>No actions</span>
        })}
      </main>
    </div>
  );
};

export default QueueManagement;
