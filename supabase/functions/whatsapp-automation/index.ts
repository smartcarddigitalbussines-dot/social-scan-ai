import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendRequest {
  phone: string;
  message: string;
  leadName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, leadName } = await req.json() as SendRequest;

    console.log(`[WhatsApp Automation] Processando envio para ${leadName} (${phone})`);

    // Validação básica
    if (!phone || !message) {
      throw new Error('Phone and message are required');
    }

    // Limpar número de telefone
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;

    // NOTA: Implementação real de automação com Puppeteer/Playwright requer:
    // 1. Instalação de dependências de navegador no ambiente Deno
    // 2. Configuração de headless browser
    // 3. Login no WhatsApp Web (QR code ou sessão salva)
    // 4. Navegação e envio automatizado
    
    // Por limitações do ambiente Deno/Supabase Edge Functions, 
    // esta implementação retorna instruções para uso de WhatsApp Business API
    
    // Alternativa recomendada: WhatsApp Business API
    const whatsappBusinessApiUrl = "https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages";
    
    // Para usar a API oficial, você precisará:
    // 1. Criar uma conta WhatsApp Business
    // 2. Obter um token de acesso
    // 3. Configurar o número de telefone
    
    // Exemplo de chamada para WhatsApp Business API (comentado):
    /*
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_BUSINESS_TOKEN');
    
    const response = await fetch(whatsappBusinessApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneWithCountry,
        type: "text",
        text: {
          body: message
        }
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${JSON.stringify(result)}`);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        messageId: result.messages[0].id,
        leadName,
        phone: phoneWithCountry
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    */

    // Simulação de envio bem-sucedido para desenvolvimento
    // IMPORTANTE: Substituir por implementação real
    console.log(`[WhatsApp Automation] Simulando envio para ${phoneWithCountry}`);
    console.log(`[WhatsApp Automation] Mensagem: ${message.substring(0, 50)}...`);

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(
      JSON.stringify({
        success: true,
        messageId: `sim_${Date.now()}`,
        leadName,
        phone: phoneWithCountry,
        warning: 'Esta é uma simulação. Configure WhatsApp Business API para envios reais.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[WhatsApp Automation] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
