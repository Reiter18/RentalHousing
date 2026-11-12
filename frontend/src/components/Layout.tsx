import { useState } from "react";
import { Avatar, Button, Container, Group, Text, Title } from "@mantine/core";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const links = [{ to: "/", label: "Объекты" }, { to: "/leases", label: "Договоры" }];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);
  async function signOut() { setBusy(true); await logout(); navigate("/login", { replace: true }); }

  return <>
    <Group justify="space-between" px="md" py="sm" bg="blue.7">
      <Group><Title order={4} c="white">Аренда жилья</Title>{links.map((link) => {
        const active = link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
        return <Button key={link.to} component={Link} to={link.to} variant={active ? "white" : "subtle"} color={active ? "blue" : "white"} size="compact-md">{link.label}</Button>;
      })}</Group>
      <Group gap="xs">
        <Button component={Link} to="/account" variant={pathname === "/account" ? "white" : "subtle"} color={pathname === "/account" ? "blue" : "white"} size="compact-md">
          <Group gap="xs"><Avatar size="sm" radius="xl" color="blue">{user?.full_name.slice(0, 1)}</Avatar><Text size="sm">{user?.full_name}</Text></Group>
        </Button>
        <Button variant="default" size="compact-md" loading={busy} onClick={signOut}>Выйти</Button>
      </Group>
    </Group>
    <Container size="lg" py="md"><Outlet /></Container>
  </>;
}
