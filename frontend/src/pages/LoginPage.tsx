import { useState, type FormEvent } from "react";
import { Alert, Button, Card, Container, PasswordInput, Select, Stack, Tabs, TextInput, Title } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string | null>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("landlord");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      if (tab === "register") await register({ full_name: fullName, email, password, role: role as "landlord" | "tenant" });
      else await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : "Не удалось войти"); }
    finally { setLoading(false); }
  }

  return <Container size={440} py={60}>
    <Title ta="center" mb="md">Аренда жилья</Title>
    <Card withBorder p="lg"><Tabs value={tab} onChange={setTab}>
      <Tabs.List grow><Tabs.Tab value="login">Вход</Tabs.Tab><Tabs.Tab value="register">Регистрация</Tabs.Tab></Tabs.List>
      <Tabs.Panel value="login" pt="md"><form onSubmit={submit}><Stack>
        {error && <Alert color="red">{error}</Alert>}
        <TextInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <PasswordInput label="Пароль" required value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
        <Button type="submit" loading={loading}>Войти</Button>
      </Stack></form></Tabs.Panel>
      <Tabs.Panel value="register" pt="md"><form onSubmit={submit}><Stack>
        {error && <Alert color="red">{error}</Alert>}
        <TextInput label="Имя" minLength={2} required value={fullName} onChange={(e) => setFullName(e.currentTarget.value)} />
        <TextInput label="Email" type="email" required value={email} onChange={(e) => setEmail(e.currentTarget.value)} />
        <Select label="Роль" data={[{ value: "landlord", label: "Арендодатель" }, { value: "tenant", label: "Арендатор" }]} value={role} onChange={(v) => setRole(v ?? "landlord")} />
        <PasswordInput label="Пароль (минимум 8 символов)" minLength={8} required value={password} onChange={(e) => setPassword(e.currentTarget.value)} />
        <Button type="submit" loading={loading}>Создать аккаунт</Button>
      </Stack></form></Tabs.Panel>
    </Tabs></Card>
  </Container>;
}
