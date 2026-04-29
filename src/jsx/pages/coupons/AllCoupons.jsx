import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import PageTitle from "../../layouts/PageTitle";
import {
  downloadCouponPdf,
  fetchAdminCoupons,
} from "../../../services/CouponService";

const AllCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalCoupon, setModalCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");
  const [couponError, setCouponError] = useState("");
  const pdfPreviewUrlRef = useRef(null);
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

  const getPdfSizeForRequest = () => {
    const widthRaw = window.prompt("Enter coupon PDF width (inches)", "3");
    const heightRaw = window.prompt("Enter coupon PDF height (inches)", "2");

    const widthParsed = Number(widthRaw);
    const heightParsed = Number(heightRaw);

    const widthIn =
      Number.isFinite(widthParsed) && widthParsed > 0 ? widthParsed : 3;
    const heightIn =
      Number.isFinite(heightParsed) && heightParsed > 0 ? heightParsed : 2;

    return {
      widthIn,
      heightIn,
    };
  };

  const fetchPdfBlob = async (coupon, size) => {
    const response = await downloadCouponPdf(coupon.code, {
      widthIn: size.widthIn,
      heightIn: size.heightIn,
    });
    return response.data;
  };

  const downloadQrCode = async (coupon) => {
    setQrLoading(true);
    setQrError("");

    try {
      const size = getPdfSizeForRequest();
      const blob = await fetchPdfBlob(coupon, size);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `clarksinn-coupon-${coupon.code}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setQrError("Unable to download coupon PDF. Please try again.");
    } finally {
      setQrLoading(false);
    }
  };

  const previewPdf = async (coupon) => {
    setCouponLoading(true);
    setCouponError("");

    try {
      const size = getPdfSizeForRequest();
      const blob = await fetchPdfBlob(coupon, size);
      if (pdfPreviewUrlRef.current) {
        URL.revokeObjectURL(pdfPreviewUrlRef.current);
      }
      const url = URL.createObjectURL(blob);
      pdfPreviewUrlRef.current = url;
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setCouponError("Unable to preview coupon PDF. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const hotelInfo = coupons[0]?.hotelInfo || {
    name: "Clarks Inn",
    address:
      "Opp. Amayra City Center, Kharar-Kurali Highway, Kharar, Mohali, Punjab-140301",
    phone: "+91-77101-08081",
  };

  const getAppliedOnLabel = (type) => {
    if (type === "room") return "Room";
    if (type === "restaurant-the bridge") return "Restaurant-The Bridge";
    return type || "Room / Restaurant";
  };

  const renderCouponCard = (coupon, ref, width, minHeight) => (
    <div
      ref={ref}
      style={{
        width,
        minHeight,
        margin: "0 auto",
        borderRadius: 24,
        overflow: "hidden",
        position: "relative",
        background:
          "linear-gradient(150deg, #0b1220 0%, #141f35 56%, #0a1222 100%)",
        boxShadow: "0 24px 50px rgba(0,0,0,0.45)",
        color: "#fff",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 100% 0%, rgba(251,191,36,0.20), transparent 36%), radial-gradient(circle at 0% 100%, rgba(148,163,184,0.18), transparent 32%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          padding: "30px 32px 18px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: 36,
            letterSpacing: "0.18em",
            lineHeight: 1,
            fontWeight: 800,
            fontFamily: "Poppins, sans-serif",
            background:
              "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          CLARKS INN
        </h1>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 13,
            lineHeight: 1.55,
            fontFamily: "Poppins, sans-serif",
            background:
              "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {coupon.hotelInfo?.address || hotelInfo.address}
        </p>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 13,
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            background:
              "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Phone:{" "}
          {coupon.hotelInfo?.phone || hotelInfo.phone || "+91 77101 08081"}
        </p>
      </div>

      <div
        style={{
          position: "relative",
          padding: "6px 32px 14px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 11,
            letterSpacing: "0.2em",
            color: "rgba(255,255,255,0.72)",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          Exclusive Offer
        </p>
        <h2
          style={{
            margin: "6px 0 14px",
            fontSize: 52,
            lineHeight: 1,
            letterSpacing: "-0.03em",
            fontWeight: 900,
            fontFamily: "Poppins, sans-serif",
            background:
              "linear-gradient(90deg, #bf953f, #fcf6ba, #b38728, #fbf5b7, #aa771c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {coupon.discountType === "percent"
            ? `${coupon.value}% OFF`
            : `Flat ₹${coupon.value} OFF`}
        </h2>
        <p
          style={{
            margin: "0 0 3px",
            fontSize: 15,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            fontWeight: 800,
          }}
        >
          Coupon {coupon.code}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "#e2e8f0",
            letterSpacing: "0.05em",
          }}
        >
          Applied on: {getAppliedOnLabel(coupon.discountType)}
        </p>
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "18px 24px 24px",
          background: "rgba(2, 6, 23, 0.82)",
          borderTop: "1px solid rgba(251,191,36,0.2)",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: 8,
            boxShadow: "inset 0 0 12px rgba(0,0,0,0.08)",
          }}
        >
          <img
            src={getQrUrl(coupon.code)}
            alt={`${coupon.code} QR code`}
            style={{ width: 186, height: 186, display: "block" }}
          />
        </div>
        <div style={{ textAlign: "center", minWidth: 230 }}>
          {coupon.minOrder > 0 && (
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 11,
                color: "#94a3b8",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Minimum order: ₹{coupon.minOrder}
            </p>
          )}
          <p
            style={{
              margin: "0 0 6px",
              fontSize: 11,
              color: "#fff",
              fontWeight: 800,
              letterSpacing: "0.04em",
            }}
          >
            VALID UNTIL:{" "}
            {coupon.expiry
              ? new Date(coupon.expiry).toLocaleDateString()
              : "N/A"}
          </p>
          <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>
            Scan and claim your discount
          </p>
        </div>
      </div>
    </div>
  );

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
                    {/* <p className="mb-1 mb-md-0">
                      <strong>Discount Type:</strong>{" "}
                      {defaultCoupon.discountType || "Room / Restaurant"}
                    </p>
                    <p className="mb-0">
                      <strong>Validity:</strong>{" "}
                      {defaultCoupon.expiry
                        ? new Date(defaultCoupon.expiry).toLocaleDateString()
                        : "Varies by coupon"}
                    </p> */}
                    {/* <div className="d-flex gap-2 mt-2 align-items-center">
                      <label className="mb-0 small">PDF Size (in)</label>
                      <input
                        type="number"
                        min="2"
                        max="12"
                        step="0.1"
                        className="form-control form-control-sm"
                        style={{ width: 90 }}
                        value={pdfWidthIn}
                        onChange={(event) => setPdfWidthIn(event.target.value)}
                      />
                      <span>x</span>
                      <input
                        type="number"
                        min="2"
                        max="12"
                        step="0.1"
                        className="form-control form-control-sm"
                        style={{ width: 90 }}
                        value={pdfHeightIn}
                        onChange={(event) => setPdfHeightIn(event.target.value)}
                      />
                    </div> */}
                  </div>
                </div>
              </div>

              {loading && <p>Loading coupons...</p>}
              {error && <p className="text-danger">{error}</p>}
              {couponError && <p className="text-danger">{couponError}</p>}
              {qrError && <p className="text-danger">{qrError}</p>}
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
                {renderCouponCard(modalCoupon, qrPreviewRef, 700, 470)}
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
                  className="btn btn-outline-primary"
                  onClick={() => previewPdf(modalCoupon)}
                  disabled={couponLoading}
                >
                  {couponLoading ? "Opening..." : "Preview PDF"}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => downloadQrCode(modalCoupon)}
                  disabled={qrLoading}
                >
                  {qrLoading ? "Downloading..." : "Download PDF"}
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
