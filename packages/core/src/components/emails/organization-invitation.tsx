import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type OrganizationInvitationEmailProps = {
  email: string;
  invitedByUsername: string;
  invitedByEmail: string;
  teamName: string;
  inviteLink: string;
};

const OrganizationInvitationEmail = (
  props: OrganizationInvitationEmailProps
) => {
  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Preview>You&apos;ve been invited to join {props.teamName}</Preview>
        <Body className="bg-gray-100 py-10 font-sans">
          <Container className="mx-auto max-w-150 rounded-xl bg-white p-10 shadow-sm">
            {/* Header */}
            <Section className="mb-8 text-center">
              <Heading className="m-0 mb-2 font-bold text-[28px] text-gray-900">
                You&apos;re invited!
              </Heading>
              <Text className="m-0 text-[16px] text-gray-600">
                Join {props.teamName} and start collaborating
              </Text>
            </Section>

            {/* Main Content */}
            <Section className="mb-8">
              <Text className="m-0 mb-4 text-[16px] text-gray-700">
                Hi there,
              </Text>
              <Text className="m-0 mb-4 text-[16px] text-gray-700">
                <strong>{props.invitedByUsername}</strong> (
                {props.invitedByEmail}) has invited you to join{" "}
                <strong>{props.teamName}</strong> on our platform.
              </Text>
              <Text className="m-0 mb-6 text-[16px] text-gray-700">
                Accept this invitation to start collaborating with your team
                members and access all the tools and resources available in your
                organization.
              </Text>
            </Section>

            {/* CTA Button */}
            <Section className="mb-8 text-center">
              <Button
                className="box-border inline-block rounded-[6px] bg-blue-600 px-6 py-3 font-medium text-[16px] text-white no-underline"
                href={props.inviteLink}
              >
                Accept Invitation
              </Button>
            </Section>

            {/* Alternative Link */}
            <Section className="mb-8">
              <Text className="m-0 mb-2 text-[14px] text-gray-600">
                If the button above doesn&apos;t work, you can also copy and
                paste this link into your browser:
              </Text>
              <Text className="m-0 break-all text-[14px]">
                <Link
                  className="text-blue-600 underline"
                  href={props.inviteLink}
                >
                  {props.inviteLink}
                </Link>
              </Text>
            </Section>

            {/* Additional Info */}
            <Section className="mb-6 border-gray-200 border-t pt-6">
              <Text className="m-0 mb-2 text-[14px] text-gray-600">
                <strong>Organization:</strong> {props.teamName}
              </Text>
              <Text className="m-0 mb-2 text-[14px] text-gray-600">
                <strong>Invited by:</strong> {props.invitedByUsername} (
                {props.invitedByEmail})
              </Text>
              <Text className="m-0 text-[14px] text-gray-600">
                <strong>Your email:</strong> {props.email}
              </Text>
            </Section>

            {/* Footer */}
            <Section className="border-gray-200 border-t pt-6">
              <Text className="m-0 mb-2 text-center text-[12px] text-gray-500">
                This invitation was sent to {props.email}. If you weren&apos;t
                expecting this invitation, you can safely ignore this email.
              </Text>
              <Text className="m-0 mb-2 text-center text-[12px] text-gray-500">
                © {new Date().getFullYear()} Your Company Name. All rights
                reserved.
              </Text>
              <Text className="m-0 text-center text-[12px] text-gray-500">
                123 Business Street, Suite 100, City, State 12345
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default OrganizationInvitationEmail;
