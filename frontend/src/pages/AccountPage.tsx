import { Avatar, Card, Group, SimpleGrid, Stack, Switch, Text, Title } from "@mantine/core";
import { useAuth } from "../AuthContext";

export default function AccountPage() {
  const { user } = useAuth();
  if (!user) return null;
  return <>
    <Title order={2} mb="lg">Личный кабинет</Title>
    <Card withBorder mb="md"><Group>
      <Avatar color="blue" radius="xl" size={72}>{user.full_name.slice(0, 1)}</Avatar>
      <div><Title order={3}>{user.full_name}</Title><Text c="dimmed">{user.role === "landlord" ? "Арендодатель" : "Арендатор"}</Text><Text>{user.email}</Text></div>
    </Group></Card>
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <Card withBorder><Title order={4} mb="md">Данные аккаунта</Title><Stack gap="sm">
        <Text><b>Идентификатор:</b> {user.id}</Text>
        <Text><b>Имя:</b> {user.full_name}</Text>
        <Text><b>Email:</b> {user.email}</Text>
        <Text><b>Роль:</b> {user.role === "landlord" ? "Арендодатель" : "Арендатор"}</Text>
      </Stack></Card>
      <Card withBorder><Title order={4} mb="md">Настройки</Title><Stack gap="md">
        <Switch label="Уведомления о платежах" defaultChecked />
        <Switch label="Уведомления о документах" defaultChecked />
        <Text c="dimmed" size="sm">Вход защищён access-токеном. Refresh-токен обновляется автоматически.</Text>
      </Stack></Card>
    </SimpleGrid>
  </>;
}
