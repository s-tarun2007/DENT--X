/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/landing/LandingPage';
import { ClinicalPlatformPage } from './components/platform/ClinicalPlatformPage';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Page 1 — Cinematic Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Page 2 — DENT-X Clinical Platform Workstation */}
          <Route path="/app" element={<ClinicalPlatformPage />} />

          {/* Fallback to Landing Page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
