import { Text } from "@react-email/components";

import { EmailLayout, styles } from "./_layout";

type Props = {
  name: string;
  /** The new (now-active) email address. */
  newEmail: string;
};

/**
 * Informational notice sent to the NEW address after an email change is
 * verified and applied (PRD §6.1.4). Not a confirmation step — the address is
 * already active by the time this arrives; this just lets the owner know.
 */
export function EmailChangedEmail({ name, newEmail }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <EmailLayout preview="Email akun NextLevel Academy berhasil diperbarui">
      <Text style={styles.heading}>Email akunmu telah diperbarui</Text>
      <Text style={styles.paragraph}>
        Halo {firstName}, alamat email{" "}
        <strong>{newEmail}</strong> kini terdaftar dan aktif untuk akun
        NextLevel Academy kamu. Mulai sekarang seluruh notifikasi dikirim ke
        alamat ini.
      </Text>
      <Text style={styles.muted}>
        Jika kamu tidak melakukan perubahan ini, segera hubungi tim dukungan
        NextLevel Academy untuk mengamankan akunmu.
      </Text>
    </EmailLayout>
  );
}

export default EmailChangedEmail;
