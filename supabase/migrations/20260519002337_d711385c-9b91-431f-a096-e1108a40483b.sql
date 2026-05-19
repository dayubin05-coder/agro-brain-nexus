-- Sustainability and ESG tracking
CREATE TABLE IF NOT EXISTS public.sustentabilidade_registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fazenda_id UUID REFERENCES public.fazendas(id) ON DELETE CASCADE NOT NULL,
    categoria TEXT NOT NULL CHECK (categoria IN ('ambiental', 'social', 'governanca')),
    indicador TEXT NOT NULL,
    valor NUMERIC NOT NULL,
    unidade TEXT NOT NULL,
    meta NUMERIC,
    observacoes TEXT,
    data TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.sustentabilidade_registros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all sustainability records" 
ON public.sustentabilidade_registros FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own sustainability records" 
ON public.sustentabilidade_registros FOR ALL 
USING (EXISTS (
    SELECT 1 FROM public.fazendas f 
    WHERE f.id = sustentabilidade_registros.fazenda_id 
    AND f.user_id = auth.uid()
));

-- Marketplace Tables
CREATE TABLE IF NOT EXISTS public.marketplace_anuncios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('venda', 'servico', 'maquina', 'transporte', 'consultoria')),
    titulo TEXT NOT NULL,
    descricao TEXT,
    preco TEXT NOT NULL,
    unidade TEXT,
    localizacao TEXT,
    categoria TEXT NOT NULL,
    imagem_url TEXT,
    status TEXT DEFAULT 'ativo' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.marketplace_anuncios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active announcements" 
ON public.marketplace_anuncios FOR SELECT 
USING (status = 'ativo');

CREATE POLICY "Users can manage their own announcements" 
ON public.marketplace_anuncios FOR ALL 
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.marketplace_propostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    anuncio_id UUID REFERENCES public.marketplace_anuncios(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    valor NUMERIC NOT NULL,
    mensagem TEXT,
    status TEXT DEFAULT 'pendente' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.marketplace_propostas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view proposals for their announcements or their own proposals" 
ON public.marketplace_propostas FOR SELECT 
USING (
    auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.marketplace_anuncios a WHERE a.id = anuncio_id AND a.user_id = auth.uid())
);

CREATE POLICY "Users can create proposals" 
ON public.marketplace_propostas FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- AI Chat Memory
CREATE TABLE IF NOT EXISTS public.ai_chat_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.ai_chat_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access their own chat history" 
ON public.ai_chat_memory FOR ALL 
USING (auth.uid() = user_id);
