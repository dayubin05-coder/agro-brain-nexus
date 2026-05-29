import { z } from "zod";

// ---------- shared helpers ----------
const nonEmpty = (label: string, max = 200) =>
  z.string().trim().min(1, { message: `${label} é obrigatório` }).max(max, {
    message: `${label} deve ter no máximo ${max} caracteres`,
  });

const optionalText = (max = 1000) =>
  z.string().trim().max(max, { message: `Texto excede ${max} caracteres` }).optional().or(z.literal(""));

const nonNegativeNumber = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label} deve ser numérico` }).nonnegative({
    message: `${label} não pode ser negativo`,
  });

const positiveNumber = (label: string) =>
  z.coerce.number({ invalid_type_error: `${label} deve ser numérico` }).positive({
    message: `${label} deve ser maior que zero`,
  });

const uuid = (label: string) =>
  z.string().uuid({ message: `${label} inválido` });

const dateString = (label: string) =>
  z.string().regex(/^\d{4}-\d{2}-\d{2}/, { message: `${label} inválida` });

// ---------- Auth ----------
export const loginSchema = z.object({
  email: z.string().trim().email({ message: "E-mail inválido" }).max(255),
  password: z.string().min(6, { message: "Senha deve ter ao menos 6 caracteres" }).max(72),
});

export const registerSchema = z.object({
  nome: nonEmpty("Nome", 100),
  email: z.string().trim().email({ message: "E-mail inválido" }).max(255),
  password: z
    .string()
    .min(8, { message: "Senha deve ter ao menos 8 caracteres" })
    .max(72)
    .regex(/[A-Za-z]/, { message: "Senha deve conter letras" })
    .regex(/[0-9]/, { message: "Senha deve conter números" }),
  telefone: z.string().trim().max(20).optional().or(z.literal("")),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().email({ message: "E-mail inválido" }).max(255),
});

// ---------- Profile ----------
export const profileSchema = z.object({
  nome: nonEmpty("Nome", 100),
  email: z.string().trim().email({ message: "E-mail inválido" }).max(255).optional().or(z.literal("")),
  telefone: z.string().trim().max(20).optional().or(z.literal("")),
  avatar_url: z.string().url().max(500).optional().or(z.literal("")),
});

// ---------- Fazenda ----------
export const fazendaSchema = z.object({
  nome: nonEmpty("Nome da fazenda", 120),
  cidade: z.string().trim().max(100).optional().or(z.literal("")),
  estado: z.string().trim().max(50).optional().or(z.literal("")),
  area_total: positiveNumber("Área total"),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

// ---------- Talhão ----------
export const talhaoSchema = z.object({
  fazenda_id: uuid("Fazenda"),
  nome: nonEmpty("Nome do talhão", 120),
  area: positiveNumber("Área"),
  observacoes: optionalText(),
  coordenadas: z.any().optional().nullable(),
});

// ---------- Plantio ----------
export const plantioSchema = z.object({
  talhao_id: uuid("Talhão"),
  cultura_id: uuid("Cultura"),
  variedade: z.string().trim().max(120).optional().or(z.literal("")),
  data_plantio: dateString("Data de plantio"),
  area_plantada: positiveNumber("Área plantada"),
  previsao_colheita: dateString("Previsão de colheita").optional().or(z.literal("")),
  densidade_plantio: z.string().trim().max(100).optional().or(z.literal("")),
  fertilizacao: optionalText(),
  defensivos: optionalText(),
  observacoes: optionalText(),
  status: z.string().trim().max(30).optional(),
  progresso_percentual: z.coerce.number().int().min(0).max(100).optional(),
});

// ---------- Estoque ----------
export const estoqueSchema = z.object({
  fazenda_id: uuid("Fazenda"),
  nome: nonEmpty("Nome do item", 120),
  categoria: z.string().trim().max(60).optional().or(z.literal("")),
  quantidade: nonNegativeNumber("Quantidade"),
  unidade: nonEmpty("Unidade", 20),
  quantidade_minima: nonNegativeNumber("Quantidade mínima").optional(),
  valor_unitario: nonNegativeNumber("Valor unitário").optional(),
  data_entrada: dateString("Data de entrada").optional().or(z.literal("")),
  observacoes: optionalText(),
});

// ---------- Financeiro ----------
export const transacaoSchema = z.object({
  fazenda_id: uuid("Fazenda"),
  tipo: z.enum(["receita", "despesa"], { errorMap: () => ({ message: "Tipo inválido" }) }),
  descricao: nonEmpty("Descrição", 200),
  categoria: z.string().trim().max(60).optional().or(z.literal("")),
  valor: positiveNumber("Valor"),
  data: dateString("Data"),
  observacoes: optionalText(),
});

// ---------- Máquinas ----------
export const maquinaSchema = z.object({
  fazenda_id: uuid("Fazenda"),
  nome: nonEmpty("Nome", 120),
  tipo: z.string().trim().max(60).optional().or(z.literal("")),
  modelo: z.string().trim().max(120).optional().or(z.literal("")),
  ano: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  horas_uso: z.coerce.number().int().min(0).optional(),
  combustivel_percentual: z.coerce.number().int().min(0).max(100).optional().nullable(),
  status: z.string().trim().max(30).optional(),
  proxima_manutencao: z.string().trim().max(120).optional().or(z.literal("")),
  observacoes: optionalText(),
});

// ---------- Funcionários ----------
export const funcionarioSchema = z.object({
  fazenda_id: uuid("Fazenda"),
  nome: nonEmpty("Nome", 120),
  cargo: z.string().trim().max(80).optional().or(z.literal("")),
  setor: z.string().trim().max(80).optional().or(z.literal("")),
  telefone: z.string().trim().max(20).optional().or(z.literal("")),
  data_admissao: dateString("Data de admissão").optional().or(z.literal("")),
  produtividade_percentual: z.coerce.number().int().min(0).max(100).optional().nullable(),
  status: z.string().trim().max(30).optional(),
  observacoes: optionalText(),
});

// ---------- Pragas ----------
export const pragaSchema = z.object({
  fazenda_id: uuid("Fazenda"),
  talhao_id: uuid("Talhão").optional().nullable(),
  nome: nonEmpty("Nome", 120),
  tipo: z.string().trim().max(40).default("praga"),
  severidade: z.enum(["baixa", "media", "alta", "critica"]).default("media"),
  cultura: z.string().trim().max(80).optional().or(z.literal("")),
  area_afetada: nonNegativeNumber("Área afetada").optional().nullable(),
  status: z.string().trim().max(30).default("ativa"),
  data_deteccao: dateString("Data de detecção"),
  recomendacao: optionalText(),
  observacoes: optionalText(),
});

// ---------- Sustentabilidade ----------
export const sustentabilidadeSchema = z.object({
  fazenda_id: uuid("Fazenda"),
  data: dateString("Data"),
  categoria: nonEmpty("Categoria", 60),
  indicador: nonEmpty("Indicador", 120),
  valor: z.coerce.number(),
  unidade: nonEmpty("Unidade", 20),
  meta: z.coerce.number().optional().nullable(),
  observacoes: optionalText(),
});

// ---------- Marketplace ----------
export const anuncioSchema = z.object({
  tipo: nonEmpty("Tipo", 30),
  titulo: nonEmpty("Título", 120),
  descricao: optionalText(2000),
  preco: nonEmpty("Preço", 50),
  unidade: z.string().trim().max(20).optional().or(z.literal("")),
  localizacao: z.string().trim().max(120).optional().or(z.literal("")),
  categoria: nonEmpty("Categoria", 60),
  imagem_url: z.string().url().max(500).optional().or(z.literal("")),
});

export type FazendaInput = z.infer<typeof fazendaSchema>;
export type TalhaoInput = z.infer<typeof talhaoSchema>;
export type PlantioInput = z.infer<typeof plantioSchema>;
export type EstoqueInput = z.infer<typeof estoqueSchema>;
export type TransacaoInput = z.infer<typeof transacaoSchema>;
export type MaquinaInput = z.infer<typeof maquinaSchema>;
export type FuncionarioInput = z.infer<typeof funcionarioSchema>;
export type PragaInput = z.infer<typeof pragaSchema>;
export type SustentabilidadeInput = z.infer<typeof sustentabilidadeSchema>;
export type AnuncioInput = z.infer<typeof anuncioSchema>;
