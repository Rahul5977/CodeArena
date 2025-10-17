// Test all basic imports
import React from "react";

// Basic test components
const TestLogin = () => <div>Login</div>;
const TestRegister = () => <div>Register</div>;
const TestDashboard = () => <div>Dashboard</div>;
const TestProblems = () => <div>Problems</div>;
const TestProblemDetails = () => <div>ProblemDetails</div>;
const TestPlaylists = () => <div>Playlists</div>;
const TestPlaylistDetail = () => <div>PlaylistDetail</div>;
const TestSubmissions = () => <div>Submissions</div>;
const TestProfile = () => <div>Profile</div>;

// Contest pages
const TestContestList = () => <div>ContestList</div>;
const TestContestDetail = () => <div>ContestDetail</div>;
const TestContestLeaderboard = () => <div>ContestLeaderboard</div>;
const TestContestSubmit = () => <div>ContestSubmit</div>;

// Sheets pages
const TestSheetList = () => <div>SheetList</div>;
const TestSheetDetail = () => <div>SheetDetail</div>;

// Admin pages
const TestUserManagement = () => <div>UserManagement</div>;
const TestAdminDashboard = () => <div>AdminDashboard</div>;
const TestContestManagement = () => <div>ContestManagement</div>;
const TestSheetManagement = () => <div>SheetManagement</div>;

const App = () => {
  return (
    <div>
      <TestLogin />
      <TestRegister />
      <TestDashboard />
      <TestProblems />
      <TestProblemDetails />
      <TestPlaylists />
      <TestPlaylistDetail />
      <TestSubmissions />
      <TestProfile />
      <TestContestList />
      <TestContestDetail />
      <TestContestLeaderboard />
      <TestContestSubmit />
      <TestSheetList />
      <TestSheetDetail />
      <TestUserManagement />
      <TestAdminDashboard />
      <TestContestManagement />
      <TestSheetManagement />
    </div>
  );
};

export default App;
