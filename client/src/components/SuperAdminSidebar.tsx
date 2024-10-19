import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DataUsage, People, LocalHospital, EventNote } from '@mui/icons-material';

interface SuperAdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({ open, onClose }) => {
  const { t } = useTranslation();

  const menuItems = [
    { title: 'databaseOverview', icon: <DataUsage />, link: '/super-admin/database-overview' },
    { title: 'manageUsers', icon: <People />, link: '/super-admin/manage-users' },
    { title: 'manageClinics', icon: <LocalHospital />, link: '/super-admin/manage-clinics' },
    { title: 'viewReports', icon: <EventNote />, link: '/super-admin/view-reports' },
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
