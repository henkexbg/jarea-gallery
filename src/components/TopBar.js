import React, { useState, useContext } from 'react';
import { alpha, styled } from '@mui/material/styles';
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
  InputBase,
  MenuItem,
  Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLocation, useNavigate } from 'react-router-dom';
import { GalleryContext } from '../context/GalleryContext';
import GalleryBreadcrumbs from './GalleryBreadcrumbs';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

export default function SearchAppBar() {
  const { state, chosenVideoFormat, setChosenVideoFormat } = useContext(GalleryContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = function(event)  {
    setChosenVideoFormat(event.target.value);
  };

  const videoFormatMenuItems = state.videoFormats ? state.videoFormats.map(oneVideoFormat => {
    return (
        <MenuItem key={oneVideoFormat} value={oneVideoFormat}>{oneVideoFormat}</MenuItem>
    );
  }) : [];

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
                  onChange={handleChange}
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
          <Search>
            <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                onKeyDown={event => {
                  const searchTerm = event.target.value ? event.target.value.trim() : null;
                  if (event.key === 'Enter' && searchTerm && searchTerm.length > 0) {
                    navigate({ pathname: location.pathname, search: `?searchTerm=${searchTerm}` });
                  }
                }}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
