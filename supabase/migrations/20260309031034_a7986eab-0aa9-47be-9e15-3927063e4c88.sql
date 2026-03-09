
CREATE TABLE public.pragas_ocorrencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fazenda_id UUID NOT NULL REFERENCES public.fazendas(id) ON DELETE CASCADE,
  talhao_id UUID REFERENCES public.talhoes(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'praga',
  severidade TEXT NOT NULL DEFAULT 'media',
  cultura TEXT,
  area_afetada NUMERIC,
  recomendacao TEXT,
  status TEXT NOT NULL DEFAULT 'ativa',
  data_deteccao DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pragas_ocorrencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view pest occurrences of their farms"
ON public.pragas_ocorrencias FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM fazendas WHERE fazendas.id = pragas_ocorrencias.fazenda_id AND fazendas.user_id = auth.uid()));

CREATE POLICY "Users can insert pest occurrences in their farms"
ON public.pragas_ocorrencias FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM fazendas WHERE fazendas.id = pragas_ocorrencias.fazenda_id AND fazendas.user_id = auth.uid()));

CREATE POLICY "Users can update pest occurrences in their farms"
ON public.pragas_ocorrencias FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM fazendas WHERE fazendas.id = pragas_ocorrencias.fazenda_id AND fazendas.user_id = auth.uid()));

CREATE POLICY "Users can delete pest occurrences from their farms"
ON public.pragas_ocorrencias FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM fazendas WHERE fazendas.id = pragas_ocorrencias.fazenda_id AND fazendas.user_id = auth.uid()));
