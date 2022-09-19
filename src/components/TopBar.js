import React, { useState, useContext } from 'react';
import {
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
  Divider
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { makeStyles } from '@material-ui/core/styles';
import { GalleryContext } from '../context/GalleryContext';
import MenuItem from '@material-ui/core/MenuItem';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//   color: 'inherit',
//   '& .MuiInputBase-input': {
//     padding: theme.spacing(1, 1, 1, 0),
//     // vertical padding + font size from searchIcon
//     paddingLeft: `calc(1em + ${theme.spacing(4)})`,
//     transition: theme.transitions.create('width'),
//     width: '100%',
//     [theme.breakpoints.up('sm')]: {
//       width: '12ch',
//       '&:focus': {
//         width: '20ch',
//       },
//     },
//   },
// }));

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

  return (
    <Box sx={{ flexGrow: 1 }}>
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
        </Toolbar>
      </AppBar>
    </Box>
  );
}
