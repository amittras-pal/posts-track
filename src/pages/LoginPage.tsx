import {
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAt, IconLock } from "@tabler/icons-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);

      notifications.show({
        title: "Login successful",
        message: "Welcome back!",
        color: "green",
      });

      // Navigate to home page after successful login
      navigate("/");
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "An error occurred during login";

      // Handle common Firebase Auth error codes
      switch (error?.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password";
          break;
        default:
          errorMessage = error?.message || errorMessage;
      }

      notifications.show({
        title: "Login failed",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Center style={{ minHeight: "100vh", minWidth: "100vw" }}>
      <Card
        shadow="sm"
        padding="xl"
        radius="md"
        withBorder
        style={{ width: "100%", maxWidth: 400 }}
      >
        <Stack gap="lg">
          <Stack gap="xs" align="center">
            <Title order={2} c="violet">
              Welcome Back
            </Title>
            <Text size="sm" c="dimmed" ta="center">
              Sign in to your Instagram Tracker account
            </Text>
          </Stack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                leftSection={<IconAt size="0.9rem" />}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.email?.message}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                leftSection={<IconLock size="0.9rem" />}
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={errors.password?.message}
              />

              <Button
                type="submit"
                variant="gradient"
                gradient={{ from: "purple", to: "pink" }}
                loading={isLoading}
                disabled={isLoading}
                mt="md"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </form>

          <Stack gap="xs" align="center" mt="md">
            <Text size="xs" c="dimmed" style={{ cursor: "pointer" }}>
              Forgot your password?
            </Text>
          </Stack>
        </Stack>
      </Card>
    </Center>
  );
};

export default LoginPage;
