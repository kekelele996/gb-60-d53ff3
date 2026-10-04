export function generateOrderNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
}

export function generatePaymentNo(): string {
  return `PAY${generateOrderNo()}`;
}

export function generateShippingNo(): string {
  return `SH${generateOrderNo()}`;
}

export function generateCouponCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
}

export function calcPages(total: number, pageSize: number): number {
  if (total === 0) return 0;
  return Math.ceil(total / pageSize);
}
