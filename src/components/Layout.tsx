import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Group,
  NavLink,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconListCheck,
  IconLogout,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";
import { signOut } from "firebase/auth";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();

  const navItems = [{ icon: IconListCheck, label: "Posts List", path: "/" }];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      notifications.show({
        title: "Logged out",
        message: "You have been successfully logged out",
        color: "green",
      });
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      notifications.show({
        title: "Logout failed",
        message: "An error occurred while logging out",
        color: "red",
      });
    }
  };

  return (
    <AppShell
      navbar={{
        width: 250,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened },
      }}
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
            />
            <Title order={3} c="violet">
              Posts Tracker
            </Title>
          </Group>

          <ActionIcon
            onClick={() => toggleColorScheme()}
            variant="default"
            size="lg"
            aria-label="Toggle color scheme"
          >
            {colorScheme === "dark" ? (
              <IconSun size="1.1rem" />
            ) : (
              <IconMoon size="1.1rem" />
            )}
          </ActionIcon>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack justify="space-between" style={{ height: "100%" }}>
          <div>
            <Text fw={500} size="sm" c="dimmed" mb="sm">
              NAVIGATION
            </Text>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                component={Link}
                to={item.path}
                label={item.label}
                leftSection={<item.icon size="1rem" stroke={1.5} />}
                active={location.pathname === item.path}
                variant="light"
                color="violet"
                onClick={() => {
                  // Close mobile menu when navigation item is clicked
                  if (mobileOpened) {
                    toggleMobile();
                  }
                }}
              />
            ))}
          </div>

          <Button
            variant="light"
            color="red"
            leftSection={<IconLogout size="1rem" />}
            onClick={handleLogout}
            fullWidth
          >
            Logout
          </Button>
        </Stack>
      </AppShell.Navbar>

      <AppShell.Main>
        <div style={{ maxWidth: "100%", overflow: "hidden" }}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
};

export default Layout;
