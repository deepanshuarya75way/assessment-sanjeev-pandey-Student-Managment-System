import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import LoginPage from './pages/LoginPage';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import CoursesPage from './pages/CoursesPage';
import SubjectsPage from './pages/SubjectsPage';
import AttendancePage from './pages/AttendancePage';
import MarksPage from './pages/MarksPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DashboardPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/students"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}>
                    <AppLayout>
                      <StudentsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/teachers"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <TeachersPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/courses"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CoursesPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/subjects"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <SubjectsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AttendancePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/marks"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <MarksPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/announcements"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <AnnouncementsPage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <ProfilePage />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;