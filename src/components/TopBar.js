import React, { useState, useContext, useEffect } from 'react';
import {
  AppBar,
  Drawer,
  List,
  ListItemButton,
  Box,
  IconButton,
  Toolbar,
  FormControl,
  InputLabel,
  Select,
  Divider,
  MenuItem,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import TextField from '@mui/material/TextField';
import { useLocation, useNavigate } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import GalleryBreadcrumbs from './GalleryBreadcrumbs';

export default function SearchAppBar() {
  const { state, chosenVideoFormat, setChosenVideoFormat } = useContext(GalleryContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Keep local searchTerm in sync with the URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const paramValue = params.get('searchTerm') || '';
    setSearchTerm(paramValue);
  }, [location.search]);

  const handleVideoFormatChange = function(event)  {
    setChosenVideoFormat(event.target.value);
  };

  const videoFormatMenuItems = state.videoFormats ? state.videoFormats.map(oneVideoFormat => {
    return (
        <MenuItem key={oneVideoFormat} value={oneVideoFormat}>{oneVideoFormat}</MenuItem>
    );
  }) : [];

  const handleSearchKeyDown = event => {
    if (event.key === 'Enter') {
      const trimmed = (searchTerm || '').trim();
      const params = new URLSearchParams(location.search || '');
      if (trimmed.length > 0) {
        params.set('searchTerm', trimmed);
      } else {
        params.delete('searchTerm');
      }
      const newSearch = params.toString();
      navigate({ pathname: location.pathname, search: newSearch ? `?${newSearch}` : '' });
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <List sx={{ minWidth: 260 }}>
          <Divider />
          <ListItemButton>
            <FormControl fullWidth>
              <InputLabel id='video-quality-select-label'>Video Quality</InputLabel>
              <Select
                  labelId='video-quality-open-select-label'
                  id='video-quality-open-select'
                  value={chosenVideoFormat}
                  label='Video Quality'
                  onChange={handleVideoFormatChange}
                  variant='standard'
              >
                {videoFormatMenuItems}
              </Select>
            </FormControl>
          </ListItemButton>
        </List>
      </Drawer>
      <AppBar position='static'>
        <Toolbar>
          <IconButton
            edge='start'
            color='inherit'
            aria-label='open drawer'
            sx={{ mr: 2 }}
            onClick={() => setIsDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography
              variant="h6"
              noWrap
              component='div'
              sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            <GalleryBreadcrumbs/>
          </Typography>
            <TextField
              id="searchTermField"
              label="Search"
              variant="outlined"
              sx={{
                input: { color: 'white' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'white' },
                  '&:hover fieldset': { borderColor: 'white' },
                  '&.Mui-focused fieldset': { borderColor: 'white' }
                }
              }}
              InputLabelProps={{
                sx: {
                  color: 'lightgray',
                  '&.Mui-focused': { color: 'lightgray' }
                }
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
        </Toolbar>
      </AppBar>
    </Box>
  );
}
