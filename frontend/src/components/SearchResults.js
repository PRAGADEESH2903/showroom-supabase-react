import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050'


const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchType = searchParams.get('type') || 'customer';
  const query = searchParams.get('q') || '';

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Handle sub-dealer search differently (uses sub-dealers endpoint)
        const endpoint = searchType === 'sub-dealer' 
          ? `${API_BASE_URL}/api/sub-dealers/search?q=${query}`
          : `${API_BASE_URL}/api/${searchType}s/search?q=${query}`;
        
        const response = await axios.get(endpoint);
        setResults(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [searchType, query]);

  const renderCustomerResult = (customer) => (
    <Paper key={customer.id} sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6">{customer.name}</Typography>
      <Typography color="text.secondary">ID: {customer.id}</Typography>
      <Typography>Contact: {customer.contact}</Typography>
      <Typography>Email: {customer.email}</Typography>
      
      {customer.vehicles && customer.vehicles.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Vehicles:</Typography>
          <List>
            {customer.vehicles.map(vehicle => (
              <ListItem key={vehicle.id}>
                <ListItemText
                  primary={`${vehicle.name} - ${vehicle.model}`}
                  secondary={`Engine No: ${vehicle.engine_no}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );

  const renderVehicleResult = (vehicle) => (
    <Paper key={vehicle.id} sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6">{vehicle.name}</Typography>
      <Typography color="text.secondary">Model: {vehicle.model}</Typography>
      <Typography>Engine No: {vehicle.engine_no}</Typography>
      
      {vehicle.services && vehicle.services.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Services:</Typography>
          <List>
            {vehicle.services.map(service => (
              <ListItem key={service.id}>
                <ListItemText
                  primary={`Service #${service.service_count}`}
                  secondary={
                    <Box component="span">
                      <Typography component="span" variant="body2" display="block">
                        Status: {service.status}
                      </Typography>
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span" variant="body2">
                          Type:
                        </Typography>
                        <Chip 
                          label={service.service_type} 
                          color={service.service_type === 'free' ? 'success' : 'warning'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  );

  const renderServiceResult = (service) => (
    <Paper key={service.id} sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6">Service #{service.service_count}</Typography>
      <Typography color="text.secondary">
        Type: <Chip 
          label={service.service_type} 
          color={service.service_type === 'free' ? 'success' : 'warning'}
          size="small"
        />
      </Typography>
      <Typography>Status: {service.status}</Typography>
      <Typography>Date: {new Date(service.date).toLocaleDateString()}</Typography>
      
      {service.vehicle && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Vehicle Details:</Typography>
          <Typography>{service.vehicle.name} - {service.vehicle.model}</Typography>
          <Typography>Engine No: {service.vehicle.engine_no}</Typography>
        </Box>
      )}
    </Paper>
  );

  const renderPurchaseResult = (purchase) => (
    <Paper key={purchase.id} sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6">Purchase #{purchase.id}</Typography>
      <Typography color="text.secondary">
        Payment Method: {purchase.payment_method}
      </Typography>
      {purchase.payment_method === 'loan' && (
        <>
          <Typography>Bank: {purchase.bank_name}</Typography>
          <Typography>Loan Amount: ₹{purchase.loan_amount}</Typography>
          <Typography>EMI: ₹{purchase.emi_amount}</Typography>
        </>
      )}
      
      {purchase.dealer_id && typeof purchase.dealer_id === 'object' && purchase.dealer_id.name && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Dealer Details:</Typography>
          <Typography>Dealer Name: {purchase.dealer_id.name}</Typography>
          {purchase.dealer_id.dealer_code && (
            <Typography>Dealer Code: {purchase.dealer_id.dealer_code}</Typography>
          )}
          {purchase.dealer_id.location && (
            <Typography>Location: {purchase.dealer_id.location}</Typography>
          )}
          {purchase.dealer_id.contact && (
            <Typography>Contact: {purchase.dealer_id.contact}</Typography>
          )}
        </Box>
      )}
      
      {purchase.vehicle && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Vehicle Details:</Typography>
          <Typography>{purchase.vehicle.name} - {purchase.vehicle.model}</Typography>
          <Typography>Engine No: {purchase.vehicle.engine_no}</Typography>
        </Box>
      )}
    </Paper>
  );

  const renderSubDealerResult = (dealer) => (
    <Paper key={dealer.id} sx={{ mb: 2, p: 2 }}>
      <Typography variant="h6">{dealer.name}</Typography>
      <Typography color="text.secondary">ID: {dealer.id}</Typography>
      <Typography>Dealer Code: {dealer.dealer_code}</Typography>
      <Typography>Location: {dealer.location}</Typography>
      <Typography>Contact: {dealer.contact}</Typography>
      {dealer.created_at && (
        <Typography variant="body2" color="text.secondary">
          Created: {new Date(dealer.created_at).toLocaleDateString()}
        </Typography>
      )}
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        {error}
      </Typography>
    );
  }

  if (results.length === 0) {
    return (
      <Typography sx={{ mt: 2 }}>
        No results found for "{query}"
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {results.map(result => {
        switch (searchType) {
          case 'customer':
            return renderCustomerResult(result);
          case 'vehicle':
            return renderVehicleResult(result);
          case 'service':
            return renderServiceResult(result);
          case 'purchase':
            return renderPurchaseResult(result);
          case 'sub-dealer':
            return renderSubDealerResult(result);
          default:
            return null;
        }
      })}
    </Box>
  );
};

export default SearchResults;

