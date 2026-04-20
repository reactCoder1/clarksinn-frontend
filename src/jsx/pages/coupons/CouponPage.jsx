import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Turnstile } from "@marsidev/react-turnstile";
import html2canvas from "html2canvas";
import logo from "../../../assets/images/logo-full.png";

const CouponPage = () => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code") || "";
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:4000";
  const turnstileSiteKey =
    process.env.REACT_APP_TURNSTILE_SITE_KEY || "0x4AAAAAAC_RiIVY5aETAJHR";

  const [coupon, setCoupon] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const couponCardRef = useRef(null);

  useEffect(() => {
    if (!code) {
      setError("Invalid link. Please open the coupon from the hotel message.");
      setLoading(false);
      return;
    }

    axios
      .get(`${apiUrl}/api/verify-coupon/${encodeURIComponent(code)}`)
      .then((response) => {
        setCoupon(response.data.coupon);
        setIsValid(true);
        setError("");
      })
      .catch(() => {
        setError("Invalid coupon or expired link.");
      })
      .finally(() => setLoading(false));
  }, [code, apiUrl]);

  const downloadCouponImage = async () => {
    if (!couponCardRef.current) return;
    setDownloadError("");

    try {
      const canvas = await html2canvas(couponCardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) {
        throw new Error("Unable to generate image");
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clarksinn-coupon-${code}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError("Unable to download coupon. Please try again.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!name || !phone || !city) {
      setMessage("Please complete all fields.");
      return;
    }

    if (phone.length !== 10 || !/^\d{10}$/.test(phone)) {
      setMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!turnstileToken) {
      setMessage("Please complete the security check.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${apiUrl}/api/submit`, {
        name,
        phone,
        city,
        couponCode: code,
        turnstile_token: turnstileToken,
        hidden_field: honeypot,
      });
      setMessage("Your coupon is applied and ready to use!");
      setSubmitted(true);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const hotelAddress =
    coupon?.hotelInfo?.address ||
    "Opp. Amayra City Center, Kharar-Kurali Highway, Kharar, Mohali, Punjab 140301";
  const hotelPhone = coupon?.hotelInfo?.phone || "+91 77101 08081";
  const discountLabel =
    coupon?.discountType === "percent"
      ? `${coupon?.value}% OFF`
      : `Flat ₹${coupon?.value} OFF`;
  const validForLabel =
    coupon?.discountType === "room" ? "Room Booking" : "Restaurant";
  const showMinOrder =
    coupon?.discountType === "restaurant-the bridge" &&
    Number(coupon?.minOrder) > 0;
  const couponName = coupon?.code
    ? `Coupon ${coupon.code}`
    : "Clarks Inn Special";
  const validUntil = coupon?.expiry
    ? new Date(coupon.expiry).toLocaleDateString("en-GB")
    : "N/A";

  if (loading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-secondary bg-opacity-10 px-3">
        <div
          className="card shadow-sm border-0 w-100"
          style={{ maxWidth: 560 }}
        >
          <div className="card-body text-center p-5">
            <img
              src={logo}
              alt="Clarksinn logo"
              className="mb-4 img-fluid"
              style={{ maxWidth: 140 }}
            />
            <h3 className="mb-3">Invalid Link</h3>
            <p className="text-muted mb-4">{error}</p>
            <p className="mb-0 text-secondary">
              Please contact the hotel if you believe this is incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center"
        style={{ background: "#000" }}
      >
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-4 px-3">
                <div
                  className="d-inline-flex align-items-center rounded-pill px-4 py-2 mb-3"
                  style={{
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <span
                    className="text-success fw-bold"
                    style={{ fontSize: 12 }}
                  >
                    ✓ Coupon applied! Enjoy your stay at Clarks Inn.
                  </span>
                </div>
              </div>

              <div
                ref={couponCardRef}
                className="overflow-hidden position-relative"
                style={{
                  borderRadius: 32,
                  maxWidth: 680,
                  margin: "0 auto",
                  background: "linear-gradient(145deg, #1e293b, #0f172a)",
                  border: "4px solid rgba(255,255,255,0.85)",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at top right, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at bottom left, rgba(251,191,36,0.18), transparent 18%)",
                    pointerEvents: "none",
                  }}
                />
                <div className="position-relative text-white">
                  <div className="pt-4 pt-md-5 pb-3 pb-md-4 px-3 px-md-4 text-center">
                    <h1
                      className="fw-bold mb-2"
                      style={{
                        fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
                        letterSpacing: "0.18em",
                        background:
                          "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      CLARKS INN
                    </h1>
                    <div
                      className="d-flex align-items-start justify-content-center text-gray-300 mb-2"
                      style={{ fontSize: 12, lineHeight: 1.4 }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        style={{ color: "#facc15", flexShrink: 0 }}
                      >
                        <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      <p
                        className="mb-0"
                        style={{ color: "rgba(255,255,255,0.72)" }}
                      >
                        {hotelAddress}
                      </p>
                    </div>
                    <p
                      className="mb-0 text-white fw-bold"
                      style={{ fontSize: 12, opacity: 0.88 }}
                    >
                      📞 {hotelPhone}
                    </p>
                  </div>

                  <div className="px-3 px-md-4 py-3 py-md-4 text-center">
                    <p
                      className="text-uppercase mb-2 fw-bold"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.2em",
                        color: "rgba(255,255,255,0.72)",
                      }}
                    >
                      Exclusive Offer
                    </p>
                    <h2
                      className="fw-bold mb-2"
                      style={{
                        fontSize: "clamp(2rem, 8vw, 4rem)",
                        marginBottom: 8,
                        letterSpacing: "-0.04em",
                        background:
                          "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {discountLabel}
                    </h2>
                    <p
                      className="fw-bold text-uppercase"
                      style={{
                        fontSize: 14,
                        letterSpacing: "0.18em",
                        color: "#fff",
                      }}
                    >
                      {couponName}
                    </p>
                    {showMinOrder && (
                      <p
                        className="fw-semibold text-white mb-0"
                        style={{ fontSize: 12, opacity: 0.88 }}
                      >
                        Minimum order: ₹{coupon.minOrder}
                      </p>
                    )}
                  </div>

                  <div className="px-3 px-md-4 mt-3 mt-md-4">
                    <div
                      style={{
                        borderRadius: 20,
                        padding: 1,
                        background:
                          "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                      }}
                    >
                      <div
                        style={{
                          borderRadius: 18,
                          background: "#0f172a",
                          padding: 12,
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: "0.16em",
                            color: "#facc15",
                          }}
                        >
                          Customer Details
                        </span>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          background: "#1e293b",
                          borderTop: "1px solid rgba(251,191,36,0.2)",
                        }}
                      >
                        <div
                          style={{
                            padding: 16,
                            borderRight: "1px solid rgba(251,191,36,0.2)",
                          }}
                        >
                          <p
                            className="text-uppercase mb-1"
                            style={{
                              fontSize: 9,
                              color: "#94a3b8",
                              fontWeight: 700,
                              letterSpacing: "0.16em",
                            }}
                          >
                            Guest Name
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              color: "#fff",
                              margin: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {name || "Guest Name"}
                          </p>
                        </div>
                        <div style={{ padding: 16 }}>
                          <p
                            className="text-uppercase mb-1"
                            style={{
                              fontSize: 9,
                              color: "#94a3b8",
                              fontWeight: 700,
                              letterSpacing: "0.16em",
                            }}
                          >
                            Valid for
                          </p>
                          <p
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              textTransform: "uppercase",
                              color: "#fff",
                              margin: 0,
                            }}
                          >
                            {validForLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 px-3 px-md-4 py-4 py-md-5"
                    style={{
                      background: "#0f172a",
                      paddingTop: 32,
                      paddingBottom: 32,
                    }}
                  >
                    <div
                      style={{
                        // background: "#fff",
                        // borderRadius: 18,
                        // padding: 10,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        // boxShadow: "inset 0 0 12px rgba(0,0,0,0.1)",
                      }}
                    >
                      {/* <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                          coupon?.code || "ClarksInn500",
                        )}`}
                        alt="QR"
                        style={{ width: 72, height: 72, display: "block" }}
                      /> */}
                    </div>
                    <div style={{ textAlign: "right", minWidth: 160 }}>
                      <p
                        className="fw-bold mb-1"
                        style={{
                          fontSize: 11,
                          color: "#fff",
                          letterSpacing: "0.02em",
                        }}
                      >
                        VALID UNTIL: {validUntil}
                      </p>
                      <p style={{ fontSize: 9, color: "#94a3b8", margin: 0 }}>
                        Terms & Conditions Apply
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4 px-3">
                <button
                  type="button"
                  className="btn btn-lg text-white fw-bold rounded-pill px-5 py-3"
                  style={{
                    background: "#0f172a",
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.25)",
                    border: "1px solid #f3eaa9",
                  }}
                  onClick={downloadCouponImage}
                >
                  Download Coupon
                </button>
              </div>
              {downloadError && (
                <p className="text-danger text-center mt-3">{downloadError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: "linear-gradient(135deg, #f3f6ff 0%, #ffffff 100%)",
      }}
    >
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm">
                  <div className="card-body p-5">
                    <div className="mb-4">
                      {/* <span className="badge bg-primary text-white mb-2">
                        Guest form
                      </span> */}
                      <h3 className="mb-1 text-center">Clarks Inn</h3>
                      <h3 className="mb-1">Reserve your coupon now</h3>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "12px" }}
                      >
                        Fill in your details to claim the hotel offer.
                      </p>
                      <p
                        className="text-muted mb-0"
                        style={{ fontSize: "12px" }}
                      >
                        Redeem your exclusive hotel offer with confidence.
                      </p>
                    </div>
                    <div className="mb-3">
                      <div
                        className="text-uppercase text-muted small"
                        style={{ fontSize: "12px" }}
                      >
                        Address
                      </div>
                      <p className="mb-2" style={{ fontSize: "12px" }}>
                        {hotelAddress}
                        <p className="mb-0">{hotelPhone}</p>
                      </p>
                    </div>

                    {/* <div
                      style={{
                        alignItems: "center",
                        justifyContent: "centers",
                        display: "flex",
                      }}
                    >
                      <div className="text-uppercase text-muted small d-flex align-items-center gap-1">
                        <p
                          className="mb-0 fw-semibold text-center"
                          style={{
                            fontSize: "15px",
                            color: "darkgreen",
                            textAlign: "center",
                          }}
                        >
                          {code}
                        </p>
                      </div>
                    </div> */}
                    <form onSubmit={handleSubmit} style={{ marginTop: "15px" }}>
                      <div className="mb-3">
                        <label className="form-label">Full name</label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Phone number</label>
                        <input
                          type="tel"
                          id="phone"
                          className="form-control form-control-lg"
                          value={phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ""); // Only digits
                            if (value.length <= 10) {
                              setPhone(value);
                            }
                          }}
                          placeholder="9876543210"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          inputMode="numeric"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-control form-control-lg"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Enter your city"
                          required
                        />
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          left: "-5000px",
                          visibility: "hidden",
                        }}
                      >
                        <label htmlFor="hidden-field">
                          Leave this field empty
                        </label>
                        <input
                          id="hidden-field"
                          name="hidden_field"
                          type="text"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                          autoComplete="off"
                        />
                      </div>

                      <div className="mb-4">
                        <Turnstile
                          siteKey={turnstileSiteKey}
                          onSuccess={(token) => setTurnstileToken(token)}
                          onError={() => setTurnstileToken("")}
                          onExpire={() => setTurnstileToken("")}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary btn-lg w-100"
                        disabled={submitting || !isValid}
                      >
                        {submitting ? "Submitting..." : "Claim Offer"}
                      </button>
                    </form>

                    {message && (
                      <div
                        className={`alert ${submitted ? "alert-success" : "alert-danger"} mt-4`}
                      >
                        {message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* <div className="col-lg-5">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-5 d-flex flex-column justify-content-between">
                    <div>
                      <div className="text-center mb-4">
                        <img
                          src={logo}
                          alt="Clarksinn logo"
                          className="img-fluid"
                          style={{ maxWidth: 150 }}
                        />
                        <h2 className="h4 mt-3 mb-2">Welcome to Clarksinn</h2>
                      </div>

                      <div className="mt-5">
                        <h5 className="mb-3">Hotel details</h5>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-top">
                      <h6 className="mb-2">What happens next?</h6>
                      <p className="text-muted mb-0">
                        We will verify your details and reserve the coupon for
                        your booking. An SMS or WhatsApp message may be sent to
                        confirm the reservation.
                      </p>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponPage;
