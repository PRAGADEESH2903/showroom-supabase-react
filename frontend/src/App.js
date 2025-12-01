import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import TopSearchBar from './components/TopSearchBar';
import VehicleInfo from './components/VehicleInfo';
import SearchResults from './components/SearchResults';
import CustomerInfo from './components/CustomerInfo';
import ServiceDetails from './components/ServiceDetails';
import PurchaseOptions from './components/PurchaseOptions';
import SubDealerInfo from './components/SubDealerInfo';

// Create router configuration to handle future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router {...routerConfig}>
        <TopSearchBar />
        <Box sx={{ 
          mt: 8, 
          p: 3,
          minHeight: 'calc(100vh - 64px)', // Account for AppBar height
          backgroundColor: 'background.default'
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/vehicles" replace />} />
            <Route path="/vehicles" element={<VehicleInfo />} />
            <Route path="/customers" element={<CustomerInfo />} />
            <Route path="/services" element={<ServiceDetails />} />
            <Route path="/purchases" element={<PurchaseOptions />} />
            <Route path="/dealers" element={<SubDealerInfo />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="*" element={<Navigate to="/vehicles" replace />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;

