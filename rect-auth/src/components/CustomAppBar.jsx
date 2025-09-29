import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Container from '@mui/material/Container';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccessAlarmsIcon from '@mui/icons-material/AccessAlarms';
import Groups2Icon from '@mui/icons-material/Groups2';
import ChecklistIcon from '@mui/icons-material/Checklist';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import ApartmentIcon from '@mui/icons-material/Apartment';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeContext } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    '& .MuiDrawer-paper': {
      backgroundColor: '#5C9B10', // Background color for drawer
      color: '#fff', // Text color
    },
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': {
        ...openedMixin(theme),
        backgroundColor: '#5C9B10', // Background color when open
        color: '#fff', // Text color
      },
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': {
        ...closedMixin(theme),
        backgroundColor: '#5C9B10', // Background color when closed
        color: '#fff', // Text color
      },
    }),
  }),
);

const settings = ['Profile','Theme','Logout'];

// Navigation items for the drawer
const navItems = [
  { 
    text: 'ユーザー管理', 
    icon: <AccountCircleIcon />, 
    path: null,
    children: [
      { text: 'ユーザー覧', icon: <ChecklistIcon />, path: '/dashboard/userList' },
      { text: 'ユーザー作成', icon: <AddCircleIcon />, path: '/dashboard/userCreate' },
    ]
  },
  { 
    text: '学生情報', 
    icon: <Groups2Icon />, 
    path: null,
    children: [
      { text: '学生一覧', icon: <ChecklistIcon />, path: '/dashboard/studentList' },
      { text: '学生作成', icon: <PersonAddIcon />, path: '/dashboard/studentCreate' },
    ]
  },
  { 
    text: '大学情報', 
    icon: <SchoolIcon />,
    path: null,
    children: [
      { text: '大学一覧', icon: <ChecklistIcon />, path: '/dashboard/schoolList' },
      { text: '大学作成', icon: <ApartmentIcon />, path: '/dashboard/schoolCreate' },
    ]
  },
  { 
    text: '従業員情報', 
    icon: <BadgeIcon />, 
    path: null,
    children: [
      { text: '従業員一覧', icon: <ChecklistIcon />, path: '/dashboard/employeeList' },
    ]
  },
  { 
    text: '出席情報', 
    icon: <AccessAlarmsIcon />, 
    path: null,
    children: [
      { text: '出席者一覧', icon: <ChecklistIcon />, path: '/dashboard/attendenceList' },
      { text: '出席者作成', icon: <NoteAddIcon />, path: '/dashboard/attendenceCreate' },
    ]
  },
];

