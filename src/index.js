import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/login";
import CreateAccount from "./components/createaccount";
import AvailableMatches from "./components/availablematche";
import CreateMatch from "./components/creatematch";
import Profile from "./components/profile";
import StadiumLocator from "./components/stadiumlocator";
import ProtectedRoute from "./components/protectedroute";
import JoinMatch from "./components/joinmatch";
import MyMatches from "./components/mymatches";
import ModifyProfile from "./components/modifyprofile";
import TransitionWrapper from "./components/transitions";
import ParticipantsList from "./components/participantlists";
import Footer from "./components/footer";



createRoot(document.getElementById("root")).render(
  <Router>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<TransitionWrapper><Login /></TransitionWrapper>} />
      <Route path="/create-account" element={<TransitionWrapper><CreateAccount /></TransitionWrapper>} />
      <Route path="/join-match/:matchId" element={<ProtectedRoute><TransitionWrapper><JoinMatch /></TransitionWrapper></ProtectedRoute>} />
      <Route path="/my-matches" element={<ProtectedRoute><TransitionWrapper><MyMatches /></TransitionWrapper></ProtectedRoute>} />

      {/* Protected Routes */}
      <Route path="/available-matches" element={<ProtectedRoute><TransitionWrapper><AvailableMatches /></TransitionWrapper></ProtectedRoute>} />
      <Route path="/create-match" element={<ProtectedRoute><TransitionWrapper><CreateMatch /></TransitionWrapper></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><TransitionWrapper><Profile /></TransitionWrapper></ProtectedRoute>} />
      <Route path="/locator" element={<ProtectedRoute><TransitionWrapper><StadiumLocator /></TransitionWrapper></ProtectedRoute>} />
      <Route path="/modify-profile" element={<ProtectedRoute><TransitionWrapper><ModifyProfile /></TransitionWrapper></ProtectedRoute>} />
      <Route path="/match/:matchId/participants" element={<ProtectedRoute><TransitionWrapper><ParticipantsList /></TransitionWrapper></ProtectedRoute>} />

      

    </Routes>
    <TransitionWrapper><Footer /></TransitionWrapper>
  </Router>
);
