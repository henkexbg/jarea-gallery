import React, { useState, useContext } from 'react';
import {
  alpha,
  AppBar,
  Drawer,
  List,
  ListItem,
  Box,
  IconButton,
  Toolbar,
  styled,
  FormControl,
  InputLabel,
  Select,
  Divider,
  InputBase,
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { GalleryContext } from '../context/GalleryContext';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@mui/material/Typography';
import { useHistory } from "react-router";
import GalleryBreadcrumbs from "./GalleryBreadcrumbs";


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

const useStyles = makeStyles({
  root: {
    borderRadius: 12,
    backgroundColor: 'blue'
  }
});


export default function SearchAppBar() {
  const classes = useStyles();
  const { state, chosenVideoFormat, setChosenVideoFormat } = useContext(GalleryContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleChange = function(event)  {
    setChosenVideoFormat(event.target.value);
  }

  const videoFormatMenuItems = state.videoFormats ? state.videoFormats.map(oneVideoFormat => {
    return (
        <MenuItem key={oneVideoFormat} value={oneVideoFormat}>{oneVideoFormat}</MenuItem>
    )
  }) : []

  const history = useHistory();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <List className={classes.drawer}>
          <Divider />
          <ListItem button>
            <FormControl className={classes.formControl}>
              <InputLabel id='video-quality-select-label'>Video Quality</InputLabel>
              <Select
                  labelId='video-quality-open-select-label'
                  id='video-quality-open-select'
                  value={chosenVideoFormat}
                  onChange={handleChange}
              >
                {videoFormatMenuItems}
              </Select>
            </FormControl>
          </ListItem>
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
            <GalleryBreadcrumbs></GalleryBreadcrumbs>
          </Typography>
          <Search>
            <StyledInputBase
                placeholder="Search…"
                inputProps={{ 'aria-label': 'search' }}
                onKeyDown={event => {
                  let searchTerm = event.target.value ? event.target.value.trim() : null;
                  if (event.key === "Enter" && searchTerm && searchTerm.length > 0) {
                    history.push('?searchTerm=' + searchTerm);
                  }
                }}
            />
          </Search>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
