import { useState, type FormEvent } from "react";
import { Anchor, Badge, Button, Card, Group, Modal, NumberInput, Select, SimpleGrid, Stack, Table, Tabs, Text, TextInput, Title } from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import DataState from "../components/DataState";
import { useDemoCollection } from "../data/demoStore";
import { bills as demoBills, documents as demoDocuments, leases as demoLeases, payments as demoPayments, properties as demoProperties, type Bill, type Doc, type Lease, type Payment, type Property } from "../data/demo";

type EntryKind = "payment" | "bill" | "document";
const blank = { date: "", amount: "", comment: "", kind: "", period: "", paid: "false", title: "", filename: "", author: "" };

export default function LeasePage() {
  const { id } = useParams();
  const [leases] = useDemoCollection<Lease>("rental.leases", demoLeases);
  const [properties] = useDemoCollection<Property>("rental.properties", demoProperties);
  const [payments, setPayments] = useDemoCollection<Payment>("rental.payments", demoPayments);
  const [bills, setBills] = useDemoCollection<Bill>("rental.bills", demoBills);
  const [documents, setDocuments] = useDemoCollection<Doc>("rental.documents", demoDocuments);
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
  const lease = leases.find((x) => x.id === Number(id));
  if (!lease) return <DataState empty message="Договор не найден." />;
  const currentLeaseId = lease.id;

  const property = properties.find((x) => x.id === lease.propertyId);
  const leasePayments = payments.filter((x) => x.leaseId === lease.id);
  const leaseBills = bills.filter((x) => x.leaseId === lease.id);
  const leaseDocs = documents.filter((x) => x.leaseId === lease.id);
  const shownPayments = leasePayments.filter((x) => (!paymentDate || x.date === paymentDate)
    && (!paymentMin || x.amount >= Number(paymentMin)) && (!paymentMax || x.amount <= Number(paymentMax))
    && x.comment.toLowerCase().includes(paymentComment.toLowerCase()));
  const shownBills = leaseBills.filter((x) => x.kind.toLowerCase().includes(billKind.toLowerCase())
    && (!billPeriod || x.period.startsWith(billPeriod))
    && (billStatus === "all" || (billStatus === "paid" ? x.paid : !x.paid)));
  const shownDocs = leaseDocs.filter((x) => x.title.toLowerCase().includes(docTitle.toLowerCase())
    && x.filename.toLowerCase().includes(docFile.toLowerCase()) && x.author.toLowerCase().includes(docAuthor.toLowerCase()));

  function saveEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (entry === "payment" && (!form.date || !Number.isFinite(amount) || amount <= 0)) return setFormError("Укажите дату и положительную сумму.");
    if (entry === "bill" && (form.kind.trim().length < 2 || !form.period || !Number.isFinite(amount) || amount <= 0)) return setFormError("Укажите услугу, дату и положительную сумму.");
    if (entry === "document" && (form.title.trim().length < 2 || !form.filename.trim() || form.author.trim().length < 2 || !form.date)) return setFormError("Заполните название, имя файла, автора и дату.");
    if (entry === "payment") setPayments((old) => editingId === null
      ? [...old, { id: Math.max(0, ...old.map((x) => x.id)) + 1, leaseId: currentLeaseId, date: form.date, amount, comment: form.comment.trim() }]
      : old.map((x) => x.id === editingId ? { ...x, date: form.date, amount, comment: form.comment.trim() } : x));
    if (entry === "bill") setBills((old) => editingId === null
      ? [...old, { id: Math.max(0, ...old.map((x) => x.id)) + 1, leaseId: currentLeaseId, kind: form.kind.trim(), period: form.period, amount, paid: form.paid === "true" }]
      : old.map((x) => x.id === editingId ? { ...x, kind: form.kind.trim(), period: form.period, amount, paid: form.paid === "true" } : x));
    if (entry === "document") setDocuments((old) => editingId === null
      ? [...old, { id: Math.max(0, ...old.map((x) => x.id)) + 1, leaseId: currentLeaseId, title: form.title.trim(), filename: form.filename.trim(), author: form.author.trim(), date: form.date }]
      : old.map((x) => x.id === editingId ? { ...x, title: form.title.trim(), filename: form.filename.trim(), author: form.author.trim(), date: form.date } : x));
    setEntry(null); setEditingId(null); setForm(blank); setFormError("");
  }

  function openEntry(kind: EntryKind) { setEditingId(null); setForm(blank); setFormError(""); setEntry(kind); }
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
  function deleteEntry() {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "payment") setPayments((old) => old.filter((x) => x.id !== deleteTarget.id));
    if (deleteTarget.kind === "bill") setBills((old) => old.filter((x) => x.id !== deleteTarget.id));
    if (deleteTarget.kind === "document") setDocuments((old) => old.filter((x) => x.id !== deleteTarget.id));
    setDeleteTarget(null);
  }
  const entryTitle = `${editingId === null ? "Новый" : "Редактировать"} ${entry === "payment" ? "платёж" : entry === "bill" ? "коммунальный счёт" : "документ"}`;

  return <>
    <Anchor component={Link} to="/leases">← Все договоры</Anchor>
    <Title order={2} my="md">{property?.address}, {property?.city}</Title>
    <SimpleGrid cols={{ base: 1, sm: 2 }} mb="lg">
      <Card withBorder><Text c="dimmed" size="sm">Арендатор</Text><Text>{lease.tenant}</Text></Card>
      <Card withBorder><Text c="dimmed" size="sm">Аренда и срок</Text><Text>{lease.rent.toLocaleString("ru-RU")} ₽/мес, {lease.start} — {lease.end}</Text></Card>
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
          <Table.Tbody>{shownDocs.map((x) => <Table.Tr key={x.id}><Table.Td>{x.title}</Table.Td><Table.Td>{x.filename}</Table.Td><Table.Td>{x.author}</Table.Td><Table.Td>{x.date}</Table.Td><Table.Td><Group gap="xs"><Button size="compact-sm" variant="light" onClick={() => editEntry("document", x.id)}>Изменить</Button><Button size="compact-sm" color="red" variant="light" onClick={() => setDeleteTarget({ kind: "document", id: x.id })}>Удалить</Button></Group></Table.Td></Table.Tr>)}</Table.Tbody>
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
        <TextInput label="Имя файла" placeholder="dogovor.pdf" required value={form.filename} onChange={(e) => setForm({ ...form, filename: e.currentTarget.value })} />
        <TextInput label="Автор" minLength={2} required value={form.author} onChange={(e) => setForm({ ...form, author: e.currentTarget.value })} />
        <TextInput label="Дата документа" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.currentTarget.value })} />
      </>}
      <Button type="submit">Сохранить</Button>
    </Stack></form></Modal>
    <Modal opened={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Удалить запись?"><Stack>
      <Text>Это действие удалит запись из демоданных браузера.</Text>
      <Group justify="flex-end"><Button variant="default" onClick={() => setDeleteTarget(null)}>Отмена</Button><Button color="red" onClick={deleteEntry}>Удалить</Button></Group>
    </Stack></Modal>
  </>;
}
