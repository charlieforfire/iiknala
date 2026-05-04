interface PackageEmailData {
  userName: string
  packageName: string
  classesTotal: number | null
  expiresAt: string | null
  paymentMethod: string
  packageId: string
}

const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function fmtDate(str: string) {
  const d = new Date(str + 'T12:00:00')
  return `${d.getDate()} de ${meses[d.getMonth()]} ${d.getFullYear()}`
}

function paymentLabel(method: string) {
  if (method?.startsWith('cs_')) return 'Tarjeta (Stripe)'
  if (method === 'transferencia') return 'Transferencia bancaria'
  if (method === 'efectivo') return 'Efectivo en estudio'
  return method ?? '—'
}

export function packageConfirmedHtml(data: PackageEmailData) {
  const { userName, packageName, classesTotal, expiresAt, paymentMethod, packageId } = data
  const classesLabel = classesTotal ? `${classesTotal} clases` : 'Clases ilimitadas'
  const expiryLabel = expiresAt ? fmtDate(expiresAt) : 'Sin fecha límite'
  const receiptUrl = `https://www.iiknalayoga.com/recibo/paquete/${packageId}`

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#4a6741;padding:36px 40px;text-align:center;">
            <p style="margin:0;color:#c5d4c0;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:500;">iiknala yoga</p>
            <p style="margin:10px 0 0;color:#ffffff;font-size:22px;font-weight:300;letter-spacing:1px;">Paquete activado ✓</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;font-size:15px;color:#57534e;">Hola <strong style="color:#1c1917;">${userName}</strong>, tu paquete está activo.</p>

            <!-- Package card -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ee;border-radius:12px;margin-bottom:28px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#4a6741;font-weight:600;letter-spacing:2px;text-transform:uppercase;">Paquete</p>
                  <p style="margin:0 0 20px;font-size:20px;font-weight:400;color:#1c1917;">${packageName}</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td width="50%" style="padding-right:12px;">
                        <p style="margin:0 0 3px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px;">Clases incluidas</p>
                        <p style="margin:0;font-size:14px;color:#1c1917;font-weight:500;">${classesLabel}</p>
                      </td>
                      <td width="50%">
                        <p style="margin:0 0 3px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px;">Vigencia hasta</p>
                        <p style="margin:0;font-size:14px;color:#1c1917;font-weight:500;">${expiryLabel}</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Payment -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e7e5e4;">
              <tr>
                <td style="padding-top:20px;padding-bottom:28px;">
                  <p style="margin:0 0 3px;font-size:11px;color:#a8a29e;text-transform:uppercase;letter-spacing:1px;">Método de pago</p>
                  <p style="margin:0;font-size:14px;color:#1c1917;font-weight:500;">${paymentLabel(paymentMethod)}</p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${receiptUrl}" style="display:inline-block;background:#4a6741;color:#ffffff;text-decoration:none;padding:13px 32px;border-radius:10px;font-size:14px;font-weight:500;letter-spacing:0.5px;">Ver recibo completo</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#fafaf9;border-top:1px solid #f0efed;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#a8a29e;">iiknala yoga · Mérida, Yucatán</p>
            <p style="margin:0;font-size:12px;color:#a8a29e;">
              <a href="https://www.instagram.com/iiknala/" style="color:#4a6741;text-decoration:none;">@iiknala</a>
              &nbsp;·&nbsp;
              <a href="https://www.iiknalayoga.com" style="color:#4a6741;text-decoration:none;">iiknalayoga.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export function packageConfirmedSubject(packageName: string) {
  return `Paquete activado — ${packageName} · iiknala yoga`
}
