import React, { useState } from "react";
import Header from "../shared/Header";
import QRCodeDisplay from "../shared/QRCodeDisplay";
import axios from "axios";
import { services } from "../../data/mockData";
import "../../styles/customer.css";

const JoinQueue = ({ onNavigate, goBack, currentPage, eventData }) => {
  const [selectedService, setSelectedService] = useState(eventData?.title || "");
  const [showToken, setShowToken] = useState(false);
  const [tokenNumber, setTokenNumber] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!selectedService) return;

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/queue/join",
        { service: selectedService }
      );

      setTokenNumber(`T${response.data.tokenNumber}`);
      setShowToken(true);
    } catch (error) {
      console.error("Error joining queue:", error);
      alert("Failed to join queue. Please try again.");
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

        {!showToken ? (
          <div className="card">
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label htmlFor="service">Select Service / Event</label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  required
                >
                  <option value="">-- Select a service --</option>
                  {services.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                  {eventData && (
                    <option value={eventData.title}>
                      {eventData.title} (Event)
                    </option>
                  )}
                </select>
              </div>

              {eventData && (
                <div
                  style={{
                    backgroundColor: "#F3F4F6",
                    padding: "1rem",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                >
                  <h4 style={{ marginBottom: "0.5rem" }}>Event Details:</h4>
                  <p>
                    <strong>Organization:</strong>{" "}
                    {eventData.organizationType}
                  </p>
                  <p>
                    <strong>Date:</strong> {eventData.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {eventData.time}
                  </p>
                  <p>
                    <strong>Location:</strong> {eventData.location}
                  </p>
                </div>
              )}

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
              <div className="token-number">{tokenNumber}</div>
              <div className="token-label">Your Queue Token</div>
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                  opacity: 0.9,
                }}
              >
                Service: {selectedService}
              </p>
            </div>

            {eventData && (
              <div
                className="card"
                style={{ marginTop: "2rem", textAlign: "center" }}
              >
                <h3 style={{ marginBottom: "1rem" }}>Event QR Code</h3>
                <QRCodeDisplay eventData={eventData} size={200} />
              </div>
            )}

            <div
              style={{
                textAlign: "center",
                marginTop: "2rem",
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
              }}
            >
              <button
                className="btn-primary"
                onClick={() => onNavigate("customer-dashboard")}
              >
                Go to Dashboard
              </button>

              <button
                className="btn-secondary"
                onClick={() => {
                  setShowToken(false);
                  setSelectedService("");
                  setTokenNumber(null);
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