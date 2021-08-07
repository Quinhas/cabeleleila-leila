export type ServiceProps = {
  name: string;
  desc: string;
  price: number;
  priceFormatted: string;
  id: string;
};

interface SelectedServiceProps extends ServiceProps {
  hour?: string;
}

export type AgendamentoProps = {
  clienteId: string;
  name: string;
  date: string;
  hour: string;
  id: string;
  phone: string;
  services: SelectedServiceProps[];
  status: string;
};