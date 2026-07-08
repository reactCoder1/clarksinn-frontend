import React, { useEffect, useRef, useState } from "react";
import PageTitle from "../../layouts/PageTitle";
import {
  fetchAdminRestaurantFeedbackConfig,
  generateRestaurantFeedbackQrPng,
  fetchRestaurantFeedbackClickSummary,
} from "../../../services/RestaurantFeedback";

const getAdminToken = () => {
  const stored = localStorage.getItem("userDetails");
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.idToken || parsed.token || null;
  } catch {
    return null;
  }
};

const FeedbackRestaurantAdmin = () => {
  const [config, setConfig] = useState(null);
  const [feedbackUrl, setFeedbackUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [clickCounts, setClickCounts] = useState(null);

  const [sizePx, setSizePx] = useState(512);
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [qrGenerating, setQrGenerating] = useState(false);
  const qrImageUrlRef = useRef(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setMessage("Please login first to manage the feedback configuration.");
      setLoading(false);
      return;
    }

    fetchAdminRestaurantFeedbackConfig(token)
      .then((response) => {
        const loadedConfig = response.data.config;
        setConfig(loadedConfig);
        setFeedbackUrl(response.data.feedbackUrl);
        setSizePx(loadedConfig?.lastQrSizePx || 512);
      })
      .catch(() => setMessage("Failed to load feedback configuration."))
      .finally(() => setLoading(false));

    fetchRestaurantFeedbackClickSummary(token)
      .then((response) => setClickCounts(response.data.counts))
      .catch(() => {});
  }, []);

  const handleGenerateQr = async () => {
    const token = getAdminToken();
    if (!token) {
      setMessage("Please login first.");
      return;
    }

    setQrGenerating(true);
    setMessage("");
    try {
      const response = await generateRestaurantFeedbackQrPng(sizePx, token);
      if (qrImageUrlRef.current) {
        URL.revokeObjectURL(qrImageUrlRef.current);
      }
      const url = URL.createObjectURL(response.data);
      qrImageUrlRef.current = url;
      setQrImageUrl(url);
    } catch (error) {
      setMessage("Failed to generate QR code.");
    } finally {
      setQrGenerating(false);
    }
  };

  const handleDownloadQr = () => {
    if (!qrImageUrl) return;
    const link = document.createElement("a");
    link.href = qrImageUrl;
    link.download = `clarksinn-feedback-qr-${sizePx}px.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const copyFeedbackLink = async () => {
    if (!feedbackUrl) return;
    await navigator.clipboard.writeText(feedbackUrl);
    setMessage("Feedback link copied to clipboard.");
  };

  const hotelInfo = config?.hotelInfo || {};
  const texts = config?.texts || {};

  return (
    <>
      <PageTitle activeMenu={"Feedback QR"} motherMenu={"Feedback"} />

      {message && <div className="alert alert-info">{message}</div>}

      {loading ? (
        <div className="card">
          <div className="card-body">Loading configuration...</div>
        </div>
      ) : (
        <div className="row">
          <div className="col-xl-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Active Configuration</h5>
              </div>
              <div className="card-body">
                <dl className="row mb-0">
                  <dt className="col-sm-4">Google Review URL</dt>
                  <dd className="col-sm-8 text-break">
                    {config?.googleReviewUrl}
                  </dd>

                  <dt className="col-sm-4">TripAdvisor Review URL</dt>
                  <dd className="col-sm-8 text-break">
                    {config?.tripAdvisorUrl}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="col-xl-6">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title">Feedback QR Code Generator</h5>
              </div>
              <div className="card-body">
                <div className="form-group mb-3">
                  <label className="form-label">Guest Landing Link</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={feedbackUrl}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={copyFeedbackLink}
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">Size (px)</label>
                  <input
                    type="number"
                    min="100"
                    max="2000"
                    step="1"
                    className="form-control"
                    value={sizePx}
                    onChange={(e) => setSizePx(e.target.value)}
                  />
                </div>

                <p className="text-muted">
                  Generates a plain QR code linking to your feedback page
                  &mdash; no card, text, or branding included.
                </p>

                <button
                  type="button"
                  className="btn btn-primary me-2"
                  onClick={handleGenerateQr}
                  disabled={qrGenerating}
                >
                  {qrGenerating ? "Generating..." : "Generate QR"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-success"
                  onClick={handleDownloadQr}
                  disabled={!qrImageUrl}
                >
                  Download PNG
                </button>

                {qrImageUrl && (
                  <div className="mt-4 text-center">
                    <div
                      className="d-inline-block p-3"
                      style={{
                        background: "#fff",
                        borderRadius: 16,
                        boxShadow: "inset 0 0 12px rgba(0,0,0,0.08)",
                      }}
                    >
                      <img
                        src={qrImageUrl}
                        alt="Feedback QR"
                        style={{
                          width: 220,
                          height: 220,
                          objectFit: "contain",
                          display: "block",
                        }}
                      />
                    </div>
                  </div>
                )}

                {clickCounts && (
                  <div className="mt-4">
                    <h6>Review Clicks Logged</h6>
                    <p className="mb-1">Google: {clickCounts.google}</p>
                    <p className="mb-0">
                      TripAdvisor: {clickCounts.tripadvisor}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackRestaurantAdmin;
