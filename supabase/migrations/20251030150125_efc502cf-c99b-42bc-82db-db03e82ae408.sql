
-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  company TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policy for leads (public access for now - can be restricted later with auth)
CREATE POLICY "Allow all access to leads" 
ON public.leads 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create message_history table
CREATE TABLE public.message_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.message_history ENABLE ROW LEVEL SECURITY;

-- Create policy for message_history
CREATE POLICY "Allow all access to message_history" 
ON public.message_history 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create message_templates table
CREATE TABLE public.message_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Create policy for message_templates
CREATE POLICY "Allow all access to message_templates" 
ON public.message_templates 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default message templates
INSERT INTO public.message_templates (name, content, variables) VALUES
('Boas-vindas', 'Olá {name}! 👋 Bem-vindo(a) à nossa plataforma. Estamos felizes em ter você conosco!', ARRAY['name']),
('Follow-up', 'Olá {name}, tudo bem? Gostaria de saber se você tem interesse em conhecer mais sobre {company}. Podemos agendar uma conversa?', ARRAY['name', 'company']),
('Promoção', 'Oi {name}! 🎉 Temos uma oferta especial para você. Entre em contato para saber mais!', ARRAY['name']);
