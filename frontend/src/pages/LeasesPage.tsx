import { useMemo, useState, type FormEvent } from "react";
import { Anchor, Button, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import DataState from "../components/DataState";
import { useDemoCollection } from "../data/demoStore";
import { bills, documents, leases as demoLeases, payments, properties as demoProperties, type Lease, type Property } from "../data/demo";

const blank = { propertyId: "", tenant: "", email: "", rent: "", start: "", end: "" };

export default function LeasesPage() {
  const [leases, setLeases] = useDemoCollection<Lease>("rental.leases", demoLeases);
  const [properties] = useDemoCollection<Property>("rental.properties", demoProperties);
  const [paymentItems, setPaymentItems] = useDemoCollection("rental.payments", payments);
  const [billItems, setBillItems] = useDemoCollection("rental.bills", bills);
  const [docItems, setDocItems] = useDemoCollection("rental.documents", documents);
  const [query, setQuery] = useState("");
  const [propertyId, setPropertyId] = useState("all");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rentMin, setRentMin] = useState("");
  const [rentMax, setRentMax] = useState("");
  const [opened, setOpened] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const today = new Date().toISOString().slice(0, 10);
  const filtered = useMemo(() => leases.filter((l) => {
    const prop = properties.find((p) => p.id === l.propertyId);
    const active = l.end >= today;
    return l.tenant.toLowerCase().includes(query.toLowerCase())
      && (propertyId === "all" || l.propertyId === Number(propertyId))
      && (status === "all" || (status === "active" ? active : !active))
      && (!dateFrom || l.start >= dateFrom) && (!dateTo || l.end <= dateTo)
      && (!rentMin || l.rent >= Number(rentMin)) && (!rentMax || l.rent <= Number(rentMax))
      && Boolean(prop);
  }), [leases, properties, query, propertyId, status, dateFrom, dateTo, rentMin, rentMax, today]);

  function addLease(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = Number(form.propertyId), rent = Number(form.rent);
    if (!id || form.tenant.trim().length < 2 || !form.email.includes("@") || !Number.isFinite(rent) || rent <= 0 || !form.start || !form.end || form.end <= form.start) {
      setError("Проверьте объект, имя, email, сумму и даты договора."); return;
    }
    setLeases((old) => [...old, { id: Math.max(0, ...old.map((l) => l.id)) + 1, propertyId: id, tenant: form.tenant.trim(), rent, start: form.start, end: form.end }]);
    setOpened(false); setForm(blank); setError("");
  }

  function deleteLease() {
    if (deleteId === null) return;
    setLeases((old) => old.filter((l) => l.id !== deleteId));
    setPaymentItems((old) => old.filter((x) => x.leaseId !== deleteId));
    setBillItems((old) => old.filter((x) => x.leaseId !== deleteId));
    setDocItems((old) => old.filter((x) => x.leaseId !== deleteId));
    setDeleteId(null);
  }

  return <>
    <Group justify="space-between" mb="md"><Title order={2}>Договоры аренды</Title><Button onClick={() => { setForm(blank); setOpened(true); }}>Новый договор</Button></Group>
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="md">
      <TextInput label="Арендатор" placeholder="Поиск по имени" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
      <Select label="Объект" data={[{ value: "all", label: "Все объекты" }, ...properties.map((p) => ({ value: String(p.id), label: p.address }))]} value={propertyId} onChange={(v) => setPropertyId(v ?? "all")} />
      <Select label="Статус" data={[{ value: "all", label: "Все договоры" }, { value: "active", label: "Действующие" }, { value: "ended", label: "Завершённые" }]} value={status} onChange={(v) => setStatus(v ?? "all")} />
      <TextInput label="Начало не раньше" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.currentTarget.value)} />
      <TextInput label="Окончание не позже" type="date" value={dateTo} onChange={(e) => setDateTo(e.currentTarget.value)} />
      <Group grow><NumberInput label="Аренда от, ₽" min={0} value={rentMin} onChange={(v) => setRentMin(String(v))} /><NumberInput label="до, ₽" min={0} value={rentMax} onChange={(v) => setRentMax(String(v))} /></Group>
    </SimpleGrid>
    <DataState empty={filtered.length === 0} message="Договоров по выбранным фильтрам нет." />
    {filtered.length > 0 && <Table.ScrollContainer minWidth={800}><Table striped highlightOnHover>
      <Table.Thead><Table.Tr><Table.Th>Объект</Table.Th><Table.Th>Арендатор</Table.Th><Table.Th>Аренда, ₽/мес</Table.Th><Table.Th>Срок</Table.Th><Table.Th>Статус</Table.Th><Table.Th>Действия</Table.Th></Table.Tr></Table.Thead>
      <Table.Tbody>{filtered.map((l) => <Table.Tr key={l.id}>
        <Table.Td>{properties.find((p) => p.id === l.propertyId)?.address}</Table.Td><Table.Td>{l.tenant}</Table.Td><Table.Td>{l.rent.toLocaleString("ru-RU")}</Table.Td><Table.Td>{l.start} — {l.end}</Table.Td><Table.Td>{l.end >= today ? "Действует" : "Завершён"}</Table.Td>
        <Table.Td><Group gap="xs"><Anchor component={Link} to={`/leases/${l.id}`}>Открыть</Anchor><Button color="red" variant="light" size="compact-sm" onClick={() => setDeleteId(l.id)}>Удалить</Button></Group></Table.Td>
      </Table.Tr>)}</Table.Tbody>
    </Table></Table.ScrollContainer>}
    <Modal opened={opened} onClose={() => { setOpened(false); setError(""); }} title="Новый договор"><form onSubmit={addLease}><Stack>
      {error && <Text c="red" role="alert">{error}</Text>}
      <Select label="Объект" data={properties.map((p) => ({ value: String(p.id), label: `${p.address}, ${p.city}` }))} value={form.propertyId || null} onChange={(v) => setForm({ ...form, propertyId: v ?? "" })} required />
      <TextInput label="Арендатор" minLength={2} required value={form.tenant} onChange={(e) => setForm({ ...form, tenant: e.currentTarget.value })} />
      <TextInput label="Email арендатора" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.currentTarget.value })} />
      <NumberInput label="Аренда, ₽/мес" min={1} required value={form.rent} onChange={(v) => setForm({ ...form, rent: String(v) })} />
      <TextInput label="Начало договора" type="date" required value={form.start} onChange={(e) => setForm({ ...form, start: e.currentTarget.value })} />
      <TextInput label="Окончание договора" type="date" required value={form.end} onChange={(e) => setForm({ ...form, end: e.currentTarget.value })} />
      <Button type="submit">Сохранить договор</Button>
    </Stack></form></Modal>
    <Modal opened={deleteId !== null} onClose={() => setDeleteId(null)} title="Удалить договор?"><Stack>
      <Text>Связанные платежи, счета и документы тоже будут удалены из демоданных.</Text>
      <Group justify="flex-end"><Button variant="default" onClick={() => setDeleteId(null)}>Отмена</Button><Button color="red" onClick={deleteLease}>Удалить</Button></Group>
    </Stack></Modal>
  </>;
}
