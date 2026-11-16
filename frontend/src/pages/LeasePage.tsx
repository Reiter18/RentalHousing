import { useEffect, useState, type FormEvent } from "react";
import { Anchor, Badge, Button, Card, FileInput, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Table, Tabs, Text, TextInput, Title } from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import DataState from "../components/DataState";
import { apiJson, apiRequest } from '../api';
import type { Bill, Doc, Payment, Property } from "../data/demo";
type ApiLease = { id: number; property: Property; tenant_name: string; rent: number; start_date: string; end_date: string };
type ApiPayment = { id: number; lease_id: number; amount: number; paid_date: string; comment: string };
type ApiBill = { id: number; lease_id: number; kind: string; amount: number; period: string; is_paid: boolean };
type ApiDoc = { id: number; lease_id: number; title: string; filename: string; author: string; created_at: string };

type EntryKind = "payment" | "bill" | "document";
const blank = { date: "", amount: "", comment: "", kind: "", period: "", paid: "false", title: "", filename: "", author: "" };

export default function LeasePage() {
  const { id } = useParams();
  const [lease, setLease] = useState<ApiLease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  async function load() {
    try {
      setLoadError("");
      const [l, p, b, d] = await Promise.all([
        apiJson<ApiLease>(`/leases/${id}`), apiJson<ApiPayment[]>(`/leases/${id}/payments`),
        apiJson<ApiBill[]>(`/leases/${id}/bills`), apiJson<ApiDoc[]>(`/leases/${id}/documents`),
      ]);
      setLease(l);
      setPayments(p.map((x) => ({ id: x.id, leaseId: x.lease_id, date: x.paid_date, amount: x.amount, comment: x.comment })));
      setBills(b.map((x) => ({ id: x.id, leaseId: x.lease_id, kind: x.kind, period: x.period, amount: x.amount, paid: x.is_paid })));
      setDocuments(d.map((x) => ({ id: x.id, leaseId: x.lease_id, title: x.title, filename: x.filename, author: x.author, date: x.created_at.slice(0, 10) })));
    } catch (e) { setLoadError(e instanceof Error ? e.message : "Ошибка загрузки"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [id]);
  const [entry, setEntry] = useState<EntryKind | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ kind: EntryKind; id: number } | null>(null);
  const [form, setForm] = useState(blank);
  const [formError, setFormError] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMin, setPaymentMin] = useState("");
  const [paymentMax, setPaymentMax] = useState("");
  const [paymentComment, setPaymentComment] = useState("");
  const [billKind, setBillKind] = useState("");
  const [billPeriod, setBillPeriod] = useState("");
  const [billStatus, setBillStatus] = useState("all");
  const [docTitle, setDocTitle] = useState("");
  const [docFile, setDocFile] = useState("");
  const [docAuthor, setDocAuthor] = useState("");
  if (loading || loadError || !lease) return <DataState loading={loading} error={loadError} empty={!lease} message="Договор не найден." />;
  const property = lease.property;
  const leasePayments = payments;
  const leaseBills = bills;
  const leaseDocs = documents;
  const shownPayments = leasePayments.filter((x) => (!paymentDate || x.date === paymentDate)
    && (!paymentMin || x.amount >= Number(paymentMin)) && (!paymentMax || x.amount <= Number(paymentMax))
    && x.comment.toLowerCase().includes(paymentComment.toLowerCase()));
  const shownBills = leaseBills.filter((x) => x.kind.toLowerCase().includes(billKind.toLowerCase())
    && (!billPeriod || x.period.startsWith(billPeriod))
    && (billStatus === "all" || (billStatus === "paid" ? x.paid : !x.paid)));
  const shownDocs = leaseDocs.filter((x) => x.title.toLowerCase().includes(docTitle.toLowerCase())
    && x.filename.toLowerCase().includes(docFile.toLowerCase()) && x.author.toLowerCase().includes(docAuthor.toLowerCase()));

  async function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (entry === "payment" && (!form.date || !Number.isFinite(amount) || amount <= 0)) return setFormError("Укажите дату и положительную сумму.");
    if (entry === "bill" && (form.kind.trim().length < 2 || !form.period || !Number.isFinite(amount) || amount <= 0)) return setFormError("Укажите услугу, дату и положительную сумму.");
    if (entry === "document" && (form.title.trim().length < 2 || form.author.trim().length < 2 || (editingId === null && !file))) return setFormError("Укажите название, автора и выберите файл.");
    try {
      if (entry === "payment" || entry === "bill") {
        const path = editingId === null ? `/leases/${id}/${entry === "payment" ? "payments" : "bills"}` : `/${entry === "payment" ? "payments" : "bills"}/${editingId}`;
        const body = entry === "payment" ? { paid_date: form.date, amount, comment: form.comment } : { kind: form.kind, period: form.period, amount, is_paid: form.paid === "true" };
        await apiJson(path, { method: editingId === null ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else if (entry === "document") {
        if (editingId === null && file) {
          const data = new FormData(); data.append("title", form.title); data.append("author", form.author); data.append("file", file);
          await apiJson(`/leases/${id}/documents`, { method: "POST", body: data });
        } else if (editingId !== null) {
          await apiJson(`/documents/${editingId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.title, author: form.author }) });
        }
      }
      setEntry(null); setEditingId(null); setForm(blank); setFile(null); setFormError(""); await load();
    } catch (e) { setFormError(e instanceof Error ? e.message : "Ошибка сохранения"); }
  }
  function openEntry(kind: EntryKind) { setEditingId(null); setForm(blank); setFile(null); setFormError(""); setEntry(kind); }
  function editEntry(kind: EntryKind, itemId: number) {
    setEditingId(itemId); setFormError(""); setEntry(kind);
    if (kind === "payment") {
      const x = leasePayments.find((p) => p.id === itemId)!;
      setForm({ ...blank, date: x.date, amount: String(x.amount), comment: x.comment });
    } else if (kind === "bill") {
      const x = leaseBills.find((b) => b.id === itemId)!;
      setForm({ ...blank, kind: x.kind, period: x.period.length === 7 ? `${x.period}-01` : x.period, amount: String(x.amount), paid: String(x.paid) });
    } else {
      const x = leaseDocs.find((d) => d.id === itemId)!;
      setForm({ ...blank, title: x.title, filename: x.filename, author: x.author, date: x.date });
    }
  }
  async function deleteEntry() {
    if (!deleteTarget) return;
    const path = deleteTarget.kind === "payment" ? "payments" : deleteTarget.kind === "bill" ? "bills" : "documents";
    try { await apiJson(`/${path}/${deleteTarget.id}`, { method: "DELETE" }); setDeleteTarget(null); await load(); }
    catch (e) { setLoadError(e instanceof Error ? e.message : "Ошибка удаления"); setDeleteTarget(null); }
  }
  async function downloadDoc(doc: Doc) {
    try {
      const response = await apiRequest(`/documents/${doc.id}/download`);
      if (!response.ok) throw new Error("Не удалось скачать документ");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = doc.filename; link.click(); URL.revokeObjectURL(url);
    } catch (e) { setLoadError(e instanceof Error ? e.message : "Ошибка скачивания"); }
  }  const entryTitle = `${editingId === null ? "Новый" : "Редактировать"} ${entry === "payment" ? "платёж" : entry === "bill" ? "коммунальный счёт" : "документ"}`;

  return <>
    <Anchor component={Link} to="/leases">← Все договоры</Anchor>
    <Title order={2} my="md">{property?.address}, {property?.city}</Title>
    <SimpleGrid cols={{ base: 1, sm: 2 }} mb="lg">
      <Card withBorder><Text c="dimmed" size="sm">Арендатор</Text><Text>{lease.tenant_name}</Text></Card>
      <Card withBorder><Text c="dimmed" size="sm">Аренда и срок</Text><Text>{lease.rent.toLocaleString("ru-RU")} ₽/мес, {lease.start_date} — {lease.end_date}</Text></Card>
    </SimpleGrid>
    <Tabs defaultValue="payments">
      <Tabs.List><Tabs.Tab value="payments">Платежи</Tabs.Tab><Tabs.Tab value="bills">Коммунальные счета</Tabs.Tab><Tabs.Tab value="documents">Документы</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="payments" pt="md">
        <Button mb="md" onClick={() => openEntry("payment")}>Добавить платёж</Button>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="md">
          <TextInput label="Дата платежа" type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.currentTarget.value)} />
          <NumberInput label="Сумма от, ₽" min={0} value={paymentMin} onChange={(v) => setPaymentMin(String(v))} />
          <NumberInput label="Сумма до, ₽" min={0} value={paymentMax} onChange={(v) => setPaymentMax(String(v))} />
          <TextInput label="Комментарий содержит" value={paymentComment} onChange={(e) => setPaymentComment(e.currentTarget.value)} />
        </SimpleGrid>
        <DataState empty={shownPayments.length === 0} message="Платежей по этим фильтрам нет." />
        {shownPayments.length > 0 && <Table.ScrollContainer minWidth={600}><Table striped>
          <Table.Thead><Table.Tr><Table.Th>Дата</Table.Th><Table.Th>Сумма, ₽</Table.Th><Table.Th>Комментарий</Table.Th><Table.Th>Действия</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>{shownPayments.map((x) => <Table.Tr key={x.id}><Table.Td>{x.date}</Table.Td><Table.Td>{x.amount}</Table.Td><Table.Td>{x.comment}</Table.Td><Table.Td><Group gap="xs"><Button size="compact-sm" variant="light" onClick={() => editEntry("payment", x.id)}>Изменить</Button><Button size="compact-sm" color="red" variant="light" onClick={() => setDeleteTarget({ kind: "payment", id: x.id })}>Удалить</Button></Group></Table.Td></Table.Tr>)}</Table.Tbody>
        </Table></Table.ScrollContainer>}
      </Tabs.Panel>
      <Tabs.Panel value="bills" pt="md">
        <Button mb="md" onClick={() => openEntry("bill")}>Добавить счёт</Button>
        <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
          <TextInput label="Услуга" value={billKind} onChange={(e) => setBillKind(e.currentTarget.value)} />
          <TextInput label="Период" type="month" value={billPeriod} onChange={(e) => setBillPeriod(e.currentTarget.value)} />
          <Select label="Статус оплаты" data={[{ value: "all", label: "Все счета" }, { value: "paid", label: "Оплаченные" }, { value: "unpaid", label: "Неоплаченные" }]} value={billStatus} onChange={(v) => setBillStatus(v ?? "all")} />
        </SimpleGrid>
        <DataState empty={shownBills.length === 0} message="Счетов по этим фильтрам нет." />
        {shownBills.length > 0 && <Table.ScrollContainer minWidth={700}><Table striped>
          <Table.Thead><Table.Tr><Table.Th>Услуга</Table.Th><Table.Th>Дата</Table.Th><Table.Th>Сумма, ₽</Table.Th><Table.Th>Статус</Table.Th><Table.Th>Действия</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>{shownBills.map((x) => <Table.Tr key={x.id}><Table.Td>{x.kind}</Table.Td><Table.Td>{x.period}</Table.Td><Table.Td>{x.amount}</Table.Td><Table.Td><Badge color={x.paid ? "green" : "orange"}>{x.paid ? "Оплачен" : "Не оплачен"}</Badge></Table.Td><Table.Td><Group gap="xs"><Button size="compact-sm" variant="light" onClick={() => editEntry("bill", x.id)}>Изменить</Button><Button size="compact-sm" color="red" variant="light" onClick={() => setDeleteTarget({ kind: "bill", id: x.id })}>Удалить</Button></Group></Table.Td></Table.Tr>)}</Table.Tbody>
        </Table></Table.ScrollContainer>}
      </Tabs.Panel>
      <Tabs.Panel value="documents" pt="md">
        <Button mb="md" onClick={() => openEntry("document")}>Добавить документ</Button>
        <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md">
          <TextInput label="Название" value={docTitle} onChange={(e) => setDocTitle(e.currentTarget.value)} />
          <TextInput label="Имя файла" value={docFile} onChange={(e) => setDocFile(e.currentTarget.value)} />
          <TextInput label="Автор" value={docAuthor} onChange={(e) => setDocAuthor(e.currentTarget.value)} />
        </SimpleGrid>
        <DataState empty={shownDocs.length === 0} message="Документов по этим фильтрам нет." />
        {shownDocs.length > 0 && <Table.ScrollContainer minWidth={750}><Table striped>
          <Table.Thead><Table.Tr><Table.Th>Название</Table.Th><Table.Th>Файл</Table.Th><Table.Th>Загрузил</Table.Th><Table.Th>Дата</Table.Th><Table.Th>Действия</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>{shownDocs.map((x) => <Table.Tr key={x.id}><Table.Td>{x.title}</Table.Td><Table.Td><Button variant="subtle" size="compact-sm" onClick={() => downloadDoc(x)}>{x.filename}</Button></Table.Td><Table.Td>{x.author}</Table.Td><Table.Td>{x.date}</Table.Td><Table.Td><Group gap="xs"><Button size="compact-sm" variant="light" onClick={() => editEntry("document", x.id)}>Изменить</Button><Button size="compact-sm" color="red" variant="light" onClick={() => setDeleteTarget({ kind: "document", id: x.id })}>Удалить</Button></Group></Table.Td></Table.Tr>)}</Table.Tbody>
        </Table></Table.ScrollContainer>}
      </Tabs.Panel>
    </Tabs>
    <Modal opened={entry !== null} onClose={() => { setEntry(null); setEditingId(null); setFormError(""); }} title={entryTitle}><form onSubmit={saveEntry}><Stack>
      {formError && <Text c="red" role="alert">{formError}</Text>}
      {entry === "payment" && <>
        <TextInput label="Дата платежа" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.currentTarget.value })} />
        <NumberInput label="Сумма, ₽" min={1} required value={form.amount} onChange={(v) => setForm({ ...form, amount: String(v) })} />
        <TextInput label="Комментарий" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.currentTarget.value })} />
      </>}
      {entry === "bill" && <>
        <TextInput label="Услуга" minLength={2} required value={form.kind} onChange={(e) => setForm({ ...form, kind: e.currentTarget.value })} />
        <TextInput label="Дата счёта" type="date" required value={form.period} onChange={(e) => setForm({ ...form, period: e.currentTarget.value })} />
        <NumberInput label="Сумма, ₽" min={1} required value={form.amount} onChange={(v) => setForm({ ...form, amount: String(v) })} />
        <Select label="Статус оплаты" data={[{ value: "false", label: "Не оплачен" }, { value: "true", label: "Оплачен" }]} value={form.paid} onChange={(v) => setForm({ ...form, paid: v ?? "false" })} />
      </>}
      {entry === "document" && <>
        <TextInput label="Название" minLength={2} required value={form.title} onChange={(e) => setForm({ ...form, title: e.currentTarget.value })} />
        {editingId === null && <FileInput label="Файл" required value={file} onChange={setFile} />}
        <TextInput label="Автор" minLength={2} required value={form.author} onChange={(e) => setForm({ ...form, author: e.currentTarget.value })} />
        
      </>}
      <Button type="submit">Сохранить</Button>
    </Stack></form></Modal>
    <Modal opened={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Удалить запись?"><Stack>
      <Text>Запись будет удалена.</Text>
      <Group justify="flex-end"><Button variant="default" onClick={() => setDeleteTarget(null)}>Отмена</Button><Button color="red" onClick={deleteEntry}>Удалить</Button></Group>
    </Stack></Modal>
  </>;
}


