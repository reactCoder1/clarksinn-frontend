import React, { useRef, useState } from "react";
import Select from "react-select";
import { DatePicker } from "rsuite";
import html2canvas from "html2canvas";

import PageTitle from "../../layouts/PageTitle";
import { createCoupon } from "../../../services/CouponService";

const discountOptions = [
  { value: "restaurant-the bridge", label: "Restaurant" },
  { value: "room", label: "Room" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const CreateCoupon = () => {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState(discountOptions[0]);
  const [value, setValue] = useState(0);
  const [minOrder, setMinOrder] = useState(0);
  const [expiry, setExpiry] = useState(null);
  const [usageLimit, setUsageLimit] = useState(1);
  const [status, setStatus] = useState(statusOptions[0]);
  const [message, setMessage] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [couponLink, setCouponLink] = useState("");
  const [loading, setLoading] = useState(false);
  const previewRef = useRef(null);

  const hotelInfo = {
    name: "Clarks Inn",
    address:
      "Opp. Amayra City Center, Kharar-Kurali Highway, Kharar, Mohali, Punjab-140301",
    phone: "+91 77101 08081",
  };

  const discountAppliedLabel =
    discountType?.value === "room"
      ? "Room"
      : discountType?.value === "restaurant-the bridge"
        ? "Restaurant-The Bridge"
        : "Room / Restaurant";

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const token = getAdminToken();
    if (!token) {
      setMessage("Please login first to create a coupon.");
      return;
    }

    if (!code || !value || !expiry || !usageLimit) {
      setMessage("Please fill in all required coupon fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        code,
        discountType: discountType.value,
        value: Number(value),
        minOrder: Number(minOrder),
        expiry,
        usageLimit: Number(usageLimit),
        status: status.value,
      };
      const response = await createCoupon(payload, token);
      setQrPreview(response.data.qrCodeDataUrl);
      setCouponLink(response.data.couponUrl);
      setMessage("Coupon created successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create coupon.");
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    if (!couponLink) return;
    await navigator.clipboard.writeText(couponLink);
    setMessage("Coupon link copied to clipboard.");
  };

  const downloadCouponCard = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, {
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
      link.download = `${code || "coupon"}-coupon.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setMessage("Unable to download coupon preview. Please try again.");
    }
  };

  return (
    <>
      <PageTitle activeMenu={"Create New Coupon"} motherMenu={"Coupons"} />
      <div className="row">
        <div className="col-xl-12 col-xxl-12 col-sm-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title">Admin Coupon Creator</h5>
            </div>
            <div className="card-body">
              <div className="alert alert-info">
                Use the admin login page to sign in before creating coupons.
              </div>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label">Coupon Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        placeholder="e.g. SPRING2026"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label">Discount Type</label>
                      <Select
                        isSearchable={false}
                        value={discountType}
                        onChange={(value) => setDiscountType(value)}
                        options={discountOptions}
                        className="custom-react-select"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label">Value</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        placeholder="Discount value"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label">Minimum Order (₹)</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={minOrder}
                        onChange={(event) => setMinOrder(event.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label">Expiry Date</label>
                      <div className="input-hasicon mb-xl-0 mb-3">
                        <DatePicker
                          placeholder="Select Date"
                          className="picker-suit"
                          value={expiry}
                          onChange={(value) => setExpiry(value)}
                        />
                        <div className="icon">
                          <i className="far fa-calendar" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label">Usage Limit</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control"
                        value={usageLimit}
                        onChange={(event) => setUsageLimit(event.target.value)}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <Select
                        isSearchable={false}
                        value={status}
                        onChange={(value) => setStatus(value)}
                        options={statusOptions}
                        className="custom-react-select"
                      />
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 col-sm-12">
                    <button type="submit" className="btn btn-primary me-1">
                      {loading ? "Creating..." : "Create Coupon"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger light"
                      onClick={() => {
                        setCode("");
                        setDiscountType(discountOptions[0]);
                        setValue(0);
                        setMinOrder(0);
                        setExpiry(null);
                        setUsageLimit(1);
                        setStatus(statusOptions[0]);
                        setQrPreview("");
                        setCouponLink("");
                        setMessage("");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </form>

              {message && (
                <div className="alert alert-info mt-4">{message}</div>
              )}

              {qrPreview && (
                <div className="row mt-4 justify-content-center">
                  <div className="col-xl-8">
                    <div
                      ref={previewRef}
                      className="overflow-hidden position-relative"
                      style={{
                        maxWidth: 560,
                        width: "100%",
                        borderRadius: 28,
                        background: "linear-gradient(145deg, #1e293b, #0f172a)",
                        border: "3px solid rgba(255,255,255,0.85)",
                        boxShadow: "0 18px 36px -10px rgba(0, 0, 0, 0.45)",
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
                        <div className="pt-4 pb-3 px-3 text-center">
                          <h1
                            className="fw-bold mb-2"
                            style={{
                              fontSize: 32,
                              letterSpacing: "0.16em",
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
                              style={{
                                color: "rgba(255,255,255,0.72)",
                                marginLeft: 8,
                              }}
                            >
                              {hotelInfo.address}
                            </p>
                          </div>
                          <p
                            className="mb-0 text-white fw-bold"
                            style={{ fontSize: 12, opacity: 0.88 }}
                          >
                            📞 {hotelInfo.phone}
                          </p>
                        </div>

                        <div className="px-4 sm:px-5 mt-4 text-center">
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
                              fontSize: 64,
                              marginBottom: 8,
                              letterSpacing: "-0.04em",
                              background:
                                "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            Flat ₹{value} OFF
                          </h2>
                          <p
                            className="mb-1"
                            style={{
                              fontSize: 12,
                              letterSpacing: "0.08em",
                              color: "#fff",
                            }}
                          >
                            Discount applied on: {discountAppliedLabel}
                          </p>
                          <p
                            className="fw-bold text-uppercase"
                            style={{
                              fontSize: 14,
                              letterSpacing: "0.18em",
                              color: "#fff",
                            }}
                          >
                            Coupon {code || "COUPON"}
                          </p>
                        </div>

                        <div
                          className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2 px-3 py-4"
                          style={{
                            background: "#0f172a",
                          }}
                        >
                          <img
                            src={qrPreview}
                            alt="Coupon QR"
                            style={{
                              width: 180,
                              height: 180,
                              display: "block",
                            }}
                          />
                          <div style={{ textAlign: "left", minWidth: 180 }}>
                            {minOrder > 0 && (
                              <p
                                className="text-uppercase mb-2"
                                style={{
                                  fontSize: 10,
                                  color: "#94a3b8",
                                  letterSpacing: "0.02em",
                                  margin: 0,
                                }}
                              >
                                Minimum order: ₹{minOrder}
                              </p>
                            )}
                            <p
                              className="fw-bold mb-1"
                              style={{
                                fontSize: 10,
                                color: "#fff",
                                letterSpacing: "0.02em",
                              }}
                            >
                              VALID UNTIL:{" "}
                              {expiry
                                ? new Date(expiry).toLocaleDateString()
                                : "N/A"}
                            </p>
                            <p
                              style={{
                                fontSize: 9,
                                color: "#94a3b8",
                                margin: 0,
                              }}
                            >
                              Scan and claim your discount
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={copyLink}
                      >
                        Copy Link
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={downloadCouponCard}
                      >
                        Download Coupon
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateCoupon;
