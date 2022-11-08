/* Import React modules */
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
/* Import other node modules */
/* Import our modules */
import ErrorBoundary from "../../components/ErrorBoundary";
import DashboardWidget from "../DashboardWidget";

/* Import node module CSS */
import "@contentstack/venus-components/build/main.css";
/* Import our CSS */
import "./styles.scss";

const App: React.FC = function () {
  return (
    <div className="app">
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/dashboard-widget" element={<DashboardWidget />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </div>
  );
};

export default App;
