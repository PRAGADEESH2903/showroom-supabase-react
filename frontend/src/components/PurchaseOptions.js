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
  Divider,
  Alert,
} from '@mui/material';

const API_BASE_URL = 'http://localhost:5050';

const validationSchema = Yup.object().shape({
  vehicle_id: Yup.number().required('Vehicle is required'),
  payment_method: Yup.string().required('Payment method is required'),
  bank_name: Yup.string().when('payment_method', {
    is: 'loan',
    then: (schema) => schema.required('Bank name is required for loan'),
    otherwise: (schema) => schema.nullable()
  }),
  loan_amount: Yup.number().when('payment_method', {
    is: 'loan',
    then: (schema) => schema.required('Loan amount is required for loan'),
    otherwise: (schema) => schema.nullable()
  }),
  loan_tenure: Yup.number().when('payment_method', {
    is: 'loan',
    then: (schema) => schema.required('Loan tenure is required for loan'),
    otherwise: (schema) => schema.nullable()
  }),
  interest_rate: Yup.number().when('payment_method', {
    is: 'loan',
    then: (schema) => schema.required('Interest rate is required for loan'),
    otherwise: (schema) => schema.nullable()
  }),
  emi_amount: Yup.number().when('payment_method', {
    is: 'loan',
    then: (schema) => schema.required('EMI amount is required for loan'),
    otherwise: (schema) => schema.nullable()
  }),
  down_payment: Yup.number().when('payment_method', {
    is: 'loan',
    then: (schema) => schema.required('Down payment is required for loan'),
    otherwise: (schema) => schema.nullable()
  }),
  insurance_start: Yup.date().required('Insurance start date is required'),
  insurance_end: Yup.date().required('Insurance end date is required'),
  delivery_address: Yup.string().required('Delivery address is required'),
  delivery_date: Yup.date().required('Delivery date is required'),
  owner_name: Yup.string().required('Owner name is required'),
  purchase_date: Yup.date().required('Purchase date is required'),
});

