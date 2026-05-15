import { Button, Text } from "@react-email/components";

import { EmailLayout, styles } from "./_layout";

type Props = {
  name: string;
  resetUrl: string;
};

export function ResetPasswordEmail({ name, resetUrl }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <EmailLayout preview="Permintaan reset password NextLevel Academy">
      <Text style={styles.heading}>Atur ulang password kamu</Text>
      <Text style={styles.paragraph}>
        Halo {firstName}, kami menerima permintaan untuk mengatur ulang password
        akun NextLevel Academy kamu. Klik tombol di bawah untuk membuat password
        baru.
      </Text>
      <Button href={resetUrl} style={styles.button}>
        Reset Password
      </Button>
      <Text style={{ ...styles.muted, marginTop: "20px" }}>
        Tautan ini berlaku selama 1 jam dan hanya bisa dipakai sekali.
      </Text>
      <Text style={styles.muted}>
        Jika kamu tidak meminta reset password, abaikan email ini — password kamu
        tidak akan berubah.
      </Text>
      <Text style={{ ...styles.muted, marginTop: "16px" }}>
        Atau salin tautan ini ke browser kamu:
      </Text>
      <Text style={styles.fallbackLink}>{resetUrl}</Text>
    </EmailLayout>
  );
}

export default ResetPasswordEmail;
