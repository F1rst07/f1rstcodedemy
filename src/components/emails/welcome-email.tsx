import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
    name: string;
    email: string;
}

export const WelcomeEmail = ({ name, email }: WelcomeEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>ยินดีต้อนรับเข้าสู่ F1RSTCODE DEMY</Preview>
            <Tailwind>
                <Body className="bg-white font-sans">
                    <Container className="mx-auto py-5 px-5 w-[580px]">
                        <Section className="bg-[#fbbf24] p-8 text-center rounded-t-lg">
                            <Heading className="text-black text-2xl font-bold m-0 p-0 leading-tight">
                                ยินดีต้อนรับเข้าสู่ F1RSTCODE DEMY
                                <br />
                                เริ่มต้นการเรียนรู้วิชาคอมพิวเตอร์ !
                            </Heading>
                        </Section>

                        <Section className="bg-[#f9f9f9] border border-[#e5e5e5] border-t-0 rounded-b-lg p-8">
                            <Text className="text-base text-[#333333] mb-4">
                                สวัสดีคุณ {name}
                            </Text>

                            <Text className="text-base text-[#333333] mb-4">
                                คุณได้สมัครเป็นสมาชิกกับ F1RSTCODE DEMY 🎉
                                <br />
                                บัญชีผู้ใช้ของคุณได้ถูกสร้างเรียบร้อยแล้ว
                            </Text>

                            <Text className="text-base text-[#333333] font-bold mb-4">
                                Account ID: {email}
                            </Text>

                            <Text className="text-base text-[#333333] mb-4">
                                ขอบคุณที่ร่วมเป็นส่วนหนึ่งของชุมชนการเรียนรู้กับเรา
                                <br />
                                ทีมงาน F1RSTCODE DEMY
                            </Text>


                        </Section>

                        <Section className="text-center mt-4">

                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default WelcomeEmail;
