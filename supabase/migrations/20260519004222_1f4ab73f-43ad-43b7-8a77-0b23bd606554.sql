CREATE TABLE IF NOT EXISTS public.security_audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    resumo TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.security_audit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit reports" 
ON public.security_audit_reports FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own audit reports" 
ON public.security_audit_reports FOR DELETE 
USING (auth.uid() = user_id);
