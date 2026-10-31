import {
  Anchor,
  Badge,
  Button,
  Card,
  SimpleGrid,
  Table,
  Tabs,
  Text,
  Title,
} from "@mantine/core";
import { Link, useParams } from "react-router-dom";
import { bills, documents, leases, payments, properties } from "../data/demo";

export default function LeasePage() {
  const { id } = useParams();
  const lease = leases.find((l) => l.id === Number(id));

  if (!lease) return <Text>Договор не найден</Text>;

  const property = properties.find((p) => p.id === lease.propertyId);
  const leasePayments = payments.filter((p) => p.leaseId === lease.id);
  const leaseBills = bills.filter((b) => b.leaseId === lease.id);
  const leaseDocs = documents.filter((d) => d.leaseId === lease.id);

  return (
    <>
      <Anchor component={Link} to="/leases">
        ← Все договоры
      </Anchor>
      <Title order={2} my="md">
        {property?.address}, {property?.city}
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2 }} mb="lg">
        <Card withBorder>
          <Text c="dimmed" size="sm">
            Арендатор
          </Text>
          <Text>{lease.tenant}</Text>
        </Card>
        <Card withBorder>
          <Text c="dimmed" size="sm">
            Аренда и срок
          </Text>
          <Text>
            {lease.rent} ₽/мес, {lease.start} — {lease.end}
          </Text>
        </Card>
      </SimpleGrid>

      <Tabs defaultValue="payments">
        <Tabs.List>
          <Tabs.Tab value="payments">Платежи</Tabs.Tab>
          <Tabs.Tab value="bills">Коммунальные счета</Tabs.Tab>
          <Tabs.Tab value="documents">Документы</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="payments" pt="md">
          <Button mb="md">Добавить платёж</Button>
          <Table.ScrollContainer minWidth={400}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Дата</Table.Th>
                  <Table.Th>Сумма, ₽</Table.Th>
                  <Table.Th>Комментарий</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {leasePayments.map((p) => (
                  <Table.Tr key={p.id}>
                    <Table.Td>{p.date}</Table.Td>
                    <Table.Td>{p.amount}</Table.Td>
                    <Table.Td>{p.comment}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>

        <Tabs.Panel value="bills" pt="md">
          <Button mb="md">Добавить счёт</Button>
          <Table.ScrollContainer minWidth={400}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Услуга</Table.Th>
                  <Table.Th>Период</Table.Th>
                  <Table.Th>Сумма, ₽</Table.Th>
                  <Table.Th>Статус</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {leaseBills.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>{b.kind}</Table.Td>
                    <Table.Td>{b.period}</Table.Td>
                    <Table.Td>{b.amount}</Table.Td>
                    <Table.Td>
                      <Badge color={b.paid ? "green" : "orange"}>
                        {b.paid ? "Оплачен" : "Не оплачен"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>

        <Tabs.Panel value="documents" pt="md">
          <Button mb="md">Загрузить документ</Button>
          <Table.ScrollContainer minWidth={500}>
            <Table striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Название</Table.Th>
                  <Table.Th>Файл</Table.Th>
                  <Table.Th>Загрузил</Table.Th>
                  <Table.Th>Дата</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {leaseDocs.map((d) => (
                  <Table.Tr key={d.id}>
                    <Table.Td>{d.title}</Table.Td>
                    <Table.Td>{d.filename}</Table.Td>
                    <Table.Td>{d.author}</Table.Td>
                    <Table.Td>{d.date}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Tabs.Panel>
      </Tabs>
    </>
  );
}
