import { Button, Text } from "@react-email/components";

import { EmailLayout, styles } from "./_layout";

type Props = {
  name: string;
  verifyUrl: string;
};

export function VerifyEmail({ name, verifyUrl }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <EmailLayout preview="Verifikasi alamat email NextLevel Academy kamu">
      <Text style={styles.heading}>Verifikasi email kamu</Text>
      <Text style={styles.paragraph}>
        Halo {firstName}, terima kasih sudah mendaftar di NextLevel Academy.
        Klik tombol di bawah untuk mengaktifkan akunmu.
      </Text>
      <Button href={verifyUrl} style={styles.button}>
        Verifikasi Email
      </Button>
      <Text style={{ ...styles.muted, marginTop: "20px" }}>
        Atau salin tautan ini ke browser kamu:
      </Text>
      <Text style={styles.fallbackLink}>{verifyUrl}</Text>
      <Text style={{ ...styles.muted, marginTop: "16px" }}>
        Jika kamu tidak membuat akun ini, abaikan saja email ini.
      </Text>
    </EmailLayout>
  );
}

export default VerifyEmail;
