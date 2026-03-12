
CREATE TABLE public.sustentabilidade_registros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fazenda_id UUID NOT NULL REFERENCES public.fazendas(id) ON DELETE CASCADE,
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  categoria TEXT NOT NULL DEFAULT 'ambiental',
  indicador TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  unidade TEXT NOT NULL DEFAULT 'un',
  meta NUMERIC,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sustentabilidade_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sustainability records of their farms"
ON public.sustentabilidade_registros FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM fazendas WHERE fazendas.id = sustentabilidade_registros.fazenda_id AND fazendas.user_id = auth.uid()
));

CREATE POLICY "Users can insert sustainability records in their farms"
ON public.sustentabilidade_registros FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM fazendas WHERE fazendas.id = sustentabilidade_registros.fazenda_id AND fazendas.user_id = auth.uid()
));

CREATE POLICY "Users can update sustainability records in their farms"
ON public.sustentabilidade_registros FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM fazendas WHERE fazendas.id = sustentabilidade_registros.fazenda_id AND fazendas.user_id = auth.uid()
));

CREATE POLICY "Users can delete sustainability records from their farms"
ON public.sustentabilidade_registros FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM fazendas WHERE fazendas.id = sustentabilidade_registros.fazenda_id AND fazendas.user_id = auth.uid()
));
