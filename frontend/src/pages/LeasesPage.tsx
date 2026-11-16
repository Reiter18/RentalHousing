import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Anchor, Button, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import DataState from "../components/DataState";
import { apiJson } from '../api';
import { useAuth } from '../AuthContext';
import type { Property } from "../data/demo";
type Lease = { id: number; propertyId: number; tenant: string; email: string; rent: number; start: string; end: string; property: Property };
type ApiLease = { id: number; property: Property; tenant_name: string; tenant_email: string; rent: number; start_date: string; end_date: string };

const blank = { propertyId: "", tenant: "", email: "", rent: "", start: "", end: "" };

export default function LeasesPage() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { user } = useAuth();
  async function load() {
    try {
      setLoadError("");
      const [rows, owned] = await Promise.all([apiJson<ApiLease[]>("/leases"), apiJson<Property[]>("/properties")]);
      setProperties(owned);
      setLeases(rows.map((x) => ({ id: x.id, propertyId: x.property.id, property: x.property, tenant: x.tenant_name, email: x.tenant_email, rent: x.rent, start: x.start_date, end: x.end_date })));
    } catch (e) { setLoadError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
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
    const prop = l.property;
    const active = l.end >= today;
    return l.tenant.toLowerCase().includes(query.toLowerCase())
      && (propertyId === "all" || l.propertyId === Number(propertyId))
      && (status === "all" || (status === "active" ? active : !active))
      && (!dateFrom || l.start >= dateFrom) && (!dateTo || l.end <= dateTo)
      && (!rentMin || l.rent >= Number(rentMin)) && (!rentMax || l.rent <= Number(rentMax))
      && Boolean(prop);
  }), [leases, properties, query, propertyId, status, dateFrom, dateTo, rentMin, rentMax, today]);

  async function addLease(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = Number(form.propertyId), rent = Number(form.rent);
    if (!id || form.tenant.trim().length < 2 || !form.email.includes("@") || !Number.isFinite(rent) || rent <= 0 || !form.start || !form.end || form.end <= form.start) {
      setError("Проверьте объект, имя, email, сумму и даты договора."); return;
    }
    try {
      await apiJson(editingId === null ? "/leases" : `/leases/${editingId}`, { method: editingId === null ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ property_id: id, tenant_name: form.tenant.trim(), tenant_email: form.email, rent, start_date: form.start, end_date: form.end }) });
      setOpened(false); setForm(blank); setError(""); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка сохранения"); }
  }
  async function deleteLease() {
    if (deleteId === null) return;
    try { await apiJson(`/leases/${deleteId}`, { method: "DELETE" }); setDeleteId(null); await load(); }
    catch (e) { setLoadError(e instanceof Error ? e.message : "Ошибка удаления"); setDeleteId(null); }
  }
  return <>
    <Group justify="space-between" mb="md"><Title order={2}>Договоры аренды</Title>{user?.role === "landlord" && <Button onClick={() => { setEditingId(null); setForm(blank); setOpened(true); }}>Новый договор</Button>}</Group>
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="md">
      <TextInput label="Арендатор" placeholder="Поиск по имени" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
      <Select label="Объект" data={[{ value: "all", label: "Все объекты" }, ...properties.map((p) => ({ value: String(p.id), label: p.address }))]} value={propertyId} onChange={(v) => setPropertyId(v ?? "all")} />
      <Select label="Статус" data={[{ value: "all", label: "Все договоры" }, { value: "active", label: "Действующие" }, { value: "ended", label: "Завершённые" }]} value={status} onChange={(v) => setStatus(v ?? "all")} />
      <TextInput label="Начало не раньше" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.currentTarget.value)} />
      <TextInput label="Окончание не позже" type="date" value={dateTo} onChange={(e) => setDateTo(e.currentTarget.value)} />
      <Group grow><NumberInput label="Аренда от, ₽" min={0} value={rentMin} onChange={(v) => setRentMin(String(v))} /><NumberInput label="до, ₽" min={0} value={rentMax} onChange={(v) => setRentMax(String(v))} /></Group>
    </SimpleGrid>
    <DataState loading={loading} error={loadError} empty={filtered.length === 0} message="Договоров по выбранным фильтрам нет." />
    {filtered.length > 0 && <Table.ScrollContainer minWidth={800}><Table striped highlightOnHover>
      <Table.Thead><Table.Tr><Table.Th>Объект</Table.Th><Table.Th>Арендатор</Table.Th><Table.Th>Аренда, ₽/мес</Table.Th><Table.Th>Срок</Table.Th><Table.Th>Статус</Table.Th><Table.Th>Действия</Table.Th></Table.Tr></Table.Thead>
      <Table.Tbody>{filtered.map((l) => <Table.Tr key={l.id}>
        <Table.Td>{l.property.address}</Table.Td><Table.Td>{l.tenant}</Table.Td><Table.Td>{l.rent.toLocaleString("ru-RU")}</Table.Td><Table.Td>{l.start} — {l.end}</Table.Td><Table.Td>{l.end >= today ? "Действует" : "Завершён"}</Table.Td>
        <Table.Td><Group gap="xs"><Anchor component={Link} to={`/leases/${l.id}`}>Открыть</Anchor>{user?.role === "landlord" && properties.some((p) => p.id === l.propertyId) && <><Button variant="light" size="compact-sm" onClick={() => { setEditingId(l.id); setForm({ propertyId: String(l.propertyId), tenant: l.tenant, email: l.email, rent: String(l.rent), start: l.start, end: l.end }); setOpened(true); }}>Изменить</Button><Button color="red" variant="light" size="compact-sm" onClick={() => setDeleteId(l.id)}>Удалить</Button></>}</Group></Table.Td>
      </Table.Tr>)}</Table.Tbody>
    </Table></Table.ScrollContainer>}
    <Modal opened={opened} onClose={() => { setOpened(false); setError(""); }} title={editingId === null ? "Новый договор" : "Изменить договор"}><form onSubmit={addLease}><Stack>
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
      <Text>Связанные платежи, счета и документы тоже будут удалены.</Text>
      <Group justify="flex-end"><Button variant="default" onClick={() => setDeleteId(null)}>Отмена</Button><Button color="red" onClick={deleteLease}>Удалить</Button></Group>
    </Stack></Modal>
  </>;
}

