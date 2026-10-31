import { Button, Container, Group, Title } from "@mantine/core";
import { Link, Outlet, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Объекты" },
  { to: "/leases", label: "Договоры" },
];

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <>
      <Group justify="space-between" px="md" py="sm" bg="blue.7">
        <Group>
          <Title order={4} c="white">
            Аренда жилья
          </Title>
          {links.map((link) => {
            const active =
              link.to === "/" ? pathname === "/" : pathname.startsWith(link.to);
            return (
              <Button
                key={link.to}
                component={Link}
                to={link.to}
                variant={active ? "white" : "subtle"}
                color={active ? "blue" : "white"}
                size="compact-md"
              >
                {link.label}
              </Button>
            );
          })}
        </Group>
        <Button
          component={Link}
          to="/login"
          variant="default"
          size="compact-md"
        >
          Выйти
        </Button>
      </Group>

      <Container size="lg" py="md">
        <Outlet />
      </Container>
    </>
  );
}
