import {
  ActionIcon,
  Badge,
  Grid,
  Group,
  Image,
  Stack,
  Text,
  Tooltip
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCopy } from "@tabler/icons-react";
import { InstagramPost, PostStatus } from "../types";
import { getPostStatus } from "../utils/postUtils";

interface PostDetailsViewProps {
  post: InstagramPost;
}

const PostDetailsView = ({ post }: PostDetailsViewProps) => {
  const getStatusBadge = (post: InstagramPost) => {
    const status = getPostStatus(post);
    const colors: Record<PostStatus, string> = {
      draft: "gray",
      scheduled: "blue",
      posted: "green",
      all: "gray",
    };

    return (
      <Badge color={colors[status]} variant="light" size="sm">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleCopyCaption = async () => {
    if (!post.caption) {
      notifications.show({
        title: "Nothing to Copy",
        message: "No caption available to copy",
        color: "orange",
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(post.caption);
      notifications.show({
        title: "Copied!",
        message: "Caption copied to clipboard",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to copy caption:", error);
      notifications.show({
        title: "Copy Failed",
        message: "Failed to copy caption to clipboard",
        color: "red",
      });
    }
  };

  const handleCopyHashtags = async () => {
    if (post.hashtags.length === 0) {
      notifications.show({
        title: "Nothing to Copy",
        message: "No hashtags available to copy",
        color: "orange",
      });
      return;
    }

    try {
      const hashtagsText = post.hashtags.map((tag) => `#${tag}`).join(" ");
      await navigator.clipboard.writeText(hashtagsText);
      notifications.show({
        title: "Copied!",
        message: "Hashtags copied to clipboard",
        color: "green",
      });
    } catch (error) {
      console.error("Failed to copy hashtags:", error);
      notifications.show({
        title: "Copy Failed",
        message: "Failed to copy hashtags to clipboard",
        color: "red",
      });
    }
  };

  return (
    <Stack gap="lg">
      {/* Status */}
      <Group>
        <Text fw={600}>Status:</Text>
        {getStatusBadge(post)}
      </Group>

      {/* Caption */}
      <Stack gap="xs">
        <Group>
          <Text fw={600}>Caption:</Text>
          {post.caption && (
            <Tooltip label="Copy caption">
              <ActionIcon
                variant="light"
                color="gray"
                size="sm"
                onClick={handleCopyCaption}
              >
                <IconCopy size="0.8rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
          {post.caption || "No caption"}
        </Text>
      </Stack>

      {/* Files */}
      <Stack gap="xs">
        <Text fw={600}>Files ({post.fileName.length}):</Text>
        {post.fileName.length > 0 ? (
          <Grid gutter="md">
            {post.files.map((fileUrl, index) => (
              <Grid.Col key={index} span={6}>
                <Image
                  src={fileUrl}
                  alt={`Post image ${index + 1}`}
                  radius="md"
                  fit="cover"
                  h={200}
                  fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+"
                  style={{
                    border: "1px solid #e0e0e0",
                    cursor: "pointer",
                  }}
                  onClick={() => window.open(fileUrl, "_blank")}
                />
              </Grid.Col>
            ))}
          </Grid>
        ) : (
          <Text size="sm" c="dimmed">
            No files
          </Text>
        )}
      </Stack>

      {/* Hashtags */}
      <Stack gap="xs">
        <Group>
          <Text fw={600}>Hashtags ({post.hashtags.length}):</Text>
          {post.hashtags.length > 0 && (
            <Tooltip label="Copy hashtags">
              <ActionIcon
                variant="light"
                color="gray"
                size="sm"
                onClick={handleCopyHashtags}
              >
                <IconCopy size="0.8rem" />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
        {post.hashtags.length > 0 ? (
          <Group gap="xs">
            {post.hashtags.map((hashtag, index) => (
              <Badge key={index} variant="light" color="blue" size="sm">
                #{hashtag}
              </Badge>
            ))}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            No hashtags
          </Text>
        )}
      </Stack>

      {/* People to Tag */}
      <Stack gap="xs">
        <Text fw={600}>People to Tag ({post.peopleToTag.length}):</Text>
        {post.peopleToTag.length > 0 ? (
          <Group gap="xs">
            {post.peopleToTag.map((person, index) => (
              <Badge key={index} variant="light" color="green" size="sm">
                @{person}
              </Badge>
            ))}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            No people to tag
          </Text>
        )}
      </Stack>

      {/* Dates */}
      <Stack gap="xs">
        <Text fw={600}>Dates:</Text>
        <Stack gap="xs">
          <Group>
            <Text size="sm" fw={500}>
              Created:
            </Text>
            <Text size="sm">
              {post.createdAt
                ? new Intl.DateTimeFormat("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(post.createdAt)
                : "Not set"}
            </Text>
          </Group>

          {post.scheduledFor && (
            <Group>
              <Text size="sm" fw={500}>
                Scheduled for:
              </Text>
              <Text size="sm">
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(post.scheduledFor)}
              </Text>
            </Group>
          )}

          {post.postedAt && (
            <Group>
              <Text size="sm" fw={500}>
                Posted on:
              </Text>
              <Text size="sm" c="green">
                {new Intl.DateTimeFormat("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(post.postedAt)}
              </Text>
            </Group>
          )}
        </Stack>
      </Stack>

      {/* Notes */}
      {post.notes && (
        <Stack gap="xs">
          <Text fw={600}>Notes:</Text>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {post.notes}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};

export default PostDetailsView;
