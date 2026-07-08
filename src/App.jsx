import { lazy, Suspense, useEffect } from "react";
/// Components
import Index from "./jsx/router/index";
import CouponPage from "./jsx/pages/coupons/CouponPage";
import FeedbackLandingPage from "./jsx/pages/feedback/FeedbackLandingPage";
import RestFeedbackLandingPage from "./jsx/pages/feedbackrestaurant/RestFeedbackLandingPage";
import { connect, useDispatch } from "react-redux";
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
// action
import { checkAutoLogin } from "./services/AuthService";
import { isAuthenticated } from "./store/selectors/AuthSelectors";

/// Style
import "rsuite/dist/rsuite-no-reset.min.css";
import "./assets/css/style.css";

const Login = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./jsx/pages/authentication/Login")), 500);
  });
});

function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();

    return <Component {...props} router={{ location, navigate, params }} />;
  }

  return ComponentWithRouterProp;
}

function App(props) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { location } = props.router;
  const isPublicCouponRoute = location.pathname === "/coupon";
  const isPublicFeedbackRoute = location.pathname === "/feedback";
  const isPublicRestaurantFeedbackRoute =
    location.pathname === "/restaurant-feedback";
  useEffect(() => {
    if (
      !isPublicCouponRoute &&
      !isPublicFeedbackRoute &&
      !isPublicRestaurantFeedbackRoute
    )
      checkAutoLogin(dispatch, navigate);
  }, [
    isPublicCouponRoute,
    isPublicFeedbackRoute,
    isPublicRestaurantFeedbackRoute,
  ]);

  if (isPublicCouponRoute) {
    return <CouponPage />;
  }

  if (isPublicFeedbackRoute) {
    return <FeedbackLandingPage />;
  }

  if (isPublicRestaurantFeedbackRoute) {
    return <RestFeedbackLandingPage />;
  }

  let routeblog = (
    <Routes>
      <Route path="/login" element={<Login />} />
    </Routes>
  );
  if (props.isAuthenticated) {
    return (
      <>
        <Suspense
          fallback={
            <div id="preloader">
              <div className="sk-three-bounce">
                <div className="sk-child sk-bounce1"></div>
                <div className="sk-child sk-bounce2"></div>
                <div className="sk-child sk-bounce3"></div>
              </div>
            </div>
          }
        >
          <Index />
        </Suspense>
      </>
    );
  } else {
    return (
      <div className="vh-100">
        <Suspense
          fallback={
            <div id="preloader">
              <div className="sk-three-bounce">
                <div className="sk-child sk-bounce1"></div>
                <div className="sk-child sk-bounce2"></div>
                <div className="sk-child sk-bounce3"></div>
              </div>
            </div>
          }
        >
          {routeblog}
        </Suspense>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isAuthenticated: isAuthenticated(state),
  };
};

export default withRouter(connect(mapStateToProps)(App));
