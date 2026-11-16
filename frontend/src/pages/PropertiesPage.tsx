import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Table, Text, TextInput, Title } from "@mantine/core";
import DataState from "../components/DataState";
import { apiJson } from "../api";
import { useAuth } from "../AuthContext";
import type { Property } from "../data/demo";

const blank = { address: "", city: "", area: "", rooms: "" };

export default function PropertiesPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { user } = useAuth();
  async function load() {
    try { setLoadError(""); setItems(await apiJson<Property[]>("/properties")); }
    catch (e) { setLoadError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("all");
  const [rooms, setRooms] = useState("all");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [opened, setOpened] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState(blank);
  const [error, setError] = useState("");
  const cities = [...new Set(items.map((p) => p.city))];
  const filtered = useMemo(() => items.filter((p) => {
    const textMatches = `${p.address} ${p.city}`.toLowerCase().includes(query.toLowerCase());
    return textMatches && (city === "all" || p.city === city) && (rooms === "all" || p.rooms === Number(rooms))
      && (!areaMin || p.area >= Number(areaMin)) && (!areaMax || p.area <= Number(areaMax));
  }), [items, query, city, rooms, areaMin, areaMax]);

  async function addProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const area = Number(form.area), roomCount = Number(form.rooms);
    if (form.address.trim().length < 3 || form.city.trim().length < 2 || !Number.isFinite(area) || area <= 0 || !Number.isInteger(roomCount) || roomCount < 1) {
      setError("Проверьте адрес, город, площадь и число комнат."); return;
    }
    try {
      await apiJson(editingId === null ? "/properties" : `/properties/${editingId}`, {
        method: editingId === null ? "POST" : "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: form.address.trim(), city: form.city.trim(), area, rooms: roomCount, description: items.find((p) => p.id === editingId)?.description ?? "" }),
      });
      setOpened(false); setForm(blank); setError(""); await load();
    } catch (e) { setError(e instanceof Error ? e.message : "Ошибка сохранения"); }
  }

  async function deleteProperty() {
    if (deleteId === null) return;
    try { await apiJson(`/properties/${deleteId}`, { method: "DELETE" }); setDeleteId(null); await load(); }
    catch (e) { setLoadError(e instanceof Error ? e.message : "Ошибка удаления"); setDeleteId(null); }
  }
  return <>
    <Group justify="space-between" mb="md"><Title order={2}>Мои объекты</Title>{user?.role === "landlord" && <Button onClick={() => { setEditingId(null); setForm(blank); setOpened(true); }}>Добавить объект</Button>}</Group>
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="md">
      <TextInput label="Поиск" placeholder="Адрес или город" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
      <Select label="Город" data={[{ value: "all", label: "Все города" }, ...cities.map((x) => ({ value: x, label: x }))]} value={city} onChange={(v) => setCity(v ?? "all")} />
      <Select label="Комнаты" data={[{ value: "all", label: "Любое число" }, ...[1, 2, 3, 4].map((x) => ({ value: String(x), label: String(x) }))]} value={rooms} onChange={(v) => setRooms(v ?? "all")} />
      <Group grow><NumberInput label="Площадь от, м²" min={0} value={areaMin} onChange={(v) => setAreaMin(String(v))} /><NumberInput label="до, м²" min={0} value={areaMax} onChange={(v) => setAreaMax(String(v))} /></Group>
    </SimpleGrid>
    <DataState loading={loading} error={loadError} empty={filtered.length === 0} message="Объектов по выбранным фильтрам нет." />
    {filtered.length > 0 && <Table.ScrollContainer minWidth={600}><Table striped highlightOnHover>
      <Table.Thead><Table.Tr><Table.Th>Адрес</Table.Th><Table.Th>Город</Table.Th><Table.Th>Площадь, м²</Table.Th><Table.Th>Комнат</Table.Th><Table.Th /></Table.Tr></Table.Thead>
      <Table.Tbody>{filtered.map((p) => <Table.Tr key={p.id}>
        <Table.Td>{p.address}</Table.Td><Table.Td>{p.city}</Table.Td><Table.Td>{p.area}</Table.Td><Table.Td>{p.rooms}</Table.Td>
        <Table.Td><Button variant="light" size="compact-sm" onClick={() => { setEditingId(p.id); setForm({ address: p.address, city: p.city, area: String(p.area), rooms: String(p.rooms) }); setOpened(true); }}>Изменить</Button> <Button color="red" variant="light" size="compact-sm" onClick={() => setDeleteId(p.id)}>Удалить</Button></Table.Td>
      </Table.Tr>)}</Table.Tbody>
    </Table></Table.ScrollContainer>}
    <Modal opened={opened} onClose={() => { setOpened(false); setError(""); }} title={editingId === null ? "Новый объект" : "Изменить объект"}><form onSubmit={addProperty}><Stack>
      {error && <Text c="red" role="alert">{error}</Text>}
      <TextInput label="Адрес" minLength={3} required value={form.address} onChange={(e) => setForm({ ...form, address: e.currentTarget.value })} />
      <TextInput label="Город" minLength={2} required value={form.city} onChange={(e) => setForm({ ...form, city: e.currentTarget.value })} />
      <NumberInput label="Площадь, м²" min={0.1} required value={form.area} onChange={(v) => setForm({ ...form, area: String(v) })} />
      <NumberInput label="Комнат" min={1} allowDecimal={false} required value={form.rooms} onChange={(v) => setForm({ ...form, rooms: String(v) })} />
      <Button type="submit">Сохранить</Button>
    </Stack></form></Modal>
    <Modal opened={deleteId !== null} onClose={() => setDeleteId(null)} title="Удалить объект?"><Stack>
      <Text>Связанные договоры и их платежи, счета и документы тоже будут удалены.</Text>
      <Group justify="flex-end"><Button variant="default" onClick={() => setDeleteId(null)}>Отмена</Button><Button color="red" onClick={deleteProperty}>Удалить</Button></Group>
    </Stack></Modal>
  </>;
}


