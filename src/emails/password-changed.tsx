import { Text } from "@react-email/components";

import { EmailLayout, styles } from "./_layout";

type Props = {
  name: string;
  /** ISO timestamp; formatted by Resend on render. */
  changedAt: string;
};

export function PasswordChangedEmail({ name, changedAt }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <EmailLayout preview="Password akun NextLevel Academy berhasil diubah">
      <Text style={styles.heading}>Password kamu telah diubah</Text>
      <Text style={styles.paragraph}>
        Halo {firstName}, password akun NextLevel Academy kamu berhasil diubah
        pada {new Date(changedAt).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB.
      </Text>
      <Text style={styles.paragraph}>
        Jika perubahan ini dilakukan oleh kamu, tidak ada yang perlu dilakukan
        lebih lanjut.
      </Text>
      <Text style={styles.muted}>
        Jika kamu tidak melakukan perubahan ini, segera hubungi tim dukungan
        NextLevel Academy untuk mengamankan akunmu.
      </Text>
    </EmailLayout>
  );
}

export default PasswordChangedEmail;
