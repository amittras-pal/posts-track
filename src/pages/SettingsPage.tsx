import {
  Container,
  Title,
  Stack,
  Card,
  Switch,
  Select,
  Button,
  Divider,
} from "@mantine/core";
import { useState } from "react";

// UNUSED

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [trackingFrequency, setTrackingFrequency] = useState("daily");

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Title order={1} c="violet">
          Settings
        </Title>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Notifications</Title>

            <Switch
              label="Email Notifications"
              description="Receive analytics reports via email"
              checked={emailNotifications}
              onChange={(event) =>
                setEmailNotifications(event.currentTarget.checked)
              }
            />

            <Switch
              label="Push Notifications"
              description="Get real-time alerts for significant changes"
              checked={pushNotifications}
              onChange={(event) =>
                setPushNotifications(event.currentTarget.checked)
              }
            />
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Tracking Settings</Title>

            <Select
              label="Data Refresh Frequency"
              description="How often to update your analytics data"
              value={trackingFrequency}
              onChange={(value) => setTrackingFrequency(value || "daily")}
              data={[
                { value: "hourly", label: "Every Hour" },
                { value: "daily", label: "Daily" },
                { value: "weekly", label: "Weekly" },
              ]}
            />
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3}>Account</Title>

            <Button variant="outline" color="blue">
              Export Data
            </Button>

            <Divider />

            <Button variant="outline" color="red">
              Delete Account
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
};

export default SettingsPage;
