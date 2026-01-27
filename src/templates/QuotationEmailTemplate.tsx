import { Quotation } from 'api/quotations';
import { CompanyConfig, defaultCompanyConfig } from 'config/companyConfig';

interface QuotationEmailTemplateProps {
  quotation: Quotation;
  customMessage?: string;
  companyInfo?: CompanyConfig;
}

export const generateQuotationEmailHTML = ({ 
  quotation, 
  customMessage = '',
  companyInfo = defaultCompanyConfig
}: QuotationEmailTemplateProps): string => {
  
  const currentDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotización ${quotation.NumberQuotation}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .header .logo {
            max-width: 200px;
            max-height: 80px;
            margin-bottom: 15px;
            background-color: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px 20px;
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .quotation-info {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .quotation-info h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        
        .info-row:last-child {
            border-bottom: none;
            font-weight: bold;
            font-size: 18px;
            color: #667eea;
        }
        
        .info-label {
            font-weight: 600;
            color: #495057;
        }
        
        .info-value {
            color: #6c757d;
        }
        
        .custom-message {
            background-color: #e8f4fd;
            border: 1px solid #b8daff;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .custom-message h4 {
            color: #004085;
            margin-bottom: 10px;
        }
        
        .custom-message p {
            color: #004085;
            line-height: 1.5;
        }
        
        .attachment-info {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
        }
        
        .attachment-info i {
            font-size: 24px;
            color: #155724;
            margin-bottom: 10px;
        }
        
        .footer {
            background-color: #2c3e50;
            color: #fff;
            padding: 30px 20px;
            text-align: center;
        }
        
        .company-info {
            margin-bottom: 20px;
        }
        
        .company-info h3 {
            margin-bottom: 15px;
            color: #ecf0f1;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
        }
        
        .disclaimer {
            font-size: 12px;
            color: #95a5a6;
            border-top: 1px solid #34495e;
            padding-top: 15px;
            margin-top: 20px;
        }
        
        .button {
            display: inline-block;
            background-color: #667eea;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            margin: 15px 0;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .contact-info {
                flex-direction: column;
                align-items: center;
            }
            
            .info-row {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            ${companyInfo.logo ? `
            <img src="${companyInfo.logo}" alt="${companyInfo.name}" class="logo">
            ` : ''}
            <h1>${companyInfo.name}</h1>
            <p>Cotización Profesional</p>
        </div>
        
        <!-- Content -->
        <div class="content">
            <div class="greeting">
                Estimado/a <strong>${quotation.Customer?.Name} ${quotation.Customer?.LastName}</strong>,
            </div>
            
            <p>Esperamos que se encuentre bien. Nos complace enviarle la cotización solicitada con el detalle de los productos y servicios que pueden satisfacer sus necesidades.</p>
            
            <!-- Quotation Information -->
            <div class="quotation-info">
                <h3>📋 Información de la Cotización</h3>
                <div class="info-row">
                    <span class="info-label">Número de Cotización:</span>
                    <span class="info-value">${quotation.NumberQuotation}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha:</span>
                    <span class="info-value">${currentDate}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Asesor Comercial:</span>
                    <span class="info-value">${quotation.User?.Name} ${quotation.User?.LastNAme}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value">${quotation.Company?.Name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Subtotal:</span>
                    <span class="info-value">$${quotation.SubTotal?.toLocaleString('es-MX') || '0'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Impuestos:</span>
                    <span class="info-value">$${quotation.Tax?.toLocaleString('es-MX') || '0'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total:</span>
                    <span class="info-value">$${quotation.Total?.toLocaleString('es-MX') || '0'}</span>
                </div>
            </div>
            
            <!-- Custom Message -->
            ${customMessage ? `
            <div class="custom-message">
                <h4>💬 Mensaje Personalizado</h4>
                <p>${customMessage}</p>
            </div>
            ` : ''}
            
            <!-- Attachment Information -->
            <div class="attachment-info">
                <div style="font-size: 24px; margin-bottom: 10px;">📎</div>
                <strong>Cotización Adjunta</strong>
                <p>Hemos adjuntado el documento PDF con el detalle completo de su cotización.</p>
            </div>
            
            <!-- Payment Terms -->
            <div style="margin: 25px 0; padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
                <h4 style="color: #856404; margin-bottom: 15px;">💳 Condiciones de Pago</h4>
                <div style="color: #856404;">
                    ${quotation.AdvancePayment ? `<p><strong>Anticipo:</strong> ${quotation.AdvancePayment}</p>` : ''}
                    ${quotation.LiquidationPayment ? `<p><strong>Liquidación:</strong> ${quotation.LiquidationPayment}</p>` : ''}
                    ${quotation.TimeCredit ? `<p><strong>Tiempo de Crédito:</strong> ${quotation.TimeCredit}</p>` : ''}
                    ${quotation.TimeValidation ? `<p><strong>Vigencia:</strong> ${quotation.TimeValidation}</p>` : ''}
                </div>
            </div>
            
            <p>Si tiene alguna pregunta o requiere modificaciones, no dude en contactarnos. Estamos aquí para brindarle el mejor servicio y encontrar la solución perfecta para sus necesidades.</p>
            
            <p style="margin-top: 20px;">
                <strong>Agradecemos la oportunidad de trabajar con usted.</strong>
            </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <div class="company-info">
                <h3>${companyInfo.name}</h3>
                
                <div class="contact-info">
                    ${companyInfo.phone ? `
                    <div class="contact-item">
                        <span>📞</span>
                        <span>${companyInfo.phone}</span>
                    </div>
                    ` : ''}
                    
                    ${companyInfo.email ? `
                    <div class="contact-item">
                        <span>✉️</span>
                        <span>${companyInfo.email}</span>
                    </div>
                    ` : ''}
                    
                    ${companyInfo.website ? `
                    <div class="contact-item">
                        <span>🌐</span>
                        <span>${companyInfo.website}</span>
                    </div>
                    ` : ''}
                </div>
                
                ${companyInfo.address ? `
                <div style="margin-bottom: 15px;">
                    <span>📍</span> ${companyInfo.address}
                </div>
                ` : ''}
            </div>
            
            <div class="disclaimer">
                <p>Este correo electrónico contiene información confidencial. Si usted no es el destinatario previsto, por favor elimine este mensaje y notifique al remitente.</p>
                <p style="margin-top: 10px;">© ${new Date().getFullYear()} ${companyInfo.name}. Todos los derechos reservados.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
};

// Función para generar solo el texto plano (fallback)
export const generateQuotationEmailText = ({ 
  quotation, 
  customMessage = '',
  companyInfo = defaultCompanyConfig
}: QuotationEmailTemplateProps): string => {
  const currentDate = new Date().toLocaleDateString('es-MX');
  
  return `
COTIZACIÓN ${quotation.NumberQuotation}

Estimado/a ${quotation.Customer?.Name} ${quotation.Customer?.LastName},

Nos complace enviarle la cotización solicitada.

INFORMACIÓN DE LA COTIZACIÓN:
- Número: ${quotation.NumberQuotation}
- Fecha: ${currentDate}
- Asesor: ${quotation.User?.Name} ${quotation.User?.LastNAme}
- Empresa: ${quotation.Company?.Name}
- Subtotal: $${quotation.SubTotal?.toLocaleString('es-MX') || '0'}
- Impuestos: $${quotation.Tax?.toLocaleString('es-MX') || '0'}
- Total: $${quotation.Total?.toLocaleString('es-MX') || '0'}

${customMessage ? `\nMENSAJE PERSONALIZADO:\n${customMessage}\n` : ''}

CONDICIONES DE PAGO:
${quotation.AdvancePayment ? `- Anticipo: ${quotation.AdvancePayment}\n` : ''}
${quotation.LiquidationPayment ? `- Liquidación: ${quotation.LiquidationPayment}\n` : ''}
${quotation.TimeCredit ? `- Tiempo de Crédito: ${quotation.TimeCredit}\n` : ''}
${quotation.TimeValidation ? `- Vigencia: ${quotation.TimeValidation}\n` : ''}

Adjunto encontrará el documento PDF con el detalle completo.

Si tiene alguna pregunta, no dude en contactarnos.

Saludos cordiales,
${companyInfo.name}
${companyInfo.email}
${companyInfo.phone}
${companyInfo.website}
`;
};

export default generateQuotationEmailHTML;