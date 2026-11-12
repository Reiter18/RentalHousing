import { Alert, Center, Loader, Text } from "@mantine/core";

type Props = { loading?: boolean; error?: string | null; empty: boolean; message: string };

export default function DataState({ loading = false, error = null, empty, message }: Props) {
  if (loading) return <Center py="xl"><Loader size="sm" /></Center>;
  if (error) return <Alert color="red" title="Не удалось загрузить данные">{error}</Alert>;
  if (empty) return <Text c="dimmed" ta="center" py="xl">{message}</Text>;
  return null;
}
