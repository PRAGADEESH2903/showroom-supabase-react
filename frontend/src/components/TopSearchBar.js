import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  AppBar,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const TopSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('customer');
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?type=${searchType}&q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm(''); // Clear search term after navigation
    }
  };

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleFilterSelect = (type) => {
    setSearchType(type);
    handleFilterClose();
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 4 }}>
          Sailakshmi Motors
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mr: 4 }}>
          <Button color="inherit" component={Link} to="/vehicles">Vehicles</Button>
          <Button color="inherit" component={Link} to="/customers">Customers</Button>
          <Button color="inherit" component={Link} to="/services">Services</Button>
          <Button color="inherit" component={Link} to="/purchases">Purchases</Button>
          <Button color="inherit" component={Link} to="/dealers">Dealers</Button>
        </Box>

        <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, display: 'flex', gap: 1, maxWidth: 400 }}>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder={`Search ${searchType === 'sub-dealer' ? 'sub dealers' : searchType + 's'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton
            onClick={handleFilterClick}
            sx={{ 
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}
          >
            <FilterListIcon />
          </IconButton>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleFilterSelect('customer')}>Customers</MenuItem>
          <MenuItem onClick={() => handleFilterSelect('vehicle')}>Vehicles</MenuItem>
          <MenuItem onClick={() => handleFilterSelect('service')}>Services</MenuItem>
          <MenuItem onClick={() => handleFilterSelect('purchase')}>Purchases</MenuItem>
          <MenuItem onClick={() => handleFilterSelect('sub-dealer')}>Sub Dealers</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopSearchBar;

