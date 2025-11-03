-- Add social and contact fields to leads table
ALTER TABLE public.leads
ADD COLUMN whatsapp TEXT,
ADD COLUMN facebook TEXT,
ADD COLUMN instagram TEXT,
ADD COLUMN linkedin TEXT,
ADD COLUMN twitter TEXT,
ADD COLUMN endereco TEXT,
ADD COLUMN cidade TEXT,
ADD COLUMN estado TEXT,
ADD COLUMN cep TEXT,
ADD COLUMN data_nascimento DATE,
ADD COLUMN profissao TEXT,
ADD COLUMN tipo_veiculo TEXT,
ADD COLUMN placa_veiculo TEXT,
ADD COLUMN preferencias TEXT,
ADD COLUMN ultima_compra DATE,
ADD COLUMN valor_total_gasto DECIMAL(10,2) DEFAULT 0;