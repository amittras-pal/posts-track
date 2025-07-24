import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Button,
  Avatar,
  Group,
  Badge,
} from "@mantine/core";

// UNUSED

const ProfilePage = () => {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1} c="violet">
          Profile Management
        </Title>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group>
              <Avatar
                size="lg"
                src="https://via.placeholder.com/100x100?text=IG"
                alt="Instagram Profile"
              />
              <div>
                <Text fw={500}>@your_instagram_handle</Text>
                <Text size="sm" c="dimmed">
                  Connected Account
                </Text>
                <Badge color="green" variant="light" size="sm">
                  Active
                </Badge>
              </div>
            </Group>

            <Group>
              <Button variant="outline" color="violet">
                Refresh Data
              </Button>
              <Button variant="light" color="red">
                Disconnect
              </Button>
            </Group>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Add New Profile</Title>
            <Text size="sm" c="dimmed">
              Connect additional Instagram accounts to track multiple profiles.
            </Text>
            <Button
              variant="gradient"
              gradient={{ from: "purple", to: "pink" }}
              w="fit-content"
            >
              Connect Instagram Account
            </Button>
          </Stack>
        </Card>

        <Text size="sm" c="dimmed" ta="center">
          🔐 Your account data is secure and encrypted
        </Text>
      </Stack>
    </Container>
  );
};

export default ProfilePage;
