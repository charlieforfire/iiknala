export interface ConfirmationEmailData {
  userName: string
  confirmUrl: string
}

export function accountConfirmationHtml({ userName, confirmUrl }: ConfirmationEmailData): string {
  const firstName = userName.split(' ')[0]

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirma tu cuenta — iiknala Yoga</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <img
                src="https://www.iiknalayoga.com/logo.png"
                alt="iiknala Yoga"
                width="140"
                style="display:block;height:auto;"
              />
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:40px 36px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">

              <p style="margin:0 0 8px;font-size:13px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:#4a6741;">
                Bienvenid@ a iiknala
              </p>
              <h1 style="margin:0 0 24px;font-size:26px;font-weight:300;color:#1c1917;line-height:1.3;">
                Hola, ${firstName} 🌿
              </h1>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#57534e;">
                Gracias por crear tu cuenta en <strong style="color:#1c1917;">iiknala</strong>.
                Ya puedes explorar nuestro horario y reservar tus clases favoritas.
              </p>
              <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#57534e;">
                Solo confirma tu cuenta con el botón de abajo y listo — ¡te esperamos en el mat!
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#4a6741;border-radius:12px;">
                    <a
                      href="${confirmUrl}"
                      style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.02em;"
                    >
                      Confirmar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:12px;color:#a8a29e;line-height:1.6;">
                Si no creaste esta cuenta, puedes ignorar este mensaje.<br/>
                El enlace expira en 24 horas.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:28px 0 8px;">
              <p style="margin:0 0 4px;font-size:15px;color:#78716c;">Hari Om 🙏</p>
              <p style="margin:0;font-size:12px;color:#a8a29e;">
                iiknala Yoga · Mérida, Yucatán
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function accountConfirmationText({ userName, confirmUrl }: ConfirmationEmailData): string {
  const firstName = userName.split(' ')[0]
  return `Hola ${firstName},

Gracias por crear tu cuenta en iiknala. Ya puedes explorar nuestro horario y reservar tus clases.

Confirma tu cuenta aquí: ${confirmUrl}

¡Te esperamos en el mat!

Hari Om 🙏
iiknala Yoga · Mérida, Yucatán`
}