export default function MiniDrawer() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const { mode, toggleTheme } = useThemeContext();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State to track which section is expanded (default: Students Info)
  const [expandedSection, setExpandedSection] = React.useState('Students Info');

  const handleDrawerOpen = () => {
    setOpen(true);
    // Always expand Students Info when drawer opens
    setExpandedSection('Students Info');
  };

  const handleDrawerClose = () => {
    setOpen(false);
    // Collapse all sections when drawer closes
    setExpandedSection(null);
  };

  const handleSectionClick = (sectionName) => {
    // If clicking the already expanded section, collapse it
    // Otherwise, expand the clicked section
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = (setting) => {
    setAnchorElUser(null);
    if (setting === 'Theme') {
      toggleTheme();
    } else if (setting === 'Profile') {
      navigate('/dashboard/profile');
    } else if (setting === 'Dashboard') {
      navigate('/dashboard');
    } else if (setting === 'Logout') {
      handleLogout();
    }
  };

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    // Immediately clear local state and redirect without waiting for API
    logout(); // Don't await - let it run in background
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{
          background: "linear-gradient(to right, rgba(92,155,16,1) 19%, rgba(97,253,102,1) 81%)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo and title */}
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
              <Avatar
                alt="Logo"
                src="/img/logo2.png"
                variant="square"
                component="a"
                href="/dashboard/"
                sx={{ width: 60, height: 60, display: { xs: 'none', md: 'flex' }, mr: 1 }}
              />
              <Typography
                variant="h5"
                noWrap
                component="a"
                href="/dashboard/"
                sx={{
                  mr: 2,
                  display: { xs: 'none', md: 'flex' },
                  fontFamily: 'Noto Serif JP',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                インターンシップ管理システム
              </Typography>

              {/* Mobile Logo & title */}
              <Avatar
                alt="Logo"
                src="/img/logo2.png"
                variant="square"
                component="a"
                href="/dashboard/"
                sx={{ width: 60, height: 60, display: { xs: 'flex', md: 'none' }, mr: 1 }}
              />
              <Typography
                variant="h6"
                noWrap
                component="a"
                href="/dashboard/"
                sx={{
                  display: { xs: 'flex', md: 'none' },
                  fontFamily: 'Noto Serif JP',
                  fontWeight: 700,
                  letterSpacing: '.3rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                インターンシップ管理システム
              </Typography>
            </Box>

            {/* Profile avatar & menu aligned at the end */}
            <Box sx={{ flexShrink: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="profile" src="/img/profile.png" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={() => handleCloseUserMenu(null)}
              >
                {settings.map((setting) => (
                  <MenuItem 
                    key={setting} 
                    onClick={() => handleCloseUserMenu(setting)}
                    sx={{ py: 1.5 }}
                  >
                    {/* Profile Icon */}
                    {setting === 'Profile' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <AssignmentIndIcon sx={{ mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2">{setting}</Typography>
                      </Box>
                    )}
                    
                    {/* Theme Toggle Icon */}
                    {setting === 'Theme' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        {mode === 'dark' ? (
                          <Brightness7Icon sx={{ mr: 1.5, fontSize: 20 }} />
                        ) : (
                          <Brightness4Icon sx={{ mr: 1.5, fontSize: 20 }} />
                        )}
                        <Typography variant="body2">
                          {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Logout Icon */}
                    {setting === 'Logout' && (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                        <Typography variant="body2">{setting}</Typography>
                      </Box>
                    )}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer variant="permanent" open={open}>
        <DrawerHeader sx={{ 
          backgroundColor: '#4A7D0D',
          color: '#fff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <Typography sx={{ fontWeight: 900, fontSize: 20, paddingLeft: 8 }}>管理設定</Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? 
              <ChevronRightIcon sx={{color: '#fff'}} /> : 
              <ChevronLeftIcon sx={{color: '#fff'}} />
            }
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        <List sx={{padding: 0}}>
          {navItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding sx={{ display: 'block', color: '#fff'}}>
                <ListItemButton
                  onClick={() => handleSectionClick(item.text)}
                  sx={{
                    minHeight: 48,
                    px: 2.5,
                    justifyContent: open ? 'initial' : 'center',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      justifyContent: 'center',
                      mr: open ? 3 : 'auto',
                      color: '#fff',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    sx={{ opacity: open ? 1 : 0 }} 
                  />
                  {open && (expandedSection === item.text ? <ExpandLess /> : <ExpandMore />)}
                </ListItemButton>
              </ListItem>
              <Collapse in={expandedSection === item.text && open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding sx={{ display: 'block', color: '#fff' }}>
                      <ListItemButton
                        onClick={() => handleNavigation(child.path)}
                        sx={{
                          minHeight: 48,
                          px: 2.5,
                          pl: open ? 4 : 2.5,
                          justifyContent: open ? 'initial' : 'center',
                          backgroundColor: location.pathname === child.path ? 'rgba(255, 255, 255, 0.2)' : 'inherit',
                          color: '#fff',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 0,
                            justifyContent: 'center',
                            mr: open ? 3 : 'auto',
                            color: '#fff',
                          }}
                        >
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={child.text} 
                          sx={{ opacity: open ? 1 : 0 }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        {/* This will render the nested route content */}
        <Outlet />
      </Box>
    </Box>
  );
}