import React, { useEffect, useRef, useState } from "react";
import logo from "../../../assets/images/logo-clarks.png";
import {
  fetchPublicFeedbackConfig,
  logFeedbackClick,
} from "../../../services/FeedbackService";

const CREAM = "#FDFBF7";
const GOLD = "#bf953f";
const DARK_GREEN = "#0b4f3c";
const HEADING_FONT = "Georgia, 'Times New Roman', serif";

const defaultConfig = {
  hotelInfo: {
    name: "Clarks Inn",
    address:
      "Opp. Amayra City Center, Kharar-Kurali Highway, Kharar, Mohali, Punjab-140301",
    phone: "77101-08081",
  },
  texts: {
    heading: "WE VALUE YOUR FEEDBACK",
    subheading: "Your feedback helps us improve and serve you better.",
    thankYou: "Thank you for being a part of our journey.",
    guestTitle: "Thank you for staying with us!",
    guestSubtitle: "We'd love to hear about your experience.",
  },
  googleReviewUrl: "https://g.page/r/CYL6qnqS92QhEBM/review",
  tripAdvisorUrl:
    "https://www.tripadvisor.in/UserReviewEdit-g1584804-d34079746-Clarks_Inn_Kharar_Mohali-Mohali_Mohali_District_Punjab.html",
};

