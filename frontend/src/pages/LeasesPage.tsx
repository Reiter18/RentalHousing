import { Anchor, Button, Group, Table, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { leases, properties } from "../data/demo";

export default function LeasesPage() {
  return (
    <>
      <Group justify="space-between" mb="md">
        <Title order={2}>Договоры аренды</Title>
        <Button>Новый договор</Button>
      </Group>

      <Table.ScrollContainer minWidth={600}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Объект</Table.Th>
              <Table.Th>Арендатор</Table.Th>
              <Table.Th>Аренда, ₽/мес</Table.Th>
              <Table.Th>Срок</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {leases.map((l) => {
              const property = properties.find((p) => p.id === l.propertyId);
              return (
                <Table.Tr key={l.id}>
                  <Table.Td>{property?.address}</Table.Td>
                  <Table.Td>{l.tenant}</Table.Td>
                  <Table.Td>{l.rent}</Table.Td>
                  <Table.Td>
                    {l.start} — {l.end}
                  </Table.Td>
                  <Table.Td>
                    <Anchor component={Link} to={`/leases/${l.id}`}>
                      Открыть
                    </Anchor>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
}
