import { Button, Text } from "@react-email/components";

import { EmailLayout, styles } from "./_layout";

type Props = {
  inviterName: string;
  inviteUrl: string;
  expiryHours: number;
};

export function AdminInviteEmail({ inviterName, inviteUrl, expiryHours }: Props) {
  return (
    <EmailLayout preview="Undangan menjadi Administrator NextLevel Academy">
      <Text style={styles.heading}>Anda diundang sebagai Administrator</Text>
      <Text style={styles.paragraph}>
        {inviterName} mengundang Anda untuk menjadi Administrator di NextLevel
        Academy. Klik tombol di bawah untuk membuat akun dan menetapkan password
        Anda sendiri.
      </Text>
      <Button href={inviteUrl} style={styles.button}>
        Terima Undangan
      </Button>
      <Text style={{ ...styles.muted, marginTop: "20px" }}>
        Tautan ini berlaku selama {expiryHours} jam dan hanya bisa dipakai sekali.
      </Text>
      <Text style={styles.muted}>
        Jika Anda tidak mengenali undangan ini, abaikan saja email ini — tidak ada
        akun yang dibuat tanpa Anda menyelesaikan langkah di atas.
      </Text>
      <Text style={{ ...styles.muted, marginTop: "16px" }}>
        Atau salin tautan ini ke browser Anda:
      </Text>
      <Text style={styles.fallbackLink}>{inviteUrl}</Text>
    </EmailLayout>
  );
}

export default AdminInviteEmail;
