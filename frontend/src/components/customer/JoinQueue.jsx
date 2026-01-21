import React, { useState } from "react";
import Header from "../shared/Header";
import axios from "axios";
import "../../styles/customer.css";

const JoinQueue = ({ onNavigate, goBack, currentPage }) => {
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenData, setTokenData] = useState(null);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/queue/join", {
        service: selectedService
      });

      setTokenData(res.data);
    } catch (error) {
      alert("Failed to join queue. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header onNavigate={onNavigate} goBack={goBack} currentPage={currentPage} />

      <div className="join-queue-container">
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
          Join Queue
        </h2>

        {!tokenData ? (
          <div className="card">
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label>Select Service</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">-- Select a service --</option>
                  <option value="General Checkup">General Checkup</option>
                  <option value="Consultation">Consultation</option>
                  <option value="Lab Test">Lab Test</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: "100%" }}
                disabled={loading}
              >
                {loading ? "Joining..." : "Join Queue"}
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="token-card">
              <div className="token-number">
                T{tokenData.tokenNumber}
              </div>
              <div className="token-label">Your Queue Token</div>
              <p style={{ marginTop: "1rem" }}>
                Service: {selectedService}
              </p>
            </div>

            <div style={{ textAlign: "center", marginTop: "2rem" }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setTokenData(null);
                  setSelectedService("");
                }}
              >
                Join Another Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinQueue;
