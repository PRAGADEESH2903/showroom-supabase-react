import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Container,
  Grid,
  MenuItem,
  Alert,
  Autocomplete,
  Chip,
} from '@mui/material';

const API_BASE_URL = 'http://localhost:5050';

const validationSchema = Yup.object({
  vehicle_id: Yup.number().required('Vehicle is required'),
  service_count: Yup.number()
    .required('Service count is required')
    .min(1, 'Service count must be at least 1'),
  status: Yup.string().required('Status is required'),
});

const ServiceDetails = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
        if (response.data && Array.isArray(response.data)) {
          setVehicles(response.data);
          if (response.data.length === 0) {
            setError('No vehicles found. Please add a vehicle first.');
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching vehicles:', err);
        setError('Failed to fetch vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const formik = useFormik({
    initialValues: {
      vehicle_id: '',
      service_count: '',
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccess(false);
        
        const serviceType = values.service_count <= 6 ? 'free' : 'paid';
        
        const response = await axios.post(`${API_BASE_URL}/api/services`, {
          ...values,
          service_type: serviceType,
        });
        
        if (response.status === 201) {
          setSuccess(true);
          formik.resetForm();
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to submit service details');
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Service Details
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Service details submitted successfully!
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Autocomplete
                  options={vehicles}
                  getOptionLabel={(option) => `${option.name} - ${option.model} (${option.engine_no})`}
                  getOptionKey={(option) => option.id}
                  loading={loading}
                  value={vehicles.find(v => v.id === formik.values.vehicle_id) || null}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('vehicle_id', newValue?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Vehicle"
                      error={formik.touched.vehicle_id && Boolean(formik.errors.vehicle_id)}
                      helperText={formik.touched.vehicle_id && formik.errors.vehicle_id}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="service_count"
                  name="service_count"
                  label="Service Count"
                  type="number"
                  value={formik.values.service_count}
                  onChange={formik.handleChange}
                  error={formik.touched.service_count && Boolean(formik.errors.service_count)}
                  helperText={formik.touched.service_count && formik.errors.service_count}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="status"
                  name="status"
                  label="Status"
                  select
                  value={formik.values.status}
                  onChange={formik.handleChange}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  helperText={formik.touched.status && formik.errors.status}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography>Service Type:</Typography>
                  <Chip 
                    label={formik.values.service_count <= 6 ? 'FREE' : 'PAID'} 
                    color={formik.values.service_count <= 6 ? 'success' : 'warning'}
                  />
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3 }}>
              <Button
                color="primary"
                variant="contained"
                type="submit"
                fullWidth
                disabled={formik.isSubmitting}
              >
                Submit
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default ServiceDetails;

