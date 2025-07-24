import {
  Container,
  Title,
  Text,
  Stack,
  SimpleGrid,
  Card,
  Badge,
  Progress,
} from "@mantine/core";

// UNUSED

const DashboardPage = () => {
  // Mock data for demonstration
  const stats = [
    { label: "Total Posts", value: "127", change: "+12%", color: "blue" },
    { label: "Followers", value: "2.4K", change: "+5.2%", color: "green" },
    {
      label: "Engagement Rate",
      value: "3.8%",
      change: "+0.3%",
      color: "purple",
    },
    { label: "Avg. Likes", value: "89", change: "+15%", color: "orange" },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Title order={1} c="violet">
          Analytics Dashboard
        </Title>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {stats.map((stat, index) => (
            <Card key={index} shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={500}>
                  {stat.label}
                </Text>
                <Text size="xl" fw={700}>
                  {stat.value}
                </Text>
                <Badge color={stat.color} variant="light" size="sm">
                  {stat.change}
                </Badge>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Recent Performance</Title>
            <Stack gap="sm">
              <div>
                <Text size="sm" mb={4}>
                  Post Engagement
                </Text>
                <Progress value={75} color="purple" />
              </div>
              <div>
                <Text size="sm" mb={4}>
                  Story Views
                </Text>
                <Progress value={60} color="blue" />
              </div>
              <div>
                <Text size="sm" mb={4}>
                  Profile Visits
                </Text>
                <Progress value={45} color="green" />
              </div>
            </Stack>
          </Stack>
        </Card>

        <Text size="sm" c="dimmed" ta="center">
          💡 Connect your Instagram account to see real analytics data
        </Text>
      </Stack>
    </Container>
  );
};

export default DashboardPage;
