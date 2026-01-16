import { AppShell, NavLink } from '@mantine/core';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { IconDashboard, IconHospital, IconMoneybag, IconNurse, IconUsersGroup, IconSend, IconDots, IconArticle } from '@tabler/icons-react';

export default function Home() {
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', to: '/', icon: <IconDashboard size={16} stroke={1.5} /> },
    { label: 'Health Institution', to: '/health', icon: <IconHospital size={16} stroke={1.5} /> },
    { label: 'Financial Institution', to: '/financial', icon: <IconMoneybag size={16} stroke={1.5} /> },
    { label: 'Medical Specialist', to: '/medspecialist', icon: <IconNurse size={16} stroke={1.5} /> },
    { label: 'Support Groups', to: '/supportgroups', icon: <IconUsersGroup size={16} stroke={1.5} /> },
    { label: 'Blogs and News(Feeds)', to: '/feed', icon: <IconArticle size={16} stroke={1.5} /> },
    { label: 'SMS Manager', to: '/sms', icon: <IconSend size={16} stroke={1.5} /> },
    { label: 'Utilities', to: '/utils', icon: <IconDots size={16} stroke={1.5} /> },
  ];

  return (
    <AppShell
      padding="sm"
      navbar={{
        width: { base: 100, md: 300 },
        breakpoint: 'sm',
      }}
    >
      <AppShell.Navbar p="md">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            label={link.label}
            component={Link}
            to={link.to}
            active={location.pathname === link.to}
            leftSection={link.icon}
          />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet /> {/* Dynamic content goes here */}
      </AppShell.Main>
    </AppShell>
  );
}
