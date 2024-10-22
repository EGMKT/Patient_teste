import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dashboard, DataUsage, People, LocalHospital, Assessment } from '@mui/icons-material';

interface SuperAdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  const menuItems = [
    { title: 'dashboard', icon: <Dashboard />, link: '/SA' },
    { title: 'databaseOverview', icon: <DataUsage />, link: '/SA/database-overview' },
    { title: 'manageUsers', icon: <People />, link: '/SA/manage-users' },
    { title: 'manageClinics', icon: <LocalHospital />, link: '/SA/manage-clinics' },
    { title: 'viewReports', icon: <Assessment />, link: '/SA/view-reports' },
  ];

  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={index} component={Link} to={item.link} onClick={onClose}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={t(item.title)} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default SuperAdminSidebar;
