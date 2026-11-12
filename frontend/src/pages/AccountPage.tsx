import { useState, type FormEvent } from "react";
import { Avatar, Button, Card, Group, Modal, Select, SimpleGrid, Stack, Switch, Text, TextInput, Title, Transition } from "@mantine/core";
import { useDemoCollection } from "../data/demoStore";
import { leases as demoLeases, properties as demoProperties, type Lease, type Property } from "../data/demo";

export default function AccountPage() {
  const [name, setName] = useState("Александр Иванов");
  const [email, setEmail] = useState("alex@example.com");
  const [phone, setPhone] = useState("+7 (900) 123-45-67");
  const [city, setCity] = useState("Москва");
  const [role, setRole] = useState("Арендодатель");
  const [draft, setDraft] = useState({ name, email, phone, city, role });
  const [contact, setContact] = useState("email");
  const [notifications, setNotifications] = useState(true);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState("");
  const [properties] = useDemoCollection<Property>("rental.properties", demoProperties);
  const [leases] = useDemoCollection<Lease>("rental.leases", demoLeases);
  const today = new Date().toISOString().slice(0, 10);
  const activeLeases = leases.filter((x) => x.end >= today).length;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.name.trim().length < 2 || !draft.email.includes("@") || !draft.phone.trim() || !draft.city.trim()) {
      setError("Заполните имя, email, телефон и город."); return;
    }
    setName(draft.name.trim()); setEmail(draft.email.trim()); setPhone(draft.phone.trim()); setCity(draft.city.trim()); setRole(draft.role);
    setError(""); setOpened(false);
  }

  return <Transition mounted transition="fade-up" duration={250}>{(styles) => <div style={styles}>
    <Group justify="space-between" mb="lg"><div><Title order={2}>Личный кабинет</Title><Text c="dimmed">Профиль и настройки пользователя</Text></div><Button onClick={() => { setDraft({ name, email, phone, city, role }); setOpened(true); }}>Редактировать профиль</Button></Group>
    <Card withBorder mb="md"><Group>
      <Avatar color="blue" radius="xl" size={72}>{name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</Avatar>
      <div><Title order={3}>{name}</Title><Text c="dimmed">{role} · пользователь с 2026 года</Text><Text>{email}</Text></div>
    </Group></Card>
    <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
      <Card withBorder><Text c="dimmed" size="sm">Объектов</Text><Title order={3}>{properties.length}</Title></Card>
      <Card withBorder><Text c="dimmed" size="sm">Договоров</Text><Title order={3}>{leases.length}</Title></Card>
      <Card withBorder><Text c="dimmed" size="sm">Действующих договоров</Text><Title order={3}>{activeLeases}</Title></Card>
    </SimpleGrid>
    <SimpleGrid cols={{ base: 1, md: 2 }}>
      <Card withBorder><Title order={4} mb="md">Контактные данные</Title><Stack gap="sm">
        <Text><b>Телефон:</b> {phone}</Text><Text><b>Город:</b> {city}</Text><Text><b>Email для связи:</b> {email}</Text>
        <Select label="Предпочтительный способ связи" data={[{ value: "email", label: "Электронная почта" }, { value: "phone", label: "Телефон" }]} value={contact} onChange={(v) => setContact(v ?? "email")} />
      </Stack></Card>
      <Card withBorder><Title order={4} mb="md">Уведомления и безопасность</Title><Stack gap="sm">
        <Switch label="Получать уведомления о платежах" checked={notifications} onChange={(e) => setNotifications(e.currentTarget.checked)} />
        <Text c="dimmed" size="sm">Настройки и контактные данные пока хранятся только в интерфейсе. Вход и защита аккаунта будут подключены на этапе авторизации.</Text>
      </Stack></Card>
    </SimpleGrid>
    <Modal opened={opened} onClose={() => { setOpened(false); setError(""); }} title="Редактировать профиль"><form onSubmit={save}><Stack>
      {error && <Text c="red" role="alert">{error}</Text>}
      <TextInput label="Имя" minLength={2} required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.currentTarget.value })} />
      <TextInput label="Email" type="email" required value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.currentTarget.value })} />
      <TextInput label="Телефон" required value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.currentTarget.value })} />
      <TextInput label="Город" required value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.currentTarget.value })} />
      <Select label="Роль" data={["Арендодатель", "Арендатор"]} value={draft.role} onChange={(v) => setDraft({ ...draft, role: v ?? "Арендодатель" })} />
      <Group justify="flex-end"><Button variant="default" onClick={() => { setDraft({ name, email, phone, city, role }); setOpened(false); }}>Отмена</Button><Button type="submit">Сохранить</Button></Group>
    </Stack></form></Modal>
  </div>}</Transition>;
}
