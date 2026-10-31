import {
  Button,
  Card,
  Container,
  PasswordInput,
  Select,
  Stack,
  Tabs,
  TextInput,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const enter = () => navigate("/");

  return (
    <Container size={420} py={60}>
      <Title ta="center" mb="md">
        Аренда жилья
      </Title>
      <Card withBorder p="lg">
        <Tabs defaultValue="login">
          <Tabs.List grow>
            <Tabs.Tab value="login">Вход</Tabs.Tab>
            <Tabs.Tab value="register">Регистрация</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="login" pt="md">
            <Stack>
              <TextInput label="Email" placeholder="you@example.com" />
              <PasswordInput label="Пароль" />
              <Button onClick={enter}>Войти</Button>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="register" pt="md">
            <Stack>
              <TextInput label="Имя" />
              <TextInput label="Email" placeholder="you@example.com" />
              <Select
                label="Я"
                data={["Арендатор", "Арендодатель"]}
                defaultValue="Арендатор"
                allowDeselect={false}
              />
              <PasswordInput label="Пароль" />
              <Button onClick={enter}>Зарегистрироваться</Button>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Card>
    </Container>
  );
}