const PurchaseOptions = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDealers, setAvailableDealers] = useState([]);

  // Fetch available vehicles when component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/vehicles`);
        setAvailableVehicles(response.data);
      } catch (error) {
        setError('Failed to fetch available vehicles');
      }
    };
    fetchVehicles();
  }, []);

  // Fetch available dealers when component mounts
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/sub-dealers`);
        setAvailableDealers(response.data);
      } catch (error) {
        // Don't set error for dealers as it's optional - silently fail
      }
    };
    fetchDealers();
  }, []);

  const formik = useFormik({
    initialValues: {
      vehicle_id: '',
      dealer_id: '',
      payment_method: '',
      bank_name: '',
      loan_amount: '',
      loan_tenure: '',
      interest_rate: '',
      emi_amount: '',
      down_payment: '',
      insurance_start: '',
      insurance_end: '',
      delivery_address: '',
      delivery_date: '',
      owner_name: '',
      purchase_date: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        setError(null);
        setSuccess(false);
        
        // Convert numeric fields to numbers and format dates
        const submitData = {
          vehicle_id: parseInt(values.vehicle_id),
          payment_method: values.payment_method,
          insurance_start: values.insurance_start,
          insurance_end: values.insurance_end,
          delivery_address: values.delivery_address,
          delivery_date: values.delivery_date,
          owner_name: values.owner_name,
          purchase_date: values.purchase_date,
        };
        
        // Include dealer_id if provided (not empty string or 'None')
        const dealerId = values.dealer_id;
        if (dealerId && dealerId !== '' && dealerId !== 'None' && dealerId !== null && dealerId !== undefined) {
          const parsedDealerId = typeof dealerId === 'string' ? parseInt(dealerId, 10) : dealerId;
          if (!isNaN(parsedDealerId) && parsedDealerId > 0) {
            submitData.dealer_id = parsedDealerId;
          }
        }
        
        // Only include loan-related fields if payment method is 'loan'
        if (values.payment_method === 'loan') {
          submitData.bank_name = values.bank_name || null;
          submitData.loan_amount = values.loan_amount ? parseFloat(values.loan_amount) : null;
          submitData.loan_tenure = values.loan_tenure ? parseInt(values.loan_tenure) : null;
          submitData.interest_rate = values.interest_rate ? parseFloat(values.interest_rate) : null;
          submitData.emi_amount = values.emi_amount ? parseFloat(values.emi_amount) : null;
          submitData.down_payment = values.down_payment ? parseFloat(values.down_payment) : null;
        } else {
          submitData.bank_name = null;
          submitData.loan_amount = null;
          submitData.loan_tenure = null;
          submitData.interest_rate = null;
          submitData.emi_amount = null;
          submitData.down_payment = null;
        }
        
        const response = await axios.post(`${API_BASE_URL}/api/purchases`, submitData);
        
        if (response.status === 201) {
          setSuccess(true);
          setError(null);
          resetForm();
          // Reset success message after 3 seconds
          setTimeout(() => setSuccess(false), 3000);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || error.message || 'Failed to submit purchase details. Please check all fields and try again.';
        setError(errorMessage);
        setSuccess(false);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Calculate EMI when loan details change
  useEffect(() => {
    if (formik.values.payment_method === 'loan' && 
        formik.values.loan_amount && 
        formik.values.loan_tenure && 
        formik.values.interest_rate) {
      const principal = parseFloat(formik.values.loan_amount);
      const rate = parseFloat(formik.values.interest_rate) / 100 / 12; // Monthly interest rate
      const time = parseFloat(formik.values.loan_tenure) * 12; // Convert years to months
      
      const emi = principal * rate * Math.pow(1 + rate, time) / (Math.pow(1 + rate, time) - 1);
      formik.setFieldValue('emi_amount', emi.toFixed(2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.payment_method, formik.values.loan_amount, formik.values.loan_tenure, formik.values.interest_rate]);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Purchase Details
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Purchase details submitted successfully!
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="vehicle_id"
                  name="vehicle_id"
                  label="Select Vehicle"
                  value={formik.values.vehicle_id}
                  onChange={formik.handleChange}
                  error={formik.touched.vehicle_id && Boolean(formik.errors.vehicle_id)}
                  helperText={formik.touched.vehicle_id && formik.errors.vehicle_id}
                >
                  {availableVehicles.map((vehicle) => (
                    <MenuItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name} - {vehicle.model} (ID: {vehicle.id})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="dealer_id"
                  name="dealer_id"
                  label="Select Dealer (Optional)"
                  value={formik.values.dealer_id}
                  onChange={formik.handleChange}
                  error={formik.touched.dealer_id && Boolean(formik.errors.dealer_id)}
                  helperText={formik.touched.dealer_id && formik.errors.dealer_id}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {availableDealers.map((dealer) => (
                    <MenuItem key={dealer.id} value={String(dealer.id)}>
                      {dealer.name} - {dealer.dealer_code} ({dealer.location})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  id="payment_method"
                  name="payment_method"
                  label="Payment Method"
                  value={formik.values.payment_method}
                  onChange={(e) => {
                    formik.handleChange(e);
                    // Reset loan fields when switching to cash
                    if (e.target.value === 'cash') {
                      formik.setValues({
                        ...formik.values,
                        payment_method: 'cash',
                        bank_name: '',
                        loan_amount: '',
                        loan_tenure: '',
                        interest_rate: '',
                        emi_amount: '',
                        down_payment: ''
                      });
                    }
                  }}
                  error={formik.touched.payment_method && Boolean(formik.errors.payment_method)}
                  helperText={formik.touched.payment_method && formik.errors.payment_method}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="loan">Loan</MenuItem>
                </TextField>
              </Grid>

              {formik.values.payment_method === 'loan' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Typography variant="h6">Loan Details</Typography>
                    </Divider>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="bank_name"
                      name="bank_name"
                      label="Bank Name"
                      value={formik.values.bank_name}
                      onChange={formik.handleChange}
                      error={formik.touched.bank_name && Boolean(formik.errors.bank_name)}
                      helperText={formik.touched.bank_name && formik.errors.bank_name}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="loan_amount"
                      name="loan_amount"
                      label="Loan Amount"
                      type="number"
                      value={formik.values.loan_amount}
                      onChange={formik.handleChange}
                      error={formik.touched.loan_amount && Boolean(formik.errors.loan_amount)}
                      helperText={formik.touched.loan_amount && formik.errors.loan_amount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="loan_tenure"
                      name="loan_tenure"
                      label="Loan Tenure (Years)"
                      type="number"
                      value={formik.values.loan_tenure}
                      onChange={formik.handleChange}
                      error={formik.touched.loan_tenure && Boolean(formik.errors.loan_tenure)}
                      helperText={formik.touched.loan_tenure && formik.errors.loan_tenure}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="interest_rate"
                      name="interest_rate"
                      label="Interest Rate (%)"
                      type="number"
                      value={formik.values.interest_rate}
                      onChange={formik.handleChange}
                      error={formik.touched.interest_rate && Boolean(formik.errors.interest_rate)}
                      helperText={formik.touched.interest_rate && formik.errors.interest_rate}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="emi_amount"
                      name="emi_amount"
                      label="EMI Amount"
                      type="number"
                      value={formik.values.emi_amount}
                      disabled
                      error={formik.touched.emi_amount && Boolean(formik.errors.emi_amount)}
                      helperText={formik.touched.emi_amount && formik.errors.emi_amount}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="down_payment"
                      name="down_payment"
                      label="Down Payment"
                      type="number"
                      value={formik.values.down_payment}
                      onChange={formik.handleChange}
                      error={formik.touched.down_payment && Boolean(formik.errors.down_payment)}
                      helperText={formik.touched.down_payment && formik.errors.down_payment}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="h6">Insurance Details</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="insurance_start"
                  name="insurance_start"
                  label="Insurance Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.insurance_start}
                  onChange={formik.handleChange}
                  error={formik.touched.insurance_start && Boolean(formik.errors.insurance_start)}
                  helperText={formik.touched.insurance_start && formik.errors.insurance_start}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="insurance_end"
                  name="insurance_end"
                  label="Insurance End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.insurance_end}
                  onChange={formik.handleChange}
                  error={formik.touched.insurance_end && Boolean(formik.errors.insurance_end)}
                  helperText={formik.touched.insurance_end && formik.errors.insurance_end}
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="h6">Delivery Details</Typography>
                </Divider>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="delivery_address"
                  name="delivery_address"
                  label="Delivery Address"
                  multiline
                  rows={2}
                  value={formik.values.delivery_address}
                  onChange={formik.handleChange}
                  error={formik.touched.delivery_address && Boolean(formik.errors.delivery_address)}
                  helperText={formik.touched.delivery_address && formik.errors.delivery_address}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="delivery_date"
                  name="delivery_date"
                  label="Delivery Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.delivery_date}
                  onChange={formik.handleChange}
                  error={formik.touched.delivery_date && Boolean(formik.errors.delivery_date)}
                  helperText={formik.touched.delivery_date && formik.errors.delivery_date}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="owner_name"
                  name="owner_name"
                  label="Owner Name"
                  value={formik.values.owner_name}
                  onChange={formik.handleChange}
                  error={formik.touched.owner_name && Boolean(formik.errors.owner_name)}
                  helperText={formik.touched.owner_name && formik.errors.owner_name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="purchase_date"
                  name="purchase_date"
                  label="Purchase Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.purchase_date}
                  onChange={formik.handleChange}
                  error={formik.touched.purchase_date && Boolean(formik.errors.purchase_date)}
                  helperText={formik.touched.purchase_date && formik.errors.purchase_date}
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
                {formik.isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default PurchaseOptions;