const GoogleIcon = ({ size = "64px" }) => (
  <svg style={{ width: size, height: size }} viewBox="0 0 48 48">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.9-2.26 5.36-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

const TripAdvisorIcon = ({ size = "64px" }) => (
  <svg style={{ width: size, height: size }} viewBox="0 0 64 64">
    <circle cx="32" cy="32" r="30" fill="#34E0A1" />
    <circle cx="20" cy="34" r="10" fill="#fff" />
    <circle cx="44" cy="34" r="10" fill="#fff" />
    <circle cx="20" cy="34" r="4.5" fill="#000" />
    <circle cx="44" cy="34" r="4.5" fill="#000" />
    <path
      d="M18 20 L10 14 M46 20 L54 14 M18 20 L46 20"
      stroke="#000"
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M28 16 L32 22 L36 16" fill="#000" />
  </svg>
);

const StarRow = () => (
  <div className="d-flex justify-content-center mb-3" style={{ gap: 4 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        style={{
          color: GOLD,
          fontSize: "clamp(22px, 7vw, 30px)",
          lineHeight: 1,
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const CircleRow = () => (
  <div className="d-flex justify-content-center mb-3" style={{ gap: 6 }}>
    {[1, 2, 3, 4, 5].map((circle) => (
      <span
        key={circle}
        style={{
          width: "clamp(16px, 5vw, 22px)",
          height: "clamp(16px, 5vw, 22px)",
          borderRadius: "50%",
          border: `2.5px solid ${DARK_GREEN}`,
          background: DARK_GREEN,
          display: "inline-block",
        }}
      />
    ))}
  </div>
);

const ScrollHint = ({ onClick, label }) => (
  <button
    type="button"
    onClick={onClick}
    className="btn btn-link"
    style={{
      color: "#9a9a9a",
      textDecoration: "none",
      fontSize: "clamp(12px, 3vw, 13px)",
      marginTop: 20,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 4,
      minHeight: 44,
    }}
  >
    <span>{label}</span>
    <span style={{ fontSize: 18 }}>⌄</span>
  </button>
);

const ReviewButton = ({ onClick, background, color, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      background,
      color,
      width: "100%",
      maxWidth: 280,
      minHeight: 48,
      padding: "12px 24px",
      borderRadius: 8,
      fontWeight: 600,
      border: "none",
      fontSize: "clamp(14px, 4vw, 16px)",
    }}
  >
    {children}
  </button>
);

const Section = ({ children, sectionRef }) => (
  <section
    ref={sectionRef}
    className="feedback-section d-flex align-items-center justify-content-center"
  >
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        textAlign: "center",
        fontFamily: HEADING_FONT,
      }}
    >
      {children}
    </div>
  </section>
);

const FeedbackLandingPage = () => {
  const [config, setConfig] = useState(defaultConfig);
  const tripAdvisorSectionRef = useRef(null);
  const googleSectionRef = useRef(null);

  useEffect(() => {
    fetchPublicFeedbackConfig()
      .then((response) => setConfig(response.data.config))
      .catch(() => {});
  }, []);

  const handleWriteReview = (platform, url) => {
    logFeedbackClick(platform).catch(() => {});
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const scrollToTripAdvisor = () => {
    tripAdvisorSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToGoogle = () => {
    googleSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const hotelInfo = config.hotelInfo || defaultConfig.hotelInfo;
  const texts = config.texts || defaultConfig.texts;

  return (
    <div className="feedback-scroll-container">
      <style>{`
        .feedback-scroll-container {
          height: 100vh;
          height: 100dvh;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: y mandatory;
          background: ${CREAM};
        }
        .feedback-section {
          min-height: 100vh;
          min-height: 100dvh;
          box-sizing: border-box;
          scroll-snap-align: start;
          scroll-snap-stop: always;
          padding: 32px 20px calc(32px + env(safe-area-inset-bottom, 0px));
        }
        @media (max-width: 360px) {
          .feedback-section {
            padding: 20px 14px calc(20px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>

      <Section sectionRef={googleSectionRef}>
        <img
          src={logo}
          alt={hotelInfo.name}
          style={{ height: "clamp(44px, 12vw, 56px)", marginBottom: 16 }}
        />
        <h2
          style={{
            fontSize: "clamp(19px, 6vw, 24px)",
            color: "#2b2b2b",
            marginBottom: 8,
          }}
        >
          {texts.guestTitle}
        </h2>
        <p
          style={{
            color: "#6b6b6b",
            marginBottom: 20,
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          {texts.guestSubtitle}
        </p>
        <div className="d-flex justify-content-center mb-3">
          <GoogleIcon />
        </div>
        <h5
          style={{
            letterSpacing: "0.08em",
            color: DARK_GREEN,
            fontWeight: 700,
            marginBottom: 16,
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          REVIEW US ON GOOGLE
        </h5>
        <StarRow />
        <div className="d-flex justify-content-center">
          <ReviewButton
            background={DARK_GREEN}
            color="#fff"
            onClick={() =>
              handleWriteReview("google", config.googleReviewUrl)
            }
          >
            Write a Review
          </ReviewButton>
        </div>
        <div>
          <ScrollHint
            onClick={scrollToTripAdvisor}
            label="Rate us on TripAdvisor too"
          />
        </div>
      </Section>

      <Section sectionRef={tripAdvisorSectionRef}>
        <img
          src={logo}
          alt={hotelInfo.name}
          style={{ height: "clamp(44px, 12vw, 56px)", marginBottom: 16 }}
        />
        <h2
          style={{
            fontSize: "clamp(19px, 6vw, 24px)",
            color: "#2b2b2b",
            marginBottom: 8,
          }}
        >
          {texts.guestTitle}
        </h2>
        <p
          style={{
            color: "#6b6b6b",
            marginBottom: 20,
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          {texts.guestSubtitle}
        </p>
        <div className="d-flex justify-content-center mb-3">
          <TripAdvisorIcon />
        </div>
        <h5
          style={{
            letterSpacing: "0.08em",
            color: DARK_GREEN,
            fontWeight: 700,
            marginBottom: 16,
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          REVIEW US ON TRIPADVISOR
        </h5>
        <CircleRow />
        <div className="d-flex justify-content-center">
          <ReviewButton
            background="#34E0A1"
            color="#0b3d2e"
            onClick={() =>
              handleWriteReview("tripadvisor", config.tripAdvisorUrl)
            }
          >
            Write a Review
          </ReviewButton>
        </div>
        <p
          style={{
            marginTop: 24,
            color: DARK_GREEN,
            fontStyle: "italic",
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          {texts.thankYou}
        </p>
        <div>
          <ScrollHint onClick={scrollToGoogle} label="Back to Google review" />
        </div>
      </Section>
    </div>
  );
};

export default FeedbackLandingPage;
