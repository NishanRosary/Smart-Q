import React, { useEffect, useState } from "react";
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

  useEffect(() => {
    // FETCH INITIAL DATA WITH AUTH
    axios
      .get("http://localhost:5000/api/queue", getAuthConfig())
      .then((res) => setQueueData(res.data))
      .catch((err) => console.error("Error fetching queue:", err));

    // FIXED SOCKET EVENT NAME
    socket.on("queue:update", (data) => {
      if (data.queue) {
        setQueueData(data.queue);
      }
    });

    return () => {
      socket.off("queue:update");
    };
  }, []);

  const startQueue = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/queue/${id}/start`,
        {},
        getAuthConfig()
      );
    } catch (error) {
      console.error("Error starting queue:", error);
    }
  };

  const completeQueue = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/queue/${id}/complete`,
        {},
        getAuthConfig()
      );
    } catch (error) {
      console.error("Error completing queue:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "waiting":
        return <span className="badge badge-yellow">WAITING</span>;
      case "serving":
        return <span className="badge badge-green">IN PROGRESS</span>;
      case "completed":
        return <span className="badge badge-red">COMPLETED</span>;
      default:
        return <span className="badge badge-yellow">{status}</span>;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        goBack={goBack}
      />

      <main className="admin-main">
        <div className="admin-header">
          <h1>Queue Management</h1>
        </div>

        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0 }}>Active Queues</h3>
              <p
                style={{
                  margin: "0.5rem 0 0 0",
                  color: "var(--color-gray-500)",
                  fontSize: "0.875rem",
                }}
              >
                Manage and monitor all queue entries
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: 0 }}>
          <table className="queue-table">
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
              {queueData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                    No active queues
                  </td>
                </tr>
              ) : (
                queueData.map((queue) => (
                  <tr key={queue._id}>
                    <td style={{ fontWeight: 600, color: "var(--color-primary)" }}>
                      T{queue.tokenNumber}
                    </td>
                    <td>{queue.service}</td>
                    <td>{getStatusBadge(queue.status)}</td>
                    <td>
                      {new Date(queue.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      {queue.status === "waiting" && (
                        <button
                          className="action-btn btn-primary"
                          onClick={() => startQueue(queue._id)}
                        >
                          Start
                        </button>
                      )}

                      {queue.status === "serving" && (
                        <button
                          className="action-btn btn-danger"
                          onClick={() => completeQueue(queue._id)}
                        >
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default QueueManagement;
