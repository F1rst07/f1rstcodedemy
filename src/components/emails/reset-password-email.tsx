import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
    name: string;
    newPassword: string;
}

export const ResetPasswordEmail = ({ name, newPassword }: ResetPasswordEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>รีเซ็ตรหัสผ่าน F1RSTCODE DEMY</Preview>
            <Tailwind>
                <Body className="bg-white font-sans">
                    <Container className="mx-auto py-5 px-5 w-[580px]">
                        <Section className="bg-[#fbbf24] p-8 text-center rounded-t-lg">
                            <Heading className="text-black text-2xl font-bold m-0 p-0 leading-tight">
                                แจ้งเตือนการรีเซ็ตรหัสผ่าน
                                <br />
                                F1RSTCODE DEMY
                            </Heading>
                        </Section>

                        <Section className="bg-[#f9f9f9] border border-[#e5e5e5] border-t-0 rounded-b-lg p-8">
                            <Text className="text-base text-[#333333] mb-4">
                                สวัสดีคุณ {name}
                            </Text>

                            <Text className="text-base text-[#333333] mb-4">
                                เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ
                                <br />
                                นี่คือรหัสผ่านใหม่ชั่วคราวของคุณ:
                            </Text>

                            <Section className="bg-white border border-gray-200 rounded p-4 text-center my-6">
                                <Text className="text-2xl font-bold tracking-widest text-black m-0">
                                    {newPassword}
                                </Text>
                            </Section>

                            <Text className="text-base text-[#333333] mb-4">
                                กรุณาใช้รหัสผ่านนี้เพื่อเข้าสู่ระบบ และเราแนะนำให้คุณเปลี่ยนรหัสผ่านทันทีหลังจากเข้าใช้งานได้แล้ว
                            </Text>

                            <Text className="text-base text-[#333333] mb-4">
                                หากคุณไม่ได้เป็นผู้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาติดต่อทีมซัพพอร์ตทันที
                                <br />
                                ทีมงาน F1RSTCODE DEMY
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default ResetPasswordEmail;
