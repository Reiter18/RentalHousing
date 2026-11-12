export type Property = {
  id: number;
  address: string;
  city: string;
  area: number;
  rooms: number;
  description?: string;
};
export type Lease = {
  id: number;
  propertyId: number;
  tenant: string;
  rent: number;
  start: string;
  end: string;
};
export type Payment = {
  id: number;
  leaseId: number;
  date: string;
  amount: number;
  comment: string;
};
export type Bill = {
  id: number;
  leaseId: number;
  kind: string;
  period: string;
  amount: number;
  paid: boolean;
};
export type Doc = {
  id: number;
  leaseId: number;
  title: string;
  filename: string;
  author: string;
  date: string;
};

export const properties: Property[] = [
  {
    id: 1,
    address: "ул. Ленина, 10, кв. 5",
    city: "Москва",
    area: 45,
    rooms: 2,
  },
  {
    id: 2,
    address: "пр. Мира, 25, кв. 12",
    city: "Казань",
    area: 32,
    rooms: 1,
  },
  {
    id: 3,
    address: "ул. Садовая, 7",
    city: "Санкт-Петербург",
    area: 78,
    rooms: 3,
  },
];

export const leases: Lease[] = [
  {
    id: 1,
    propertyId: 1,
    tenant: "Иван Петров",
    rent: 35000,
    start: "2026-01-01",
    end: "2026-12-31",
  },
  {
    id: 2,
    propertyId: 2,
    tenant: "Анна Смирнова",
    rent: 22000,
    start: "2026-03-01",
    end: "2027-02-28",
  },
];

export const payments: Payment[] = [
  {
    id: 1,
    leaseId: 1,
    date: "2026-09-01",
    amount: 35000,
    comment: "Аренда за сентябрь",
  },
  {
    id: 2,
    leaseId: 1,
    date: "2026-10-01",
    amount: 35000,
    comment: "Аренда за октябрь",
  },
  {
    id: 3,
    leaseId: 2,
    date: "2026-10-03",
    amount: 22000,
    comment: "Аренда за октябрь",
  },
];

export const bills: Bill[] = [
  {
    id: 1,
    leaseId: 1,
    kind: "Электричество",
    period: "2026-09",
    amount: 1200,
    paid: true,
  },
  {
    id: 2,
    leaseId: 1,
    kind: "Вода",
    period: "2026-10",
    amount: 640,
    paid: false,
  },
  {
    id: 3,
    leaseId: 2,
    kind: "Отопление",
    period: "2026-10",
    amount: 2100,
    paid: false,
  },
];

export const documents: Doc[] = [
  {
    id: 1,
    leaseId: 1,
    title: "Договор аренды",
    filename: "dogovor.pdf",
    author: "Арендодатель",
    date: "2026-01-01",
  },
  {
    id: 2,
    leaseId: 1,
    title: "Акт приёма-передачи",
    filename: "akt.pdf",
    author: "Арендатор",
    date: "2026-01-02",
  },
  {
    id: 3,
    leaseId: 2,
    title: "Договор аренды",
    filename: "dogovor.pdf",
    author: "Арендодатель",
    date: "2026-03-01",
  },
];
