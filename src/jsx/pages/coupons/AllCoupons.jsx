import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";

import PageTitle from "../../layouts/PageTitle";
import { fetchAdminCoupons } from "../../../services/CouponService";

const AllCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalCoupon, setModalCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [couponError, setCouponError] = useState("");
  const downloadRefs = useRef({});
  const qrPreviewRef = useRef(null);

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

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setError("Please login before viewing coupons.");
      return;
    }

    setLoading(true);
    fetchAdminCoupons(token)
      .then((response) => {
        setCoupons(response.data.coupons || []);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load coupons");
      })
      .finally(() => setLoading(false));
  }, []);

  const getQrUrl = (code) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      `${window.location.origin}/coupon?code=${code}`,
    )}`;

  const closeModal = () => setModalCoupon(null);

  const downloadQrCode = async (coupon) => {
    setQrLoading(true);
    setQrError("");

    try {
      const element = qrPreviewRef.current;
      if (!element) {
        throw new Error("Preview element not available");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Unable to generate coupon image");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${coupon.code}-coupon.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setQrError("Unable to download coupon preview. Please try again.");
    } finally {
      setQrLoading(false);
    }
  };

  const captureCouponImage = async (coupon) => {
    const element = downloadRefs.current[coupon.code];
    if (!element) return;
    setCouponLoading(true);
    setCouponError("");

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("Unable to generate image");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clarksinn-coupon-${coupon.code}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setCouponError("Unable to download coupon card. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const hotelInfo = coupons[0]?.hotelInfo || {
    name: "Clarks Inn",
    address:
      "Opp. Amayra City Center, Kharar-Kurali Highway, Kharar, Mohali, Punjab-140301",
    phone: "+91 77101 08081",
  };
  const defaultCoupon = coupons[0] || {};

  const getAppliedOnLabel = (type) => {
    if (type === "room") return "Room";
    if (type === "restaurant-the bridge") return "Restaurant-The Bridge";
    return type || "Room / Restaurant";
  };

  return (
    <>
      <PageTitle activeMenu={"All Coupons"} motherMenu={"Coupons"} />
      <div className="row">
        <div className="col-xl-12 col-xxl-12 col-sm-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title">All Coupons</h5>
              <Link to="/create-coupon" className="btn btn-primary">
                Create Coupon
              </Link>
            </div>
            <div className="card-body">
              <div className="mb-4 p-3 rounded border bg-light">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                  <div>
                    <h5 className="mb-1">{hotelInfo.name}</h5>
                    <p className="mb-0 text-muted">{hotelInfo.address}</p>
                  </div>
                  <div>
                    <p className="mb-1 mb-md-0">
                      <strong>Discount Type:</strong>{" "}
                      {defaultCoupon.discountType || "Room / Restaurant"}
                    </p>
                    <p className="mb-0">
                      <strong>Validity:</strong>{" "}
                      {defaultCoupon.expiry
                        ? new Date(defaultCoupon.expiry).toLocaleDateString()
                        : "Varies by coupon"}
                    </p>
                  </div>
                </div>
              </div>

              {loading && <p>Loading coupons...</p>}
              {error && <p className="text-danger">{error}</p>}
              {couponError && <p className="text-danger">{couponError}</p>}
              {!loading && coupons.length === 0 && (
                <p>No coupons found. Create one using the button above.</p>
              )}
              {!loading && coupons.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Discount</th>
                        <th>Min Order</th>
                        <th>Expiry</th>
                        <th>Usage</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => (
                        <React.Fragment key={coupon._id || coupon.code}>
                          <tr>
                            <td>{coupon.code}</td>
                            <td>
                              {coupon.discountType === "percent"
                                ? `${coupon.value}%`
                                : `₹${coupon.value}`}
                            </td>
                            <td>₹{coupon.minOrder}</td>
                            <td>
                              {new Date(coupon.expiry).toLocaleDateString()}
                            </td>
                            <td>
                              {coupon.usedCount || 0}/{coupon.usageLimit}
                            </td>
                            <td>
                              <span
                                style={{
                                  width: "100px",
                                  textTransform: "capitalize",
                                  fontSize: "14px",
                                }}
                                className={`badge ${coupon.status === "active" ? "badge-secondary" : "badge-danger"}`}
                              >
                                {coupon.status}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-primary me-2"
                                onClick={() => setModalCoupon(coupon)}
                              >
                                Preview QR
                              </button>
                              {/* <button
                                style={{ fontSize: "14px" }}
                                type="button"
                                className="btn btn-md btn-success"
                                onClick={() => captureCouponImage(coupon)}
                                disabled={couponLoading}
                              >
                                {couponLoading
                                  ? "Downloading..."
                                  : "Download Coupon Card"}
                              </button> */}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {coupons.map((coupon) => {
        const hotelName = coupon.hotelInfo?.name || hotelInfo.name;
        const phone =
          coupon.hotelInfo?.phone || hotelInfo.phone || "+91 77101 08081";
        const address = coupon.hotelInfo?.address || hotelInfo.address;
        const discountType =
          coupon.discountType ||
          defaultCoupon.discountType ||
          "Room / Restaurant";
        const validity = coupon.expiry
          ? new Date(coupon.expiry).toLocaleDateString()
          : "Varies by coupon";

        return (
          <div
            key={`hidden-${coupon.code}`}
            ref={(el) => {
              if (el) downloadRefs.current[coupon.code] = el;
            }}
            style={{
              position: "absolute",
              top: -9999,
              left: -9999,
              width: 760,
              padding: 32,
              background: "#ffffff",
              color: "#111",
              borderRadius: 28,
              boxShadow: "0 40px 80px rgba(0,0,0,0.12)",
              fontFamily:
                "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              textAlign: "center",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.12)",
                  color: "#2563eb",
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  fontSize: 12,
                  textTransform: "uppercase",
                }}
              >
                Exclusive Hotel Offer
              </div>
            </div>
            <h1
              style={{
                fontSize: 44,
                margin: 0,
                lineHeight: 1.05,
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              {hotelName}
            </h1>
            <p
              style={{
                margin: "10px auto 28px",
                maxWidth: 640,
                color: "#475569",
                fontSize: 16,
                lineHeight: 1.7,
              }}
            >
              {address}
            </p>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 46,
                  height: 46,
                  borderRadius: 999,
                  background: "#0f172a",
                  color: "#f8fafc",
                  fontSize: 20,
                }}
              >
                📞
              </span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                {phone}
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  padding: 24,
                  borderRadius: 24,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    color: "#64748b",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Discount Type
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#111827",
                    textTransform: "capitalize",
                  }}
                >
                  {discountType}
                </p>
              </div>
              <div
                style={{
                  padding: 24,
                  borderRadius: 24,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    color: "#64748b",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Validity
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  {validity}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 24,
                alignItems: "center",
                justifyItems: "center",
              }}
            >
              <div
                style={{
                  padding: 24,
                  borderRadius: 24,
                  background: "#0f172a",
                  color: "#fff",
                  width: "100%",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0.75,
                  }}
                >
                  Coupon Code
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: 28,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                  }}
                >
                  {coupon.code}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {modalCoupon && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-transparent border-0 shadow-none">
              <div className="modal-body p-0">
                <div
                  ref={qrPreviewRef}
                  className="overflow-hidden position-relative mx-auto"
                  style={{
                    maxWidth: 640,
                    borderRadius: 32,
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
                    <div className="pt-5 pb-3 px-4 text-center">
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
                          {modalCoupon.hotelInfo?.address || hotelInfo.address}
                        </p>
                      </div>
                      <p
                        className="mb-0 text-white fw-bold"
                        style={{ fontSize: 12, opacity: 0.88 }}
                      >
                        📞{" "}
                        {modalCoupon.hotelInfo?.phone ||
                          hotelInfo.phone ||
                          "+91 77101 08081"}
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
                          fontSize: 48,
                          marginBottom: 8,
                          letterSpacing: "-0.04em",
                          background:
                            "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {modalCoupon.discountType === "percent"
                          ? `${modalCoupon.value}% OFF`
                          : `Flat ₹${modalCoupon.value} OFF`}
                      </h2>
                      <p
                        className="fw-bold text-uppercase"
                        style={{
                          fontSize: 14,
                          letterSpacing: "0.18em",
                          color: "#fff",
                        }}
                      >
                        Coupon {modalCoupon.code}
                      </p>
                      <p
                        className="mb-2"
                        style={{
                          fontSize: 12,
                          letterSpacing: "0.08em",
                          color: "#f8fafc",
                        }}
                      >
                        Applied on:{" "}
                        {getAppliedOnLabel(modalCoupon.discountType)}
                      </p>
                    </div>

                    <div
                      className="d-flex flex-column flex-sm-row align-items-center justify-content-center gap-3 px-3 py-4"
                      style={{ background: "#0f172a" }}
                    >
                      <img
                        src={getQrUrl(modalCoupon.code)}
                        alt={`${modalCoupon.code} QR code`}
                        style={{ width: 180, height: 180, display: "block" }}
                      />
                      <div style={{ textAlign: "left", minWidth: 180 }}>
                        {modalCoupon.minOrder > 0 && (
                          <p
                            className="text-uppercase mb-2"
                            style={{
                              fontSize: 10,
                              color: "#94a3b8",
                              letterSpacing: "0.02em",
                              margin: 0,
                            }}
                          >
                            Minimum order: ₹{modalCoupon.minOrder}
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
                          {modalCoupon.expiry
                            ? new Date(modalCoupon.expiry).toLocaleDateString()
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
              </div>
              <div className="modal-footer justify-content-center bg-transparent border-0 mt-3">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => downloadQrCode(modalCoupon)}
                  disabled={qrLoading}
                >
                  {qrLoading ? "Downloading..." : "Download Coupon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AllCoupons;
