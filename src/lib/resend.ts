import { Resend } from 'resend'

export const FROM = 'iiknala Yoga <hola@iiknalayoga.com>'

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? 'placeholder')
}
