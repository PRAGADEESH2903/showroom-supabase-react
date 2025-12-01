import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
  Alert,
  Container,
} from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5050';

const validationSchema = Yup.object({
  dealer_code: Yup.string().required('Dealer code is required'),
  name: Yup.string().required('Name is required'),
  location: Yup.string().required('Location is required'),
  contact: Yup.string()
    .required('Contact number is required')
    .matches(/^[0-9]{10}$/, 'Contact number must be 10 digits'),
});

const SubDealerInfo = () => {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      dealer_code: '',
      name: '',
      location: '',
      contact: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        setSuccess(false);
        
        const response = await axios.post(`${API_BASE_URL}/api/sub-dealers`, values);
        
        if (response.status === 201) {
          setSuccess(true);
          formik.resetForm();
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to submit dealer details');
      }
    },
  });

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sub Dealer Information
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Sub dealer information submitted successfully!
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="dealer_code"
                  name="dealer_code"
                  label="Dealer Code"
                  value={formik.values.dealer_code}
                  onChange={formik.handleChange}
                  error={formik.touched.dealer_code && Boolean(formik.errors.dealer_code)}
                  helperText={formik.touched.dealer_code && formik.errors.dealer_code}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Dealer Name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="location"
                  name="location"
                  label="Location"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  error={formik.touched.location && Boolean(formik.errors.location)}
                  helperText={formik.touched.location && formik.errors.location}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="contact"
                  name="contact"
                  label="Contact Number"
                  value={formik.values.contact}
                  onChange={formik.handleChange}
                  error={formik.touched.contact && Boolean(formik.errors.contact)}
                  helperText={formik.touched.contact && formik.errors.contact}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  color="primary"
                  variant="contained"
                  fullWidth
                  type="submit"
                  disabled={formik.isSubmitting}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default SubDealerInfo;

