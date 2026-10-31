import { Button, Group, Table, Title } from "@mantine/core";
import { properties } from "../data/demo";

export default function PropertiesPage() {
  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Мои объекты</Title>
        <Button>Добавить объект</Button>
      </Group>

      {/* ScrollContainer даёт горизонтальную прокрутку таблицы на узких экранах */}
      <Table.ScrollContainer minWidth={500}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Адрес</Table.Th>
              <Table.Th>Город</Table.Th>
              <Table.Th>Площадь, м²</Table.Th>
              <Table.Th>Комнат</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {properties.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.address}</Table.Td>
                <Table.Td>{p.city}</Table.Td>
                <Table.Td>{p.area}</Table.Td>
                <Table.Td>{p.rooms}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
