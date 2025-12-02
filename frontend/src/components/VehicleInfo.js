import React, { useState } from 'react';
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
  IconButton,
  InputAdornment,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050';


const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  model: Yup.string().required('Model is required'),
  year: Yup.number()
    .required('Year is required')
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear(), 'Year cannot be in the future'),
  engine_no: Yup.string().required('Engine number is required'),
  chassis_no: Yup.string().required('Chassis number is required'),
  gearbox_no: Yup.string().required('Gearbox number is required'),
  battery_no: Yup.string().required('Battery number is required'),
  tire_front: Yup.string().required('Front tire number is required'),
  tire_rear_left: Yup.string().required('Rear left tire number is required'),
  tire_rear_right: Yup.string().required('Rear right tire number is required'),
  tire_stepney: Yup.string().required('Stepney tire number is required'),
  price: Yup.number()
    .required('Price is required')
    .min(0, 'Price must be positive'),
  customer_id: Yup.number().required('Customer ID is required'),
});

const VehicleInfo = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPrice, setShowPrice] = useState(false);

  const handleClickShowPrice = () => {
    setShowPrice(!showPrice);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      model: '',
      year: '',
      engine_no: '',
      chassis_no: '',
      gearbox_no: '',
      battery_no: '',
      tire_front: '',
      tire_rear_left: '',
      tire_rear_right: '',
      tire_stepney: '',
      price: '',
      customer_id: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccess(false);
        
        // First, verify the customer exists
        try {
          const customerResponse = await axios.get(`${API_BASE_URL}/api/customers/${values.customer_id}`);
          if (!customerResponse.data) {
            setError('Customer not found. Please create the customer first.');
            return;
          }
        } catch (err) {
          setError('Customer not found. Please create the customer first.');
          return;
        }
        
        const submitData = {
          ...values,
          year: parseInt(values.year),
          price: parseFloat(values.price),
          customer_id: parseInt(values.customer_id),
        };
        
        const response = await axios.post(`${API_BASE_URL}/api/vehicles`, submitData);
        
        if (response.status === 201) {
          setSuccess(true);
          formik.resetForm();
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to submit vehicle details');
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Vehicle Information
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Vehicle information submitted successfully!
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Vehicle Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="model"
                  name="model"
                  label="Model"
                  value={formik.values.model}
                  onChange={formik.handleChange}
                  error={formik.touched.model && Boolean(formik.errors.model)}
                  helperText={formik.touched.model && formik.errors.model}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="year"
                  name="year"
                  label="Year"
                  type="number"
                  value={formik.values.year}
                  onChange={formik.handleChange}
                  error={formik.touched.year && Boolean(formik.errors.year)}
                  helperText={formik.touched.year && formik.errors.year}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="engine_no"
                  name="engine_no"
                  label="Engine Number"
                  value={formik.values.engine_no}
                  onChange={formik.handleChange}
                  error={formik.touched.engine_no && Boolean(formik.errors.engine_no)}
                  helperText={formik.touched.engine_no && formik.errors.engine_no}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="chassis_no"
                  name="chassis_no"
                  label="Chassis Number"
                  value={formik.values.chassis_no}
                  onChange={formik.handleChange}
                  error={formik.touched.chassis_no && Boolean(formik.errors.chassis_no)}
                  helperText={formik.touched.chassis_no && formik.errors.chassis_no}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="gearbox_no"
                  name="gearbox_no"
                  label="Gearbox Number"
                  value={formik.values.gearbox_no}
                  onChange={formik.handleChange}
                  error={formik.touched.gearbox_no && Boolean(formik.errors.gearbox_no)}
                  helperText={formik.touched.gearbox_no && formik.errors.gearbox_no}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="battery_no"
                  name="battery_no"
                  label="Battery Number"
                  value={formik.values.battery_no}
                  onChange={formik.handleChange}
                  error={formik.touched.battery_no && Boolean(formik.errors.battery_no)}
                  helperText={formik.touched.battery_no && formik.errors.battery_no}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Tire Information
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="tire_front"
                  name="tire_front"
                  label="Front Tire Number"
                  value={formik.values.tire_front}
                  onChange={formik.handleChange}
                  error={formik.touched.tire_front && Boolean(formik.errors.tire_front)}
                  helperText={formik.touched.tire_front && formik.errors.tire_front}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="tire_rear_left"
                  name="tire_rear_left"
                  label="Rear Left Tire Number"
                  value={formik.values.tire_rear_left}
                  onChange={formik.handleChange}
                  error={formik.touched.tire_rear_left && Boolean(formik.errors.tire_rear_left)}
                  helperText={formik.touched.tire_rear_left && formik.errors.tire_rear_left}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="tire_rear_right"
                  name="tire_rear_right"
                  label="Rear Right Tire Number"
                  value={formik.values.tire_rear_right}
                  onChange={formik.handleChange}
                  error={formik.touched.tire_rear_right && Boolean(formik.errors.tire_rear_right)}
                  helperText={formik.touched.tire_rear_right && formik.errors.tire_rear_right}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="tire_stepney"
                  name="tire_stepney"
                  label="Stepney Tire Number"
                  value={formik.values.tire_stepney}
                  onChange={formik.handleChange}
                  error={formik.touched.tire_stepney && Boolean(formik.errors.tire_stepney)}
                  helperText={formik.touched.tire_stepney && formik.errors.tire_stepney}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="price"
                  name="price"
                  label="Price"
                  type={showPrice ? 'number' : 'password'}
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  error={formik.touched.price && Boolean(formik.errors.price)}
                  helperText={formik.touched.price && formik.errors.price}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle price visibility"
                          onClick={handleClickShowPrice}
                          edge="end"
                        >
                          {showPrice ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="customer_id"
                  name="customer_id"
                  label="Customer ID"
                  type="number"
                  value={formik.values.customer_id}
                  onChange={formik.handleChange}
                  error={formik.touched.customer_id && Boolean(formik.errors.customer_id)}
                  helperText={formik.touched.customer_id && formik.errors.customer_id}
                />
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

export default VehicleInfo;

